export type UserRole = 'STUDENT' | 'HEALTHCARE' | 'ADMIN';

export type ActivityType = 
  | 'Resting'
  | 'Sitting' 
  | 'Standing' 
  | 'Walking' 
  | 'Running' 
  | 'Inactive' 
  | 'Possible Fall';

export type HealthStatus = 'Normal' | 'Warning' | 'Abnormal';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'ERROR';

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'REVIEWED' | 'RESOLVED';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  student_id?: string;
  faculty?: string;
  department?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IoTDevice {
  id: string;
  device_uid: string;
  mac_address?: string;
  student_id: string | null;
  student_name?: string;
  device_name: string;
  status: DeviceStatus;
  battery_level: number;
  wifi_status: boolean;
  wifi_rssi?: number;
  last_seen: string;
  firmware_version: string;
  created_at: string;
  updated_at: string;
}

export interface HealthReading {
  id: string;
  student_id: string;
  device_id: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  activity: ActivityType;
  status: HealthStatus;
  recorded_at: string;
  battery_level?: number;
}

export interface HealthAlert {
  id: string;
  student_id: string;
  student_name?: string;
  reading_id: string;
  alert_type: string;
  parameter: 'Heart Rate' | 'SpO2' | 'Temperature' | 'Activity' | 'Multiple';
  value: string;
  threshold: string;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by?: string;
  resolved_at: string | null;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface ThresholdConfig {
  id: string;
  parameter: 'heart_rate' | 'spo2' | 'temperature' | 'fall_detection';
  name: string;
  unit: string;
  minimum_value: number;
  maximum_value: number;
  enabled: boolean;
  updated_at: string;
  updated_by: string;
  description: string;
}

export interface DeviceLog {
  id: string;
  device_id: string;
  event_type: 
    | 'USER_LOGIN' 
    | 'DEVICE_REGISTERED' 
    | 'DEVICE_ASSIGNED' 
    | 'DEVICE_ONLINE' 
    | 'DEVICE_OFFLINE' 
    | 'READING_RECEIVED' 
    | 'ALERT_CREATED' 
    | 'ALERT_REVIEWED' 
    | 'ALERT_RESOLVED' 
    | 'THRESHOLD_CHANGED' 
    | 'USER_CREATED';
  message: string;
  created_at: string;
  actor?: string;
}

export interface DefenseDemoStep {
  step: number;
  title: string;
  description: string;
  actionLabel?: string;
}
