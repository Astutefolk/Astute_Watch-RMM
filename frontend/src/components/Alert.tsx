'use client';

import React from 'react';
import { Alert } from '@/types/index';
import { Card, Badge } from './UI';
import { formatDistanceToNow } from 'date-fns';

const severityColors = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const typeLabels = {
  CPU_HIGH: '⚡ High CPU',
  RAM_HIGH: '💾 High RAM',
  DISK_HIGH: '💿 High Disk',
  DEVICE_OFFLINE: '🔴 Device Offline',
  DEVICE_ONLINE: '🟢 Device Online',
};

export function AlertItem({
  alert,
  onResolve,
}: {
  alert: Alert;
  onResolve?: (id: string) => void;
}) {
  return (
    <Card className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <Badge variant={alert.severity === 'CRITICAL' ? 'danger' : 'warning'}>
            {typeLabels[alert.type] || alert.type}
          </Badge>
          {alert.isResolved && <Badge variant="success">Resolved</Badge>}
        </div>
        <p className="font-medium">{alert.message}</p>
        <p className="text-sm text-gray-500 mt-2">
          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!alert.isResolved && onResolve && (
        <button
          onClick={() => onResolve(alert.id)}
          className="ml-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Resolve
        </button>
      )}
    </Card>
  );
}

export function AlertsList({ alerts, onResolve }: { alerts: Alert[]; onResolve?: (id: string) => void }) {
  if (alerts.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">No alerts</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onResolve={onResolve} />
      ))}
    </div>
  );
}
