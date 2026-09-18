import { HealthReading, ThresholdConfig, HealthAlert, AlertSeverity, HealthStatus } from '../types';

export interface EvaluationResult {
  status: HealthStatus;
  alerts: Omit<HealthAlert, 'id' | 'created_at' | 'reviewed_at' | 'resolved_at'>[];
}

export function evaluateSensorReading(
  reading: {
    student_id: string;
    student_name?: string;
    device_id: string;
    heart_rate: number;
    spo2: number;
    temperature: number;
    activity: string;
  },
  thresholds: ThresholdConfig[],
  readingId: string
): EvaluationResult {
  const generatedAlerts: Omit<HealthAlert, 'id' | 'created_at' | 'reviewed_at' | 'resolved_at'>[] = [];
  let isAbnormal = false;
  let isWarning = false;

  const hrThresh = thresholds.find((t) => t.parameter === 'heart_rate' && t.enabled);
  const spo2Thresh = thresholds.find((t) => t.parameter === 'spo2' && t.enabled);
  const tempThresh = thresholds.find((t) => t.parameter === 'temperature' && t.enabled);

  // 1. Check Heart Rate
  if (hrThresh) {
    if (reading.heart_rate > hrThresh.maximum_value) {
      const diff = reading.heart_rate - hrThresh.maximum_value;
      const severity: AlertSeverity = diff >= 20 ? 'HIGH' : 'WARNING';
      if (severity === 'HIGH') isAbnormal = true; else isWarning = true;

      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: 'Tachycardia / High Heart Rate',
        parameter: 'Heart Rate',
        value: `${reading.heart_rate} BPM`,
        threshold: `Upper Limit: ${hrThresh.maximum_value} BPM`,
        severity,
        message: `Heart rate of ${reading.heart_rate} BPM exceeds configured upper limit of ${hrThresh.maximum_value} BPM.`,
        status: 'ACTIVE',
      });
    } else if (reading.heart_rate < hrThresh.minimum_value && reading.heart_rate > 35) {
      const severity: AlertSeverity = reading.heart_rate <= 48 ? 'HIGH' : 'WARNING';
      if (severity === 'HIGH') isAbnormal = true; else isWarning = true;

      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: 'Bradycardia / Low Heart Rate',
        parameter: 'Heart Rate',
        value: `${reading.heart_rate} BPM`,
        threshold: `Lower Limit: ${hrThresh.minimum_value} BPM`,
        severity,
        message: `Heart rate of ${reading.heart_rate} BPM dropped below configured lower limit of ${hrThresh.minimum_value} BPM.`,
        status: 'ACTIVE',
      });
    }
  }

  // 2. Check SpO2
  if (spo2Thresh) {
    if (reading.spo2 < spo2Thresh.minimum_value) {
      const severity: AlertSeverity = reading.spo2 <= 91 ? 'CRITICAL' : 'HIGH';
      isAbnormal = true;

      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: 'Hypoxemia / Low Blood Oxygen',
        parameter: 'SpO2',
        value: `${reading.spo2}%`,
        threshold: `Minimum Limit: ${spo2Thresh.minimum_value}%`,
        severity,
        message: `Blood oxygen saturation (SpO₂) of ${reading.spo2}% dropped below safe limit of ${spo2Thresh.minimum_value}%.`,
        status: 'ACTIVE',
      });
    }
  }

  // 3. Check Temperature
  if (tempThresh) {
    if (reading.temperature > tempThresh.maximum_value) {
      const severity: AlertSeverity = reading.temperature >= 38.5 ? 'CRITICAL' : 'HIGH';
      isAbnormal = true;

      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: 'Pyrexia / Elevated Temperature',
        parameter: 'Temperature',
        value: `${reading.temperature.toFixed(1)}°C`,
        threshold: `Maximum Limit: ${tempThresh.maximum_value}°C`,
        severity,
        message: `Body temperature of ${reading.temperature.toFixed(1)}°C exceeds threshold of ${tempThresh.maximum_value}°C.`,
        status: 'ACTIVE',
      });
    } else if (reading.temperature < tempThresh.minimum_value && reading.temperature > 30.0) {
      isWarning = true;
      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: 'Hypothermia / Low Temperature',
        parameter: 'Temperature',
        value: `${reading.temperature.toFixed(1)}°C`,
        threshold: `Minimum Limit: ${tempThresh.minimum_value}°C`,
        severity: 'WARNING',
        message: `Body temperature of ${reading.temperature.toFixed(1)}°C below standard resting limit.`,
        status: 'ACTIVE',
      });
    }
  }

  // 4. Check Activity Fall
  if (reading.activity === 'Possible Fall') {
    isAbnormal = true;
    generatedAlerts.push({
      student_id: reading.student_id,
      student_name: reading.student_name,
      reading_id: readingId,
      alert_type: 'Sudden Fall Vector Detected',
      parameter: 'Activity',
      value: 'Fall Shock Event',
      threshold: 'MPU6050 Shock > 3.0G + Inactivity',
      severity: 'CRITICAL',
      message: 'Sudden fall impact detected by MPU6050 accelerometer, student immobilized.',
      status: 'ACTIVE',
    });
  }

  // Consolidate status
  let finalStatus: HealthStatus = 'Normal';
  if (isAbnormal) {
    finalStatus = 'Abnormal';
  } else if (isWarning) {
    finalStatus = 'Warning';
  }

  return {
    status: finalStatus,
    alerts: generatedAlerts,
  };
}
