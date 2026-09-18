import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  IoTDevice,
  HealthReading,
  HealthAlert,
  ThresholdConfig,
  DeviceLog,
  ActivityType,
  AlertStatus,
} from '../types';
import {
  INITIAL_DEVICES,
  INITIAL_READINGS,
  INITIAL_ALERTS,
  INITIAL_THRESHOLDS,
  INITIAL_LOGS,
} from '../lib/initialData';
import { evaluateSensorReading } from '../lib/thresholdEngine';
import { dispatchRealtimeEvent, isSupabaseConfigured, supabase } from '../lib/supabase';

interface HealthDataContextType {
  devices: IoTDevice[];
  readings: HealthReading[];
  alerts: HealthAlert[];
  thresholds: ThresholdConfig[];
  logs: DeviceLog[];
  isAutoStreaming: boolean;
  setIsAutoStreaming: (active: boolean) => void;
  sendSensorReading: (data: {
    student_id: string;
    student_name?: string;
    device_id: string;
    heart_rate: number;
    spo2: number;
    temperature: number;
    activity: ActivityType;
    battery_level?: number;
  }) => HealthReading;
  reviewAlert: (alertId: string, reviewedBy: string, notes?: string) => void;
  resolveAlert: (alertId: string, resolvedBy: string, notes: string) => void;
  registerDevice: (device: { device_uid: string; device_name: string; firmware_version: string; student_id?: string }) => void;
  assignDevice: (deviceId: string, studentId: string | null, studentName?: string) => void;
  updateDeviceStatus: (deviceId: string, status: IoTDevice['status'], battery?: number) => void;
  updateThreshold: (id: string, updates: Partial<ThresholdConfig>) => void;
  clearAllAlerts: () => void;
  resetToDefaultData: () => void;
  latestReadingForStudent: (studentId: string) => HealthReading | undefined;
  deviceForStudent: (studentId: string) => IoTDevice | undefined;
  defenseStep: number;
  setDefenseStep: (step: number) => void;
  runDefenseScenarioStep: (step: number) => void;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEVICES: 'healthmon_devices',
  READINGS: 'healthmon_readings',
  ALERTS: 'healthmon_alerts',
  THRESHOLDS: 'healthmon_thresholds',
  LOGS: 'healthmon_logs',
};

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<IoTDevice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
      if (saved) {
        const parsed: IoTDevice[] = JSON.parse(saved);
        return parsed.map((d) =>
          d.student_name === 'John Doe' || d.student_id === 'usr-student-001'
            ? { ...d, student_name: 'Alma Brown' }
            : d
        );
      }
      return INITIAL_DEVICES;
    } catch {
      return INITIAL_DEVICES;
    }
  });

  const [readings, setReadings] = useState<HealthReading[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.READINGS);
      return saved ? JSON.parse(saved) : INITIAL_READINGS;
    } catch {
      return INITIAL_READINGS;
    }
  });

  const [alerts, setAlerts] = useState<HealthAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (saved) {
        const parsed: HealthAlert[] = JSON.parse(saved);
        return parsed.map((a) =>
          a.student_name === 'John Doe' ? { ...a, student_name: 'Alma Brown' } : a
        );
      }
      return INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [thresholds, setThresholds] = useState<ThresholdConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
      return saved ? JSON.parse(saved) : INITIAL_THRESHOLDS;
    } catch {
      return INITIAL_THRESHOLDS;
    }
  });

  const [logs, setLogs] = useState<DeviceLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(true);
  const [defenseStep, setDefenseStep] = useState<number>(1);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  // Handle incoming real-time events from other tabs
  useEffect(() => {
    const handleRealtime = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.type === 'NEW_READING') {
        const { reading, newAlerts } = detail.payload;
        setReadings((prev) => [reading, ...prev.slice(0, 199)]);
        if (newAlerts && newAlerts.length > 0) {
          setAlerts((prev) => [...newAlerts, ...prev]);
        }
      }
    };

    window.addEventListener('healthmon:realtime', handleRealtime);
    return () => window.removeEventListener('healthmon:realtime', handleRealtime);
  }, []);

  // Central Sensor Reading Ingestion
  const sendSensorReading = useCallback(
    (data: {
      student_id: string;
      student_name?: string;
      device_id: string;
      heart_rate: number;
      spo2: number;
      temperature: number;
      activity: ActivityType;
      battery_level?: number;
    }): HealthReading => {
      const readingId = `read-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const evaluation = evaluateSensorReading(
        {
          student_id: data.student_id,
          student_name: data.student_name,
          device_id: data.device_id,
          heart_rate: data.heart_rate,
          spo2: data.spo2,
          temperature: data.temperature,
          activity: data.activity,
        },
        thresholds,
        readingId
      );

      const newReading: HealthReading = {
        id: readingId,
        student_id: data.student_id,
        device_id: data.device_id,
        heart_rate: Math.round(data.heart_rate),
        spo2: Math.round(data.spo2),
        temperature: Number(data.temperature.toFixed(1)),
        activity: data.activity,
        status: evaluation.status,
        battery_level: data.battery_level ?? 82,
        recorded_at: new Date().toISOString(),
      };

      // Add to readings list (keep latest 200 records)
      setReadings((prev) => [newReading, ...prev.slice(0, 199)]);

      // Create alerts if evaluation triggered any
      const createdAlerts: HealthAlert[] = [];
      if (evaluation.alerts.length > 0) {
        evaluation.alerts.forEach((alt) => {
          const alertObj: HealthAlert = {
            ...alt,
            id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            created_at: new Date().toISOString(),
            reviewed_at: null,
            resolved_at: null,
          };
          createdAlerts.push(alertObj);
        });

        setAlerts((prev) => [...createdAlerts, ...prev]);

        // Add log
        const alertLog: DeviceLog = {
          id: `log-${Date.now()}`,
          device_id: data.device_id,
          event_type: 'ALERT_CREATED',
          message: `🚨 ${createdAlerts[0].severity} Alert: ${createdAlerts[0].alert_type} (${createdAlerts[0].value}) for ${data.student_name || 'Student'}`,
          created_at: new Date().toISOString(),
          actor: 'Threshold Engine',
        };
        setLogs((prev) => [alertLog, ...prev.slice(0, 99)]);
      }

      // Update device last_seen and battery
      setDevices((prev) =>
        prev.map((d) =>
          d.id === data.device_id || d.device_uid === data.device_id
            ? {
                ...d,
                last_seen: new Date().toISOString(),
                status: 'ONLINE',
                battery_level: data.battery_level !== undefined ? data.battery_level : d.battery_level,
              }
            : d
        )
      );

      // Broadcast event for live UI reactivity
      dispatchRealtimeEvent('NEW_READING', { reading: newReading, newAlerts: createdAlerts });

      // If real Supabase is configured, push to database
      if (isSupabaseConfigured && supabase) {
        supabase.from('health_readings').insert([
          {
            student_id: newReading.student_id,
            device_id: newReading.device_id,
            heart_rate: newReading.heart_rate,
            spo2: newReading.spo2,
            temperature: newReading.temperature,
            activity: newReading.activity,
            status: newReading.status,
            battery_level: newReading.battery_level,
            recorded_at: newReading.recorded_at,
          },
        ]).then();

        if (createdAlerts.length > 0) {
          supabase.from('alerts').insert(
            createdAlerts.map((a) => ({
              student_id: a.student_id,
              reading_id: a.reading_id,
              alert_type: a.alert_type,
              parameter: a.parameter,
              value: a.value,
              threshold: a.threshold,
              severity: a.severity,
              message: a.message,
              status: a.status,
              created_at: a.created_at,
            }))
          ).then();
        }
      }

      return newReading;
    },
    [thresholds]
  );

  // Auto-streaming background simulator (simulates active ESP32-S3 IoT devices sending periodic telemetry)
  useEffect(() => {
    if (!isAutoStreaming) return;

    const interval = setInterval(() => {
      // Pick random online device to stream
      const onlineDevices = devices.filter((d) => d.status === 'ONLINE' && d.student_id);
      if (onlineDevices.length === 0) return;

      const randomDev = onlineDevices[Math.floor(Math.random() * onlineDevices.length)];
      if (!randomDev.student_id) return;

      // Small natural physiological fluctuation around resting baseline
      // HR: 74-84 BPM, SpO2: 97-99%, Temp: 36.5-36.9°C
      const hrVariance = Math.floor(Math.random() * 7) - 3;
      const hr = Math.max(68, Math.min(88, 78 + hrVariance));
      const spo2 = Math.random() > 0.3 ? 98 : (Math.random() > 0.5 ? 97 : 99);
      const temp = Number((36.6 + Math.random() * 0.3).toFixed(1));
      const activities: ActivityType[] = ['Sitting', 'Sitting', 'Sitting', 'Walking', 'Standing'];
      const activity = activities[Math.floor(Math.random() * activities.length)];

      sendSensorReading({
        student_id: randomDev.student_id,
        student_name: randomDev.student_name,
        device_id: randomDev.id,
        heart_rate: hr,
        spo2,
        temperature: temp,
        activity,
        battery_level: Math.max(10, randomDev.battery_level),
      });
    }, 4500); // every 4.5 seconds for visible real-time dynamism

    return () => clearInterval(interval);
  }, [isAutoStreaming, devices, sendSensorReading]);

  // Review Alert
  const reviewAlert = (alertId: string, reviewedBy: string, notes?: string) => {
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.id === alertId
          ? {
              ...alt,
              status: 'REVIEWED' as AlertStatus,
              reviewed_at: new Date().toISOString(),
              reviewed_by: reviewedBy,
              resolution_notes: notes || alt.resolution_notes,
            }
          : alt
      )
    );

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        device_id: 'SYSTEM',
        event_type: 'ALERT_REVIEWED',
        message: `Alert (${alertId}) reviewed by ${reviewedBy}`,
        created_at: new Date().toISOString(),
        actor: reviewedBy,
      },
      ...prev.slice(0, 99),
    ]);
  };

  // Resolve Alert
  const resolveAlert = (alertId: string, resolvedBy: string, notes: string) => {
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.id === alertId
          ? {
              ...alt,
              status: 'RESOLVED' as AlertStatus,
              resolved_at: new Date().toISOString(),
              resolved_by: resolvedBy,
              resolution_notes: notes,
            }
          : alt
      )
    );

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        device_id: 'SYSTEM',
        event_type: 'ALERT_RESOLVED',
        message: `Alert (${alertId}) resolved by ${resolvedBy}: "${notes}"`,
        created_at: new Date().toISOString(),
        actor: resolvedBy,
      },
      ...prev.slice(0, 99),
    ]);
  };

  // Register Device
  const registerDevice = (deviceData: {
    device_uid: string;
    device_name: string;
    firmware_version: string;
    student_id?: string;
  }) => {
    const newDevice: IoTDevice = {
      id: `dev-${Date.now()}`,
      device_uid: deviceData.device_uid,
      student_id: deviceData.student_id || null,
      device_name: deviceData.device_name,
      status: 'OFFLINE',
      battery_level: 100,
      wifi_status: true,
      wifi_rssi: -60,
      last_seen: new Date().toISOString(),
      firmware_version: deviceData.firmware_version || 'v1.2.4-esp32s3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDevices((prev) => [newDevice, ...prev]);

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        device_id: newDevice.device_uid,
        event_type: 'DEVICE_REGISTERED',
        message: `Registered new ESP32-S3 unit ${newDevice.device_uid} (${newDevice.device_name})`,
        created_at: new Date().toISOString(),
        actor: 'Admin',
      },
      ...prev.slice(0, 99),
    ]);
  };

  // Assign Device
  const assignDevice = (deviceId: string, studentId: string | null, studentName?: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              student_id: studentId,
              student_name: studentName,
              updated_at: new Date().toISOString(),
            }
          : d
      )
    );

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        device_id: deviceId,
        event_type: 'DEVICE_ASSIGNED',
        message: studentId
          ? `Device assigned to student: ${studentName || studentId}`
          : `Device unassigned from student`,
        created_at: new Date().toISOString(),
        actor: 'Admin',
      },
      ...prev.slice(0, 99),
    ]);
  };

  const updateDeviceStatus = (deviceId: string, status: IoTDevice['status'], battery?: number) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              status,
              battery_level: battery !== undefined ? battery : d.battery_level,
              last_seen: new Date().toISOString(),
            }
          : d
      )
    );
  };

  // Update Threshold
  const updateThreshold = (id: string, updates: Partial<ThresholdConfig>) => {
    setThresholds((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        device_id: 'SYSTEM',
        event_type: 'THRESHOLD_CHANGED',
        message: `Threshold for ${id} updated by Admin`,
        created_at: new Date().toISOString(),
        actor: 'Admin',
      },
      ...prev.slice(0, 99),
    ]);
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const resetToDefaultData = () => {
    setDevices(INITIAL_DEVICES);
    setReadings(INITIAL_READINGS);
    setAlerts(INITIAL_ALERTS);
    setThresholds(INITIAL_THRESHOLDS);
    setLogs(INITIAL_LOGS);
    localStorage.removeItem(STORAGE_KEYS.DEVICES);
    localStorage.removeItem(STORAGE_KEYS.READINGS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  };

  const latestReadingForStudent = (studentId: string): HealthReading | undefined => {
    return readings.find((r) => r.student_id === studentId);
  };

  const deviceForStudent = (studentId: string): IoTDevice | undefined => {
    return devices.find((d) => d.student_id === studentId);
  };

  // Section 50: Project Defense Scenario Handler
  const runDefenseScenarioStep = (stepNum: number) => {
    setDefenseStep(stepNum);

    // Scenario is centered around Student Alma Brown (usr-student-001) and Device HM-ESP32-001 (dev-001)
    if (stepNum === 3) {
      // Step 3: Sensors begin collecting: HR: 78 BPM, SpO2: 98%, Temp: 36.7°C, Activity: Sitting
      sendSensorReading({
        student_id: 'usr-student-001',
        student_name: 'Alma Brown',
        device_id: 'dev-001',
        heart_rate: 78,
        spo2: 98,
        temperature: 36.7,
        activity: 'Sitting',
        battery_level: 82,
      });
    } else if (stepNum === 8 || stepNum === 9 || stepNum === 10) {
      // Step 8-10: Introduce abnormal reading: Heart Rate = 125 BPM
      // System detects: 125 > configured upper threshold (100) -> System creates HIGH ALERT
      sendSensorReading({
        student_id: 'usr-student-001',
        student_name: 'Alma Brown',
        device_id: 'dev-001',
        heart_rate: 125,
        spo2: 98,
        temperature: 36.9,
        activity: 'Sitting',
        battery_level: 81,
      });
    }
  };

  return (
    <HealthDataContext.Provider
      value={{
        devices,
        readings,
        alerts,
        thresholds,
        logs,
        isAutoStreaming,
        setIsAutoStreaming,
        sendSensorReading,
        reviewAlert,
        resolveAlert,
        registerDevice,
        assignDevice,
        updateDeviceStatus,
        updateThreshold,
        clearAllAlerts,
        resetToDefaultData,
        latestReadingForStudent,
        deviceForStudent,
        defenseStep,
        setDefenseStep,
        runDefenseScenarioStep,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
