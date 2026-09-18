import React, { useState } from 'react';
import {
  Sliders,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Save,
  RotateCcw,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { ThresholdConfig } from '../../types';

export const AdminThresholdsPage: React.FC = () => {
  const { thresholds, updateThreshold, resetToDefaultData } = useHealthData();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for editing thresholds
  const [localThresholds, setLocalThresholds] = useState<ThresholdConfig[]>(thresholds);

  // Synchronize if thresholds change externally
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
        return <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />;
      case 'spo2':
        return <Droplets className="h-5 w-5 fill-blue-500 text-blue-500" />;
      case 'temperature':
        return <Thermometer className="h-5 w-5 text-amber-500" />;
      case 'fall_detection':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return <Sliders className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-purple-600" />
            <span>Abnormal Condition Threshold Engine (Feature 16 & 17)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Medical rule parameters evaluated by backend algorithms for real-time triage and alert generation
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetToDefaultData();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RotateCcw className="h-4 w-4 text-slate-500" />
          <span>Reset Medical Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-5">
        {localThresholds.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                  {getIcon(t.parameter)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  {t.enabled ? 'Rule Active' : 'Rule Inactive'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => handleValueChange(t.id, 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Minimum Normal Boundary ({t.unit})
                </label>
                <input
                  type="number"
                  step={t.parameter === 'temperature' ? '0.1' : '1'}
                  value={t.minimum_value}
                  onChange={(e) => handleValueChange(t.id, 'minimum_value', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-purple-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Readings below this trigger a Warning or Abnormal alert.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Maximum Normal Boundary ({t.unit})
                </label>
                <input
                  type="number"
                  step={t.parameter === 'temperature' ? '0.1' : '1'}
                  value={t.maximum_value}
                  onChange={(e) => handleValueChange(t.id, 'maximum_value', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-purple-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Readings above this trigger an Abnormal physiological alert.
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Threshold rules deployed live across all nodes!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save & Apply Thresholds</span>
          </button>
        </div>
      </form>
    </div>
  );
};
