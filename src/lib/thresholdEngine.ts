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

  // 1. Check Heart Rate (Activity-Aware Physiological Thresholding)
  if (hrThresh) {
    const act = (reading.activity || 'Resting').trim();
    const isRest = act === 'Resting' || act === 'Sitting';
    const isWalk = act === 'Walking';
    const isRun = act === 'Running';

    // In the trained university model: running up to 160 BPM and walking up to 120 BPM are physiological responses
    const effectiveMax = isRun ? 160 : (isWalk ? 120 : hrThresh.maximum_value);
    const effectiveMin = isWalk || isRun ? 55 : hrThresh.minimum_value;

    if (reading.heart_rate > effectiveMax) {
      const diff = reading.heart_rate - effectiveMax;
      const severity: AlertSeverity = diff >= 20 ? 'HIGH' : 'WARNING';
      if (severity === 'HIGH') isAbnormal = true; else isWarning = true;

      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: isRest ? 'High resting heart rate' : 'Tachycardia / High Heart Rate',
        parameter: 'Heart Rate',
        value: `${reading.heart_rate} BPM`,
        threshold: `Upper Limit (${act}): ${effectiveMax} BPM`,
        severity,
        message: `Heart rate of ${reading.heart_rate} BPM exceeds calibrated ${act.toLowerCase()} threshold of ${effectiveMax} BPM.`,
        status: 'ACTIVE',
      });
    } else if (reading.heart_rate < effectiveMin && reading.heart_rate > 35) {
      const severity: AlertSeverity = reading.heart_rate <= 48 ? 'HIGH' : 'WARNING';
      if (severity === 'HIGH') isAbnormal = true; else isWarning = true;

      generatedAlerts.push({
        student_id: reading.student_id,
        student_name: reading.student_name,
        reading_id: readingId,
        alert_type: isRest ? 'Low resting heart rate' : 'Bradycardia / Low Heart Rate',
        parameter: 'Heart Rate',
        value: `${reading.heart_rate} BPM`,
        threshold: `Lower Limit: ${effectiveMin} BPM`,
        severity,
        message: `Heart rate of ${reading.heart_rate} BPM dropped below calibrated lower limit of ${effectiveMin} BPM.`,
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
  if (reading.activity === 'Possible Fall' || reading.activity === 'Sudden movement/fall-like event' || reading.activity.toLowerCase().includes('sudden')) {
    isAbnormal = true;
    generatedAlerts.push({
      student_id: reading.student_id,
      student_name: reading.student_name,
      reading_id: readingId,
      alert_type: 'Sudden/fall-like movement',
      parameter: 'Activity',
      value: 'Fall / Shock Movement',
      threshold: 'MPU6050 Shock > 3.0G Vector',
      severity: 'CRITICAL',
      message: 'Sudden fall or high-impact shock movement detected by MPU6050 accelerometer.',
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
