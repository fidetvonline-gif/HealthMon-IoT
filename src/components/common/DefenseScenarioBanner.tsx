import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';

interface DefenseScenarioBannerProps {
  onNavigateTab?: (tab: string) => void;
}

const DEFENSE_STEPS = [
  {
    step: 1,
    title: '1. Login as a Student',
    desc: 'Student account (Alma Brown - UY/CS/2026/001) logs in to access personalized physiological telemetry.',
    targetRole: 'STUDENT',
    targetTab: 'dashboard',
    actionText: 'Switch to Student (Alma Brown)',
  },
  {
    step: 2,
    title: "2. Connect Student's ESP32 Device",
    desc: 'Verify wearable unit HM-ESP32-001 is paired, online with battery at 82% and active Wi-Fi link.',
    targetRole: 'STUDENT',
    targetTab: 'device',
    actionText: 'View Connected ESP32',
  },
  {
    step: 3,
    title: '3. Sensors Begin Collecting Baseline Data',
    desc: 'Sensors report: HR: 78 BPM, SpO₂: 98%, Temp: 36.7°C, Activity: Sitting. Normal physiological status.',
    targetRole: 'STUDENT',
    targetTab: 'dashboard',
    actionText: 'Inject 78 BPM Baseline',
  },
  {
    step: 4,
    title: '4. Data Sent: ESP32 → Wi-Fi → Supabase',
    desc: 'HTTP POST packet containing sensor readings is ingested by Supabase backend and logged.',
    targetRole: 'STUDENT',
    targetTab: 'dashboard',
    actionText: 'Confirm Packet Ingestion',
  },
  {
    step: 5,
    title: '5. Student Dashboard Receives Live Data',
    desc: 'Watch the real-time cards and on-device OLED update dynamically without page reload.',
    targetRole: 'STUDENT',
    targetTab: 'dashboard',
    actionText: 'Observe Live Vitals',
  },
  {
    step: 6,
    title: '6. Healthcare Personnel Opens Dashboard',
    desc: 'Switch role to Clinic Personnel (Dr. Evelyn Adams) to monitor all registered students centrally.',
    targetRole: 'HEALTHCARE',
    targetTab: 'dashboard',
    actionText: 'Switch to Healthcare Staff',
  },
  {
    step: 7,
    title: "7. Student's Live Readings Appear on Staff Table",
    desc: 'Alma Brown appears in the live monitoring table with Normal status and latest 78 BPM reading.',
    targetRole: 'HEALTHCARE',
    targetTab: 'dashboard',
    actionText: 'Inspect Live Monitoring Table',
  },
  {
    step: 8,
    title: '8. Introduce Test Abnormal Reading (HR = 125 BPM)',
    desc: 'Inject an elevated physiological reading: Heart Rate = 125 BPM while sitting at rest.',
    targetRole: 'HEALTHCARE',
    targetTab: 'dashboard',
    actionText: 'Trigger Abnormal HR (125 BPM)',
  },
  {
    step: 9,
    title: '9. System Threshold Engine Evaluates Reading',
    desc: 'Engine compares 125 BPM > 100 BPM configured upper threshold. Status flagged as Abnormal.',
    targetRole: 'HEALTHCARE',
    targetTab: 'dashboard',
    actionText: 'Verify Threshold Violation',
  },
  {
    step: 10,
    title: '10. System Creates HIGH ALERT',
    desc: 'An active HIGH severity alert is generated and dispatched to the real-time event pipeline.',
    targetRole: 'HEALTHCARE',
    targetTab: 'alerts',
    actionText: 'Open Alerts Center',
  },
  {
    step: 11,
    title: '11. Healthcare Dashboard Displays Alert & Response',
    desc: 'Staff reviews Alma Brown’s high heart rate alert, adds clinical notes, and marks it as reviewed/resolved.',
    targetRole: 'HEALTHCARE',
    targetTab: 'alerts',
    actionText: 'Review Alert as Clinician',
  },
  {
    step: 12,
    title: '12. Open Student History & Confirm Persistence',
    desc: 'Open historical health records table and Recharts visualizer. The 125 BPM reading is permanently stored.',
    targetRole: 'STUDENT',
    targetTab: 'history',
    actionText: 'View Stored History & Charts',
  },
];

export const DefenseScenarioBanner: React.FC<DefenseScenarioBannerProps> = ({ onNavigateTab }) => {
  const { defenseStep, setDefenseStep, runDefenseScenarioStep } = useHealthData();
  const { loginAs, availableUsers } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentStepInfo = DEFENSE_STEPS.find((s) => s.step === defenseStep) || DEFENSE_STEPS[0];

  const handleStepAction = (stepObj: typeof DEFENSE_STEPS[0]) => {
    // 1. Role switch if needed
    if (stepObj.targetRole === 'STUDENT') {
      const student = availableUsers.find((u) => u.role === 'STUDENT');
      if (student) loginAs(student.id);
    } else if (stepObj.targetRole === 'HEALTHCARE') {
      const doc = availableUsers.find((u) => u.role === 'HEALTHCARE');
      if (doc) loginAs(doc.id);
    }

    // 2. Tab navigation
    if (onNavigateTab && stepObj.targetTab) {
      onNavigateTab(stepObj.targetTab);
    }

    // 3. Execute scenario payload
    runDefenseScenarioStep(stepObj.step);
  };

  const handleNext = () => {
    const nextStep = Math.min(12, defenseStep + 1);
    setDefenseStep(nextStep);
    const nextInfo = DEFENSE_STEPS.find((s) => s.step === nextStep);
    if (nextInfo) {
      handleStepAction(nextInfo);
    }
  };

  const handlePrev = () => {
    const prevStep = Math.max(1, defenseStep - 1);
    setDefenseStep(prevStep);
    const prevInfo = DEFENSE_STEPS.find((s) => s.step === prevStep);
    if (prevInfo) {
      handleStepAction(prevInfo);
    }
  };

  const handleReset = () => {
    setDefenseStep(1);
    const step1 = DEFENSE_STEPS[0];
    handleStepAction(step1);
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Banner Bar Top */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Project Defense Scenario
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  Step {defenseStep} of 12
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={defenseStep <= 1}
              className="p-1 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              title="Previous Step"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleStepAction(currentStepInfo)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1 shadow-xs transition-colors"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>{currentStepInfo.actionText}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={defenseStep >= 12}
              className="p-1 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              title="Next Step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-md text-slate-400 hover:text-white"
              title="Reset Scenario to Step 1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {!isCollapsed && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {defenseStep >= 8 && defenseStep <= 10 ? (
                  <AlertOctagon className="h-4 w-4 text-rose-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-200 mr-2">{currentStepInfo.title}:</span>
                <span className="text-slate-300">{currentStepInfo.desc}</span>
              </div>
            </div>

            {/* Quick Step Indicators */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {DEFENSE_STEPS.map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    setDefenseStep(s.step);
                    handleStepAction(s);
                  }}
                  className={`h-5 px-1.5 rounded text-[10px] font-bold transition-all ${
                    s.step === defenseStep
                      ? 'bg-blue-500 text-white ring-1 ring-white/50'
                      : s.step < defenseStep
                      ? 'bg-slate-800 text-emerald-400'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                  title={s.title}
                >
                  {s.step}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
