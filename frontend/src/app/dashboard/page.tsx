'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useDashboardStore } from '@/store/dashboard';
import { deviceApi, alertApi } from '@/lib/api';
import { initWebSocket, closeWebSocket } from '@/lib/websocket';
import { Card, Badge, Alert } from '@/components/UI';
import { DeviceCard } from '@/components/Device';
import { AlertsList } from '@/components/Alert';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    stats,
    devices,
    alerts,
    loading,
    error,
    setStats,
    setDevices,
    setAlerts,
    setLoading,
    setError,
    resolveAlert,
  } = useDashboardStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
    const ws = initWebSocket();

    return () => {
      closeWebSocket();
    };
  }, [isAuthenticated]);

  async function loadData() {
    setLoading(true);
    try {
      const [dashboardData, devicesData, alertsData] = await Promise.all([
        deviceApi.getDashboard(),
        deviceApi.getDevices(1, 100),
        alertApi.getAlerts(1, 10),
      ]);

      setStats(dashboardData.stats);
      setDevices(dashboardData.stats ? [dashboardData] : devicesData.devices);
      setAlerts(alertsData.alerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolveAlert(alertId: string) {
    try {
      await alertApi.resolveAlert(alertId);
      resolveAlert(alertId);
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  }

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your monitoring overview.</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wider">Total Devices</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalDevices}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wider">Online</p>
              <p className="text-4xl font-bold text-green-600">{stats.onlineDevices}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wider">Offline</p>
              <p className="text-4xl font-bold text-red-600">{stats.offlineDevices}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wider">Critical Alerts</p>
              <p className="text-4xl font-bold text-orange-600">{stats.criticalAlerts}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Alerts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Alerts</h2>
        <AlertsList alerts={alerts.slice(0, 5)} onResolve={handleResolveAlert} />
      </div>

      {/* Devices Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Devices</h2>
          <a
            href="/devices"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.slice(0, 6).map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
        {devices.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-500">No devices yet. Install agents to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
