import { create } from 'zustand';
import { Device, DeviceMetrics, Alert, DashboardStats } from '@/types/index';

interface DashboardStore {
  stats: DashboardStats | null;
  devices: Device[];
  alerts: Alert[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;

  setStats: (stats: DashboardStats) => void;
  setDevices: (devices: Device[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setSelectedDevice: (device: Device | null) => void;
  updateDeviceMetrics: (deviceId: string, metrics: DeviceMetrics) => void;
  updateDeviceStatus: (deviceId: string, isOnline: boolean) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (alertId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  devices: [],
  alerts: [],
  selectedDevice: null,
  loading: false,
  error: null,

  setStats: (stats: DashboardStats) => set({ stats }),

  setDevices: (devices: Device[]) => set({ devices }),

  setAlerts: (alerts: Alert[]) => set({ alerts }),

  setSelectedDevice: (device: Device | null) => set({ selectedDevice: device }),

  updateDeviceMetrics: (deviceId: string, metrics: DeviceMetrics) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, metrics } : d
      ),
      selectedDevice:
        state.selectedDevice?.id === deviceId
          ? { ...state.selectedDevice, metrics }
          : state.selectedDevice,
    })),

  updateDeviceStatus: (deviceId: string, isOnline: boolean) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, isOnline } : d
      ),
      selectedDevice:
        state.selectedDevice?.id === deviceId
          ? { ...state.selectedDevice, isOnline }
          : state.selectedDevice,
    })),

  addAlert: (alert: Alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  resolveAlert: (alertId: string) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, isResolved: true } : a
      ),
    })),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),
}));
