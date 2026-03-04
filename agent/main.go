package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

// Config holds agent configuration
type Config struct {
	APIKey   string
	APIUrl   string
	Interval int
	DeviceID string
}

// SystemMetrics represents system metrics
type SystemMetrics struct {
	DeviceID  string  `json:"deviceId"`
	CPU       float64 `json:"cpu"`
	RAM       float64 `json:"ram"`
	Disk      float64 `json:"disk"`
	OSVersion string  `json:"osVersion"`
}

// Agent manages the monitoring client
type Agent struct {
	config     Config
	client     *http.Client
	logger     *log.Logger
	ctx        context.Context
	cancel     context.CancelFunc
	wg         sync.WaitGroup
	isRunning  bool
	runningMux sync.Mutex
}

// NewAgent creates a new agent instance
func NewAgent(config Config) *Agent {
	ctx, cancel := context.WithCancel(context.Background())
	
	// Create HTTP client with custom transport (skip SSL verification for self-signed certs)
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}

	return &Agent{
		config: config,
		client: client,
		logger: log.New(os.Stdout, "[DATTO-AGENT] ", log.LstdFlags),
		ctx:    ctx,
		cancel: cancel,
	}
}

// Start begins the monitoring loop
func (a *Agent) Start() {
	a.runningMux.Lock()
	if a.isRunning {
		a.runningMux.Unlock()
		return
	}
	a.isRunning = true
	a.runningMux.Unlock()

	a.logger.Printf("🚀 Starting DATTO Agent")
	a.logger.Printf("📍 API URL: %s", a.config.APIUrl)
	a.logger.Printf("🔄 Heartbeat Interval: %d seconds", a.config.Interval)

	// Start heartbeat loop
	a.wg.Add(1)
	go a.heartbeatLoop()

	// Wait for shutdown signal
	a.waitForShutdown()
}

// heartbeatLoop sends metrics periodically
func (a *Agent) heartbeatLoop() {
	defer a.wg.Done()

	ticker := time.NewTicker(time.Duration(a.config.Interval) * time.Second)
	defer ticker.Stop()

	// Send first heartbeat immediately
	a.sendHeartbeat()

	for {
		select {
		case <-a.ctx.Done():
			a.logger.Println("⏹️  Heartbeat loop stopped")
			return
		case <-ticker.C:
			a.sendHeartbeat()
		}
	}
}

// sendHeartbeat collects and sends system metrics
func (a *Agent) sendHeartbeat() {
	metrics, err := a.collectMetrics()
	if err != nil {
		a.logger.Printf("❌ Failed to collect metrics: %v", err)
		return
	}

	err = a.sendMetrics(metrics)
	if err != nil {
		a.logger.Printf("❌ Failed to send metrics: %v", err)
		return
	}

	a.logger.Printf("✅ Heartbeat sent - CPU: %.1f%%, RAM: %.1f%%, Disk: %.1f%%",
		metrics.CPU, metrics.RAM, metrics.Disk)
}

// collectMetrics gathers system information
func (a *Agent) collectMetrics() (*SystemMetrics, error) {
	metrics := &SystemMetrics{
		DeviceID: a.config.DeviceID,
	}

	// Get CPU usage (percentage over last second)
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, fmt.Errorf("failed to get CPU: %w", err)
	}
	if len(cpuPercent) > 0 {
		metrics.CPU = cpuPercent[0]
	}

	// Get memory usage
	memInfo, err := mem.VirtualMemory()
	if err != nil {
		return nil, fmt.Errorf("failed to get memory: %w", err)
	}
	metrics.RAM = memInfo.UsedPercent

	// Get disk usage (C: drive on Windows, or / on Linux)
	diskPath := "C:"
	if os.Geteuid() >= 0 { // Unix-like system
		diskPath = "/"
	}
	diskInfo, err := disk.Usage(diskPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get disk: %w", err)
	}
	metrics.Disk = diskInfo.UsedPercent

	// Get OS version
	hostInfo, err := host.Info()
	if err == nil {
		metrics.OSVersion = fmt.Sprintf("%s %s (%s)", hostInfo.OS, hostInfo.PlatformVersion, hostInfo.KernelVersion)
	}

	return metrics, nil
}

// sendMetrics sends metrics to the backend API
func (a *Agent) sendMetrics(metrics *SystemMetrics) error {
	// Prepare request body
	bodyBytes, err := json.Marshal(metrics)
	if err != nil {
		return fmt.Errorf("failed to marshal metrics: %w", err)
	}

	// Create request
	req, err := http.NewRequestWithContext(
		a.ctx,
		http.MethodPost,
		fmt.Sprintf("%s/devices/heartbeat", a.config.APIUrl),
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", a.config.APIKey)

	// Send request
	resp, err := a.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	return nil
}

// waitForShutdown blocks until a shutdown signal is received
func (a *Agent) waitForShutdown() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	a.logger.Println("📭 Shutdown signal received, stopping agent...")
	a.Stop()
}

// Stop gracefully stops the agent
func (a *Agent) Stop() {
	a.runningMux.Lock()
	defer a.runningMux.Unlock()

	if !a.isRunning {
		return
	}

	a.isRunning = false
	a.cancel()
	a.wg.Wait()
	a.logger.Println("✅ Agent stopped")
}

func main() {
	// Parse command line flags
	apiKey := flag.String("key", "", "API Key (required)")
	apiUrl := flag.String("api", "http://localhost:3000/api/v1", "API URL")
	interval := flag.Int("interval", 30, "Heartbeat interval in seconds")
	deviceID := flag.String("device", "", "Device ID (auto-generated if not provided)")

	flag.Parse()

	// Validate required parameters
	if *apiKey == "" {
		fmt.Println("Error: API key is required")
		fmt.Println("\nUsage: datto-agent -key YOUR_API_KEY [-api URL] [-interval SECONDS] [-device DEVICE_ID]")
		fmt.Println("\nExample:")
		fmt.Println("  datto-agent -key key_abc123xyz -api https://rmm.company.com/api/v1")
		os.Exit(1)
	}

	// Generate device ID if not provided
	if *deviceID == "" {
		hostname, err := os.Hostname()
		if err != nil {
			*deviceID = fmt.Sprintf("agent-%d", time.Now().Unix())
		} else {
			*deviceID = hostname
		}
	}

	// Create and start agent
	config := Config{
		APIKey:   *apiKey,
		APIUrl:   *apiUrl,
		Interval: *interval,
		DeviceID: *deviceID,
	}

	agent := NewAgent(config)
	agent.Start()
}
