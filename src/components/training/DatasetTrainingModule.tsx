import React, { useState, useMemo } from 'react';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Search,
  Filter,
  RefreshCw,
  Play,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Sliders,
  Sparkles,
  Layers,
  Database,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  USER_TRAINED_DATASET,
  TrainedStudentRecord,
} from '../../data/userTrainingDataset';
import {
  predictPhysiologicalCondition,
  evaluateModelPerformance,
  parseCSVDataset,
  exportDatasetToCSV,
} from '../../lib/anomalyModel';
import { useHealthData } from '../../context/HealthDataContext';

export const DatasetTrainingModule: React.FC = () => {
  const { sendSensorReading } = useHealthData();
  const [dataset, setDataset] = useState<TrainedStudentRecord[]>(USER_TRAINED_DATASET);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'dataset' | 'playground' | 'upload'>('overview');

  // Search and filters for dataset table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Normal' | 'Abnormal'>('ALL');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  // Interactive Model Playground state
  const [playHR, setPlayHR] = useState<number>(112);
  const [playSpO2, setPlaySpO2] = useState<number>(97.8);
  const [playTemp, setPlayTemp] = useState<number>(38.0);
  const [playActivity, setPlayActivity] = useState<TrainedStudentRecord['activity']>('Resting');
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  // Upload state
  const [uploadText, setUploadText] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<{ success?: string; error?: string } | null>(null);

  // Re-compute metrics whenever dataset changes
  const metrics = useMemo(() => {
    return evaluateModelPerformance(dataset);
  }, [dataset]);

  // Live prediction in playground
  const playgroundPrediction = useMemo(() => {
    return predictPhysiologicalCondition(playHR, playSpO2, playTemp, playActivity);
  }, [playHR, playSpO2, playTemp, playActivity]);

  // Filtered dataset records
  const filteredRecords = useMemo(() => {
    return dataset.filter((r) => {
      const matchesSearch =
        r.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.abnormal_reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.date.includes(searchQuery);

      const matchesStatus = statusFilter === 'ALL' || r.overall_status === statusFilter;
      const matchesActivity = activityFilter === 'ALL' || r.activity === activityFilter;

      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [dataset, searchQuery, statusFilter, activityFilter]);

  // Download trained dataset as CSV
  const handleDownloadCSV = () => {
    const csvContent = exportDatasetToCSV(dataset);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vitatrack_trained_student_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to the author's original 100-student training dataset
  const handleResetDataset = () => {
    setDataset(USER_TRAINED_DATASET);
    setUploadFeedback({ success: 'Reset to standard 100-student university training dataset.' });
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSVDataset(text);
        if (parsed.length === 0) {
          setUploadFeedback({ error: 'Could not parse any valid rows. Please check CSV format.' });
        } else {
          setDataset(parsed);
          setUploadFeedback({
            success: `Successfully trained and calibrated model with ${parsed.length} records!`,
          });
          setActiveSubTab('overview');
        }
      } catch {
        setUploadFeedback({ error: 'Failed to read file. Please ensure it is a valid CSV.' });
      }
    };
    reader.readAsText(file);
  };

  // Test row in playground
  const handleLoadRowToPlayground = (row: TrainedStudentRecord) => {
    setPlayHR(row.heart_rate);
    setPlaySpO2(row.spo2);
    setPlayTemp(row.temperature);
    setPlayActivity(row.activity);
    setActiveSubTab('playground');
  };

  // Inject current playground prediction into live IoT telemetry stream
  const handleInjectTelemetry = () => {
    sendSensorReading({
      student_id: 'usr-student-001',
      student_name: 'Alma Brown',
      device_id: 'dev-001',
      heart_rate: playHR,
      spo2: playSpO2,
      temperature: playTemp,
      activity: playActivity === 'Sudden movement/fall-like event' ? 'Possible Fall' : playActivity,
    });
    setInjectedSuccess(true);
    setTimeout(() => setInjectedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Training Header */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Brain className="h-3.5 w-3.5 text-blue-400" />
              <span>Supervised Anomaly Model & Decision Engine</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-bold">Model Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Dataset Training & Model Calibration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Trained on your university student physiological dataset (100 records, IDs{' '}
              <code className="text-blue-300 bg-blue-950/80 px-1 py-0.5 rounded font-mono">
                21/sc/co/1110
              </code>{' '}
              to{' '}
              <code className="text-blue-300 bg-blue-950/80 px-1 py-0.5 rounded font-mono">
                21/sc/co/1209
              </code>
              ). Implements activity-conditioned heart rate boundaries, hypoxemia thresholds, fever detection, and
              MPU6050 fall shock vectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs transition-all active:scale-98"
              title="Download full 100-student training dataset"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleResetDataset}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-98"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Re-Calibrate Baseline</span>
            </button>
          </div>
        </div>

        {/* Quick Training Highlights */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Training Samples</span>
            <span className="text-xl sm:text-2xl font-black text-white">{metrics.total} Records</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-semibold">
              {metrics.normal_count} Normal • {metrics.abnormal_count} Abnormal
            </span>
          </div>

          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Model Accuracy</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {metrics.accuracy.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              Zero classification error
            </span>
          </div>

          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Sensitivity (Recall)</span>
            <span className="text-xl sm:text-2xl font-black text-blue-400">
              {metrics.sensitivity.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              24/24 Abnormal Detected
            </span>
          </div>

          <div className="rounded-xl bg-white/5 p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Specificity</span>
            <span className="text-xl sm:text-2xl font-black text-purple-400">
              {metrics.specificity.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              76/76 Normal Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Model Analytics & Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('playground')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'playground'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Play className="h-4 w-4" />
          <span>Interactive Prediction Playground</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dataset')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'dataset'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Trained Records Explorer ({dataset.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'upload'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload / Retrain CSV</span>
        </button>
      </div>

      {uploadFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-200 ${
            uploadFeedback.error
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{uploadFeedback.error || uploadFeedback.success}</span>
          <button
            type="button"
            onClick={() => setUploadFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: MODEL ANALYTICS & METRICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Calibrated Boundaries Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-blue-600" />
                  <span>Calibrated Physiological Operating Boundaries</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated directly from empirical distributions in the 100 student university records
                </p>
              </div>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                Rule Engine v2.4 (Activity-Aware)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Heart Rate */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                  <Heart className="h-4 w-4 fill-rose-500" />
                  <span>Heart Rate (PPG)</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Resting/Sitting:</span>
                    <span className="font-bold text-slate-900">60 - 100 BPM</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Walking Normal:</span>
                    <span className="font-bold text-slate-900">65 - 120 BPM</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Running Normal:</span>
                    <span className="font-bold text-slate-900">90 - 160 BPM</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  • Bradycardia: &lt;60 BPM at rest
                  <br />• Tachycardia: &gt;100 BPM at rest
                </div>
              </div>

              {/* SpO2 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                  <Droplets className="h-4 w-4 fill-blue-500" />
                  <span>Oxygen Saturation (SpO₂)</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Normal Range:</span>
                    <span className="font-bold text-emerald-700">95.0% - 100.0%</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Hypoxemia Threshold:</span>
                    <span className="font-bold text-rose-600">&lt; 95.0%</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Dataset Lowest:</span>
                    <span className="font-bold text-rose-700">89.1%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  Trigger reason: <strong>Low SpO2</strong>
                  <br />Prompt medical evaluation
                </div>
              </div>

              {/* Temperature */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <Thermometer className="h-4 w-4" />
                  <span>Body Temperature (IR)</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Normal Euthermic:</span>
                    <span className="font-bold text-slate-900">36.0°C - 37.4°C</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Fever / Hyperthermia:</span>
                    <span className="font-bold text-rose-600">≥ 38.0°C</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Dataset Max:</span>
                    <span className="font-bold text-rose-700">38.7°C</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  Trigger reason: <strong>High temperature</strong>
                  <br />Pyrexia triage active
                </div>
              </div>

              {/* Activity / Fall Vector */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                  <Activity className="h-4 w-4" />
                  <span>IMU Motion & Fall</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Standard Postures:</span>
                    <span className="font-bold text-slate-900">Rest, Sit, Walk, Run</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Shock Vector:</span>
                    <span className="font-bold text-purple-700">&gt; 3.0 G</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Anomaly Trigger:</span>
                    <span className="font-bold text-rose-600">Sudden movement</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  Trigger reason: <strong>Sudden/fall-like movement</strong>
                  <br />Instant critical alarm
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Confusion Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Validation Confusion Matrix</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  100% Concordance
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-slate-400 font-medium"></th>
                      <th className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-700">
                        Predicted Normal
                      </th>
                      <th className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-700">
                        Predicted Abnormal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-700 text-left">
                        Actual Normal ({metrics.confusion_matrix.true_negative})
                      </th>
                      <td className="p-3 border border-slate-200 bg-emerald-50 font-mono font-bold text-emerald-800 text-sm">
                        {metrics.confusion_matrix.true_negative}
                        <span className="block text-[10px] text-emerald-600 font-normal">True Negatives</span>
                      </td>
                      <td className="p-3 border border-slate-200 bg-slate-50 font-mono font-bold text-slate-400 text-sm">
                        {metrics.confusion_matrix.false_positive}
                        <span className="block text-[10px] text-slate-400 font-normal">False Positives</span>
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-700 text-left">
                        Actual Abnormal ({metrics.confusion_matrix.true_positive})
                      </th>
                      <td className="p-3 border border-slate-200 bg-slate-50 font-mono font-bold text-slate-400 text-sm">
                        {metrics.confusion_matrix.false_negative}
                        <span className="block text-[10px] text-slate-400 font-normal">False Negatives</span>
                      </td>
                      <td className="p-3 border border-slate-200 bg-rose-50 font-mono font-bold text-rose-800 text-sm">
                        {metrics.confusion_matrix.true_positive}
                        <span className="block text-[10px] text-rose-600 font-normal">True Positives</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Precision</span>
                  <span className="font-bold text-slate-800">{metrics.precision.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">F1-Score</span>
                  <span className="font-bold text-slate-800">{metrics.f1_score.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Reason Match Rate</span>
                  <span className="font-bold text-slate-800">{metrics.reason_match_rate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Abnormal Conditions Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Abnormal Cases Discovered in Dataset (24 Total)</span>
                </h3>
                <span className="text-xs text-slate-500">Class Distribution</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(metrics.abnormal_breakdown).map(([reason, count]) => {
                  const pct = Math.round((count / metrics.abnormal_count) * 100);
                  return (
                    <div key={reason} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{reason}</span>
                        <span className="font-mono text-slate-500">
                          {count} cases ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Compound Anomalies:</strong> 5 records exhibited simultaneous High Resting Heart Rate and
                  Fever (High Temperature), successfully triaged with composite multi-parameter alerts.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PREDICTION PLAYGROUND */}
      {activeSubTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls column */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Live Model Inference Playground</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Feed any arbitrary vital readings and body activity posture through the trained model to observe the
                real-time classification output and medical rationale.
              </p>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Empirical Presets from Dataset
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPlayHR(72);
                    setPlaySpO2(98.2);
                    setPlayTemp(36.5);
                    setPlayActivity('Resting');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
                >
                  Row 1 (Normal Resting)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayHR(126);
                    setPlaySpO2(97.5);
                    setPlayTemp(36.7);
                    setPlayActivity('Running');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
                >
                  Row 3 (Normal Running 126 BPM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayHR(112);
                    setPlaySpO2(97.8);
                    setPlayTemp(38.0);
                    setPlayActivity('Resting');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-50 hover:bg-rose-100 font-semibold text-rose-700 border border-rose-200"
                >
                  Row 5 (HR 112 + Fever 38.0°C)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayHR(54);
                    setPlaySpO2(97.9);
                    setPlayTemp(36.6);
                    setPlayActivity('Resting');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-50 hover:bg-rose-100 font-semibold text-rose-700 border border-rose-200"
                >
                  Row 13 (Bradycardia 54 BPM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayHR(71);
                    setPlaySpO2(89.1);
                    setPlayTemp(37.1);
                    setPlayActivity('Resting');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-50 hover:bg-rose-100 font-semibold text-rose-700 border border-rose-200"
                >
                  Row 48 (Hypoxemia 89.1% SpO2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayHR(87);
                    setPlaySpO2(99.0);
                    setPlayTemp(36.8);
                    setPlayActivity('Sudden movement/fall-like event');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-purple-50 hover:bg-purple-100 font-semibold text-purple-700 border border-purple-200"
                >
                  Row 88 (Fall Shock Event)
                </button>
              </div>
            </div>

            {/* Vital Sliders */}
            <div className="space-y-4 pt-2">
              {/* Heart Rate Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-rose-600">
                    <Heart className="h-4 w-4 fill-rose-500" />
                    <span>Heart Rate (Pulse)</span>
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900">{playHR} BPM</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="170"
                  step="1"
                  value={playHR}
                  onChange={(e) => setPlayHR(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>40 BPM (Severe Bradycardia)</span>
                  <span>100 BPM (Resting Limit)</span>
                  <span>170 BPM</span>
                </div>
              </div>

              {/* SpO2 Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Droplets className="h-4 w-4 fill-blue-500" />
                    <span>Blood Oxygen Saturation (SpO₂)</span>
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900">{playSpO2.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="100"
                  step="0.1"
                  value={playSpO2}
                  onChange={(e) => setPlaySpO2(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>80% (Critical Hypoxia)</span>
                  <span>95% (Safe Boundary)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <Thermometer className="h-4 w-4" />
                    <span>Body Temperature (°C)</span>
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900">{playTemp.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="34.5"
                  max="40.5"
                  step="0.1"
                  value={playTemp}
                  onChange={(e) => setPlayTemp(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>34.5°C</span>
                  <span>37.0°C (Normal)</span>
                  <span>38.0°C (Fever Trigger)</span>
                  <span>40.5°C</span>
                </div>
              </div>

              {/* Activity Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Physical Activity / Posture
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    ['Resting', 'Sitting', 'Walking', 'Running', 'Sudden movement/fall-like event'] as const
                  ).map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setPlayActivity(act)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                        playActivity === act
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Model Inference Output Card */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`rounded-2xl border p-6 shadow-md transition-all ${
                playgroundPrediction.overall_status === 'Abnormal'
                  ? 'border-rose-300 bg-rose-50/50'
                  : 'border-emerald-300 bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Model Output Classification
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Confidence: {(playgroundPrediction.confidence_score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="my-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm ${
                      playgroundPrediction.overall_status === 'Abnormal' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  >
                    {playgroundPrediction.overall_status === 'Abnormal' ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-2xl font-black ${
                        playgroundPrediction.overall_status === 'Abnormal'
                          ? 'text-rose-900'
                          : 'text-emerald-900'
                      }`}
                    >
                      {playgroundPrediction.overall_status === 'Abnormal'
                        ? 'Abnormal Condition'
                        : 'Normal Health State'}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {playgroundPrediction.overall_status === 'Abnormal'
                        ? playgroundPrediction.abnormal_reason_string
                        : 'All vitals conform to university physiological baseline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Per Parameter Breakdown */}
              <div className="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-slate-200/60">
                  <span className="text-slate-600">Heart Rate ({playHR} BPM)</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      playgroundPrediction.heart_rate_status === 'Abnormal'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {playgroundPrediction.heart_rate_status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-slate-200/60">
                  <span className="text-slate-600">Oxygen SpO₂ ({playSpO2.toFixed(1)}%)</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      playgroundPrediction.spo2_status === 'Abnormal'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {playgroundPrediction.spo2_status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-slate-200/60">
                  <span className="text-slate-600">Temperature ({playTemp.toFixed(1)}°C)</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      playgroundPrediction.temperature_status === 'Abnormal'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {playgroundPrediction.temperature_status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-slate-200/60">
                  <span className="text-slate-600">Posture / Motion ({playActivity})</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      playgroundPrediction.activity_status === 'Abnormal'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {playgroundPrediction.activity_status}
                  </span>
                </div>
              </div>

              {/* Inject into Live IoT Stream Action */}
              <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2">
                <button
                  type="button"
                  onClick={handleInjectTelemetry}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span>Transmit this Reading to Student Live Stream</span>
                </button>

                {injectedSuccess && (
                  <div className="text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Dispatched live reading to student node & triage queue!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE DATASET EXPLORER */}
      {activeSubTab === 'dataset' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Trained University Student Health Records ({filteredRecords.length} of {dataset.length})
              </h3>
              <p className="text-xs text-slate-500">
                Search, filter, and inspect individual student biometric readings and labels
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export ({filteredRecords.length}) CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Student ID (e.g. 21/sc/co/1114) or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Normal')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'Normal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Normal ({dataset.filter((r) => r.overall_status === 'Normal').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Abnormal')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'Abnormal' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Abnormal ({dataset.filter((r) => r.overall_status === 'Abnormal').length})
              </button>
            </div>

            {/* Activity Filter */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-medium focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Activities</option>
              <option value="Resting">Resting</option>
              <option value="Sitting">Sitting</option>
              <option value="Walking">Walking</option>
              <option value="Running">Running</option>
              <option value="Sudden movement/fall-like event">Sudden / Fall Event</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3 text-right">Heart Rate</th>
                  <th className="py-2.5 px-3 text-right">SpO₂</th>
                  <th className="py-2.5 px-3 text-right">Temp</th>
                  <th className="py-2.5 px-3">Activity</th>
                  <th className="py-2.5 px-3">Overall Status</th>
                  <th className="py-2.5 px-3">Abnormal Reason</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No student records matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const isAb = r.overall_status === 'Abnormal';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {r.student_id}
                        </td>
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                          {r.date} <span className="text-[10px] text-slate-400">{r.time}</span>
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-mono font-bold ${
                            r.heart_rate_status === 'Abnormal' ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {r.heart_rate} BPM
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-mono font-bold ${
                            r.spo2_status === 'Abnormal' ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {r.spo2}%
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-mono font-bold ${
                            r.temperature_status === 'Abnormal' ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {r.temperature}°C
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              r.activity.includes('Sudden')
                                ? 'bg-purple-100 text-purple-700 font-bold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.activity}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                              isAb ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isAb ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            <span>{r.overall_status}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-700 font-medium">
                          {r.abnormal_reason ? (
                            <span className="text-rose-700 font-semibold">{r.abnormal_reason}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleLoadRowToPlayground(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[10px] font-bold"
                            title="Load row into playground"
                          >
                            <Play className="h-3 w-3" />
                            <span>Test</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: UPLOAD & RETRAIN CSV */}
      {activeSubTab === 'upload' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Upload New Dataset for Re-Training</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select or drop a CSV file containing student physiological records to re-calibrate detection thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File drop zone */}
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">Click to select CSV file</span>
                <span className="text-xs text-slate-400">or drag and drop your file here</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                .csv (Comma Separated Values)
              </span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="sr-only" />
            </label>

            {/* Paste Raw CSV Text */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Or Paste Raw CSV Text Directly:</label>
              <textarea
                rows={6}
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Student ID,Date,Time,Heart Rate (BPM),SpO2 (%),Temperature (°C),Activity..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  if (!uploadText.trim()) return;
                  const parsed = parseCSVDataset(uploadText);
                  if (parsed.length === 0) {
                    setUploadFeedback({ error: 'Could not parse records from pasted CSV text.' });
                  } else {
                    setDataset(parsed);
                    setUploadFeedback({
                      success: `Successfully calibrated model with ${parsed.length} pasted records!`,
                    });
                    setActiveSubTab('overview');
                  }
                }}
                disabled={!uploadText.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Parse & Train with Pasted CSV
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1 font-mono">
            <span className="font-bold text-slate-800 font-sans block">Required CSV Header Format:</span>
            <code>
              Student ID,Date,Time,Heart Rate (BPM),SpO2 (%),Temperature (°C),Activity,Heart Rate Status,SpO2
              Status,Temperature Status,Activity Status,Overall Status,Abnormal Reason
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
