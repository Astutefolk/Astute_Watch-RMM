'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { deviceApi, alertApi } from '@/lib/api';
import { Device, Alert } from '@/types/index';
import { Card, Badge, Button, Alert as AlertComponent } from '@/components/UI';
import { MetricsChart } from '@/components/Device';
import { AlertsList } from '@/components/Alert';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuthStore();
  const [device, setDevice] = useState<Device | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDevice();
  }, [isAuthenticated, params.id]);

  async function loadDevice() {
    setLoading(true);
    try {
      const deviceData = await deviceApi.getDevice(params.id);
      setDevice(deviceData);

      // Load alerts for this device
      const alertsData = await alertApi.getAlerts(1, 50);
      const deviceAlerts = alertsData.alerts.filter((a: Alert) => a.deviceId === params.id);
      setAlerts(deviceAlerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this device?')) return;

    setDeleting(true);
    try {
      await deviceApi.deleteDevice(params.id);
      router.push('/devices');
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading device...</p>
      </Card>
    );
  }

  if (!device) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Device not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{device.name}</h1>
            <Badge variant={device.isOnline ? 'success' : 'danger'}>
              {device.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-gray-600">{device.deviceId}</p>
        </div>
        <Button variant="danger" isLoading={deleting} onClick={handleDelete}>
          Delete Device
        </Button>
      </div>

      {error && <AlertComponent variant="error">{error}</AlertComponent>}

      {/* Device Info */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Device Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Device ID</p>
            <p className="font-monospace text-sm">{device.deviceId}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">OS Version</p>
            <p className="font-monospace text-sm">{device.osVersion || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="font-semibold">{device.isOnline ? 'Online' : 'Offline'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Last Seen</p>
            <p className="font-semibold">
              {device.lastSeen
                ? formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })
                : 'Never'}
            </p>
          </div>
        </div>
      </Card>

      {/* Metrics Chart */}
      {Array.isArray(device.metrics) && device.metrics.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Metrics History</h2>
          <MetricsChart metrics={device.metrics} />
        </Card>
      )}

      {/* Current Metrics */}
      {device.metrics && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Current Metrics</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase font-semibold">CPU</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{device.metrics.cpu.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase font-semibold">RAM</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{device.metrics.ram.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase font-semibold">DISK</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{device.metrics.disk.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Device Alerts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Alerts</h2>
        <AlertsList alerts={alerts} />
      </div>
    </div>
  );
}
