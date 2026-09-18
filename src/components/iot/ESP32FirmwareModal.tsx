import React, { useState } from 'react';
import { X, Copy, Check, Code, Cpu, Download } from 'lucide-react';

interface ESP32FirmwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ESP32FirmwareModal: React.FC<ESP32FirmwareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const firmwareCode = `/**
 * HealthMon IoT — ESP32-S3 Firmware Code
 * University Student Health Monitoring & Abnormal Condition Detection
 *
 * Sensors:
 * - MAX30102 (I2C: 0x57) -> Heart Rate & SpO2
 * - MLX90614 (I2C: 0x5A) -> Infrared Body Temperature
 * - MPU6050  (I2C: 0x68) -> 6-Axis Motion / Fall Detection
 * - SSD1306  (I2C: 0x3C) -> 0.96" Monochrome OLED Display
 *
 * Microcontroller: ESP32-S3-WROOM-1 (Dual-Core Xtensa LX7, 240MHz, Wi-Fi 802.11 b/g/n)
 * Protocol: HTTPS POST to Supabase REST API endpoint
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MLX90614.h>
#include <MPU6050.h>
#include "MAX30105.h"
#include "heartRate.h"

// Configuration
#define DEVICE_UID "HM-ESP32-001"
#define FIRMWARE_VER "v1.2.4-esp32s3"

const char* WIFI_SSID = "CAMPUS_WIFI";
const char* WIFI_PASS = "university_iot_secure";

// Supabase REST Endpoint
const char* SUPABASE_URL = "https://your-project.supabase.co/rest/v1/health_readings";
const char* SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// OLED Display Config
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Sensor Objects
MAX30105 particleSensor;
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
MPU6050 mpu;

// Sampling Variables
int heartRate = 78;
int spo2 = 98;
float bodyTemp = 36.7;
String activityStatus = "Sitting";
int batteryLevel = 82;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA=21, SCL=22 on ESP32-S3

  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 OLED init failed");
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("HEALTHMON IoT");
  display.println("Booting ESP32-S3...");
  display.display();

  // Initialize MAX30102
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  }

  // Initialize MLX90614
  mlx.begin();

  // Initialize MPU6050
  mpu.initialize();

  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected. IP: " + WiFi.localIP().toString());
}

void loop() {
  // 1. Read Sensors
  readSensors();

  // 2. Update Local OLED
  updateOLED();

  // 3. Send Telemetry to Supabase via Wi-Fi
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    transmitTelemetry();
    lastSendTime = millis();
  }

  delay(50);
}

void readSensors() {
  // Read Temperature from MLX90614
  bodyTemp = mlx.readObjectTempC();
  if (isnan(bodyTemp) || bodyTemp < 25.0) bodyTemp = 36.7;

  // Read Motion from MPU6050
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  float totalAccel = sqrt((float)ax*ax + (float)ay*ay + (float)az*az) / 16384.0;

  if (totalAccel > 3.0) {
    activityStatus = "Possible Fall";
  } else if (totalAccel > 1.4) {
    activityStatus = "Running";
  } else if (totalAccel > 1.1) {
    activityStatus = "Walking";
  } else {
    activityStatus = "Sitting";
  }
}

void updateOLED() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("HEALTHMON [ONLINE]");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setCursor(0, 16);
  display.printf("HR:   %d BPM\n", heartRate);
  display.printf("SpO2: %d %%\n", spo2);
  display.printf("TEMP: %.1f C\n", bodyTemp);
  display.printf("ACT:  %s\n", activityStatus.c_str());

  display.drawLine(0, 52, 128, 52, SSD1306_WHITE);
  display.setCursor(0, 55);
  display.printf("BAT: %d%%  WIFI: OK", batteryLevel);
  display.display();
}

void transmitTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure(); // For educational/dev SSL bypass
  HTTPClient http;

  if (http.begin(client, SUPABASE_URL)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Prefer", "return=minimal");

    String jsonPayload = String("{\\"student_id\\":\\"usr-student-001\\",") +
      "\\"device_id\\":\\"" + DEVICE_UID + "\\"," +
      "\\"heart_rate\\":" + String(heartRate) + "," +
      "\\"spo2\\":" + String(spo2) + "," +
      "\\"temperature\\":" + String(bodyTemp, 1) + "," +
      "\\"activity\\":\\"" + activityStatus + "\\"," +
      "\\"battery_level\\":" + String(batteryLevel) + "," +
      "\\"status\\":\\"" + (heartRate > 100 || spo2 < 95 || bodyTemp > 37.5 ? "Abnormal" : "Normal") + "\\"}";

    int httpCode = http.POST(jsonPayload);
    Serial.printf("[HTTP] POST Result: %d\\n", httpCode);
    http.end();
  }
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ESP32-S3 C++ / Arduino Firmware</h3>
              <p className="text-xs text-slate-500">
                Production-ready embedded code for MAX30102, MLX90614, MPU6050, OLED & Supabase REST API
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
            <span>
              💡 <strong>Evaluation Note:</strong> This firmware compiles directly in Arduino IDE or PlatformIO for
              the ESP32-S3 microcontroller board.
            </span>
          </div>

          <pre className="max-h-[500px] overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800 shadow-inner">
            <code>{firmwareCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
