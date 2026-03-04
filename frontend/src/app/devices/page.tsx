'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { deviceApi } from '@/lib/api';
import { Device } from '@/types/index';
import { Card, Button, Alert } from '@/components/UI';
import { DeviceCard } from '@/components/Device';
import { useRouter } from 'next/navigation';

export default function DevicesPage() {
  const { isAuthenticated } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDevices();
  }, [isAuthenticated]);

  async function loadDevices() {
    setLoading(true);
    try {
      const data = await deviceApi.getDevices(1, 100);
      setDevices(data.devices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-gray-600">Manage your monitored devices</p>
        </div>
        <a
          href="/dashboard"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </a>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Loading devices...</p>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            Found {devices.length} device{devices.length !== 1 ? 's' : ''}
          </div>

          {devices.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">No devices registered yet</p>
              <p className="text-gray-500 text-sm">
                Download and run the Windows agent with your API key to get started
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <a
                  key={device.id}
                  href={`/devices/${device.id}`}
                  className="hover:scale-105 transition-transform"
                >
                  <DeviceCard device={device} />
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
