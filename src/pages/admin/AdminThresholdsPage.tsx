import React, { useState } from 'react';
import {
  Sliders,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  RotateCcw,
  CheckCircle,
  Brain,
  Sparkles,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { ThresholdConfig } from '../../types';

interface AdminThresholdsPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminThresholdsPage: React.FC<AdminThresholdsPageProps> = ({ onNavigateTab }) => {
  const { thresholds, updateThreshold, resetToDefaultData } = useHealthData();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [localThresholds, setLocalThresholds] = useState<ThresholdConfig[]>(thresholds);

  React.useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholds]);

  const handleValueChange = (
    id: string,
    field: 'minimum_value' | 'maximum_value' | 'enabled',
    val: number | boolean
  ) => {
    setLocalThresholds((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    localThresholds.forEach((t) => {
      updateThreshold(t.id, {
        minimum_value: t.minimum_value,
        maximum_value: t.maximum_value,
        enabled: t.enabled,
      });
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getIcon = (param: string) => {
    switch (param) {
      case 'heart_rate':
        return <Heart className="h-4 w-4 text-[#C24141]" />;
      case 'spo2':
        return <Droplets className="h-4 w-4 text-[#2764A5]" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4 text-[#B7791F]" />;
      case 'fall_detection':
        return <Activity className="h-4 w-4 text-[#087F8C]" />;
      default:
        return <Sliders className="h-4 w-4 text-[#667085]" />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#087F8C]" />
            <span>Threshold Calibration Rules</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Medical parameters evaluated for realtime clinical alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('model_training')}
              className="btn-primary text-xs"
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Dataset & Model Training</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              resetToDefaultData();
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 2500);
            }}
            className="btn-secondary text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#667085]" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Dataset Training Highlight Card */}
      <div className="card-panel rounded-[8px] p-4 bg-[#F1F3F5] border border-[#E2E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#0B1726] text-white">
            <Brain className="h-4 w-4 text-[#087F8C]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17202A] flex items-center gap-2">
              <span>Trained with Student Dataset</span>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#16805C]/10 text-[#16805C] text-[10px] font-bold border border-[#16805C]/20">
                100% Accuracy (100 Samples)
              </span>
            </h4>
            <p className="text-[11px] text-[#667085]">
              Detection engine evaluates heart rate, hypoxemia, and fever boundaries calibrated from 100 student records.
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('model_training')}
            className="shrink-0 btn-secondary text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#087F8C]" />
            <span>Open Model Studio</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-4">
        {localThresholds.map((t) => (
          <div key={t.id} className="card-panel p-5 rounded-[8px] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#F1F3F5] border border-[#E2E6EB]">
                  {getIcon(t.parameter)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">{t.name}</h3>
                  <p className="text-xs text-[#667085]">{t.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => handleValueChange(t.id, 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#D0D5DD] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D0D5DD] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#087F8C]"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Minimum Lower Bound</label>
                <input
                  type="number"
                  step="0.1"
                  value={t.minimum_value ?? ''}
                  onChange={(e) => handleValueChange(t.id, 'minimum_value', parseFloat(e.target.value))}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Maximum Upper Bound</label>
                <input
                  type="number"
                  step="0.1"
                  value={t.maximum_value ?? ''}
                  onChange={(e) => handleValueChange(t.id, 'maximum_value', parseFloat(e.target.value))}
                  className="form-input font-mono"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#16805C] bg-[#16805C]/10 px-3 py-2 rounded-[6px] border border-[#16805C]/20">
              <CheckCircle className="w-4 h-4" /> Rules saved successfully!
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="btn-primary text-xs"
          >
            Save Calibrations
          </button>
        </div>
      </form>
    </div>
  );
};
