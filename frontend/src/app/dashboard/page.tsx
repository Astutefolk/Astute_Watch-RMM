'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useDashboardStore } from '@/store/dashboard';
import { deviceApi, alertApi } from '@/lib/api';
import { initWebSocket, closeWebSocket } from '@/lib/websocket';
import { Container, StatCard, Card, Badge, Alert, Button, Tabs, Skeleton } from '@/components/UIEnhanced';
import { useRouter } from 'next/navigation';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');

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

  const systemHealth = stats
    ? Math.round((stats.onlineDevices / (stats.totalDevices || 1)) * 100)
    : 0;

  return (
    <Container className="py-8 space-y-8">
      {/* Header Section */}
      <div className="animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor and manage your entire endpoint infrastructure
            </p>
          </div>
          <Button onClick={loadData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="danger"
          title="Error loading dashboard"
          icon={<AlertTriangle className="w-5 h-5" />}
        >
          {error}
        </Alert>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Devices"
              value={stats?.totalDevices || 0}
              icon={<Activity className="w-6 h-6" />}
              trend="+2.5%"
              color="primary"
            />
            <StatCard
              label="Online Devices"
              value={stats?.onlineDevices || 0}
              icon={<CheckCircle className="w-6 h-6" />}
              subtext={stats?.totalDevices ? `${Math.round((stats.onlineDevices / stats.totalDevices) * 100)}% of total` : 'N/A'}
              color="success"
            />
            <StatCard
              label="Offline Devices"
              value={stats?.offlineDevices || 0}
              icon={<XCircle className="w-6 h-6" />}
              subtext={stats?.offlineDevices ? 'Requires attention' : 'All online'}
              color="danger"
            />
            <StatCard
              label="Critical Alerts"
              value={stats?.criticalAlerts || 0}
              icon={<AlertTriangle className="w-6 h-6" />}
              trend={stats?.criticalAlerts ? '-1 today' : 'No alerts'}
              color="warning"
            />
          </>
        )}
      </div>

      {/* System Health */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' } as React.CSSProperties}>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            System Health
          </h2>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Overall Status</span>
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{systemHealth}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                systemHealth >= 90
                  ? 'bg-green-500'
                  : systemHealth >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${systemHealth}%`,
              } as React.CSSProperties}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {systemHealth >= 90
              ? 'All systems operating normally'
              : systemHealth >= 70
              ? 'Some attention required'
              : 'Critical attention needed'}
          </p>
        </Card.Content>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" onChange={setActiveTab} className="animate-slide-up" style={{ animationDelay: '200ms' } as React.CSSProperties}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="alerts">Alerts</Tabs.Trigger>
          <Tabs.Trigger value="devices">Devices</Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="secondary" className="w-full">
                  + Add Device
                </Button>
                <Button variant="secondary" className="w-full">
                  Run Report
                </Button>
                <Button variant="secondary" className="w-full">
                  View Documentation
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* Recent Activity */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {alerts?.slice(0, 5).map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {alert.severity === 'CRITICAL' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : alert.severity === 'WARNING' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Activity className="w-5 h-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{alert.title || alert.message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{alert.deviceName || 'System'}</p>
                      </div>
                    </div>
                    <Badge variant={alert.severity === 'CRITICAL' ? 'danger' : 'warning'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                {!alerts || alerts.length === 0 && (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity</p>
                )}
              </div>
            </Card.Content>
          </Card>
        </Tabs.Content>

        {/* Alerts Tab */}
        <Tabs.Content value="alerts" className="space-y-4">
          <Card>
            <Card.Header className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Alerts</h3>
              {alerts && (
                <Badge variant="info">
                  {alerts.length} total
                </Badge>
              )}
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {loading ? (
                  <Skeleton count={3} />
                ) : alerts && alerts.length > 0 ? (
                  alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{alert.title || alert.message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{alert.description || alert.message}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">No alerts</p>
                )}
              </div>
            </Card.Content>
          </Card>
        </Tabs.Content>

        {/* Devices Tab */}
        <Tabs.Content value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Devices</h3>
            <a href="/devices" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            ) : devices && devices.length > 0 ? (
              devices.slice(0, 6).map((device) => (
                <Card key={device.id} className="hover:shadow-lg transition-shadow">
                  <Card.Content className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{device.name}</h4>
                      <Badge variant={device.isOnline ? 'success' : 'danger'}>
                        {device.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{device.ipAddress || 'N/A'}</p>
                    <div className="flex gap-2">
                      {device.os && (
                        <Badge variant="info" size="sm">
                          {device.os}
                        </Badge>
                      )}
                      {device.agentVersion && (
                        <Badge variant="default" size="sm">
                          {device.agentVersion}
                        </Badge>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No devices yet. Install agents to get started!</p>
              </Card>
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </Container>
  );
}
