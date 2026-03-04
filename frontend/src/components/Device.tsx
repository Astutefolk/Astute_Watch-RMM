'use client';

import React, { useEffect, useState } from 'react';
import { Device, DeviceMetrics } from '@/types/index';
import { Card, Badge } from './UI';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DeviceCard({ device }: { device: Device }) {
  const metrics = device.metrics;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{device.name}</h3>
          <p className="text-sm text-gray-500">{device.deviceId}</p>
        </div>
        <Badge variant={device.isOnline ? 'success' : 'danger'}>
          {device.isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {device.osVersion && (
        <p className="text-sm text-gray-600 mb-4">{device.osVersion}</p>
      )}

      {metrics ? (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">CPU</p>
            <p className="text-2xl font-bold text-blue-600">{metrics.cpu.toFixed(1)}%</p>
            <div className="mt-2 h-1 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded"
                style={{
                  width: `${Math.min(100, metrics.cpu)}%`,
                } as React.CSSProperties}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">RAM</p>
            <p className="text-2xl font-bold text-green-600">{metrics.ram.toFixed(1)}%</p>
            <div className="mt-2 h-1 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-green-600 rounded"
                style={{
                  width: `${Math.min(100, metrics.ram)}%`,
                } as React.CSSProperties}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">DISK</p>
            <p className="text-2xl font-bold text-orange-600">{metrics.disk.toFixed(1)}%</p>
            <div className="mt-2 h-1 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-orange-600 rounded"
                style={{
                  width: `${Math.min(100, metrics.disk)}%`,
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No metrics available</p>
      )}

      {device.lastSeen && (
        <p className="text-xs text-gray-500 mt-4">
          Last seen: {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
        </p>
      )}
    </Card>
  );
}

export function MetricsChart({ metrics }: { metrics: DeviceMetrics[] }) {
  const data = metrics.slice().reverse().map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    cpu: m.cpu,
    ram: m.ram,
    disk: m.disk,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="cpu" fill="#3b82f6" name="CPU %" />
        <Bar dataKey="ram" fill="#10b981" name="RAM %" />
        <Bar dataKey="disk" fill="#f59e0b" name="Disk %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
