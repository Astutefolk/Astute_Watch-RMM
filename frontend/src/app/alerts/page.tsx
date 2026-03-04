'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { alertApi } from '@/lib/api';
import { Alert } from '@/types/index';
import { Card } from '@/components/UI';
import { AlertsList } from '@/components/Alert';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const { isAuthenticated } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unresolved, setUnresolved] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadAlerts();
  }, [isAuthenticated, unresolved]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const data = await alertApi.getAlerts(1, 100, unresolved);
      setAlerts(data.alerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(alertId: string) {
    try {
      await alertApi.resolveAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isResolved: true } : a)));
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
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-gray-600">Monitor and manage device alerts</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setUnresolved(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            unresolved
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setUnresolved(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !unresolved
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Resolved
        </button>
      </div>

      {loading ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Loading alerts...</p>
        </Card>
      ) : (
        <AlertsList alerts={alerts} onResolve={unresolved ? handleResolve : undefined} />
      )}
    </div>
  );
}
