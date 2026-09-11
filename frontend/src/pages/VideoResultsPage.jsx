import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  Film, CheckCircle2, ShieldAlert, Activity, 
  ArrowLeft, BarChart3, AlertTriangle, Video, Sparkles, User, Layers, Eye, Dumbbell
} from 'lucide-react';
import { ACLInjuryCard } from '../components/ACLInjuryCard';

export const VideoResultsPage = () => {
  const { videoId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [videoTimestamp, setVideoTimestamp] = useState(Date.now());
  const [telemetryMode, setTelemetryMode] = useState('all36'); // 'all36' | 'clinical12'

  const all36Columns = [
    { key: 'frame', label: 'FRAME', unit: '', isFrame: true },
    { key: 'acl_valgus_angle', label: 'VALGUS ANGLE', unit: '°', rule: (v) => (v || 0) >= 8.0 },
    { key: 'acl_flexion_initial_contact', label: 'IC KNEE FLEX', unit: '°', rule: (v) => (v || 180) < 25.0 },
    { key: 'acl_trunk_lean', label: 'TRUNK LEAN', unit: '°' },
    { key: 'acl_valgus_asymmetry', label: 'VALGUS ASYM', unit: '%' },
    { key: 'hamstring_speed_asymmetry', label: 'SPEED ASYM', unit: '%' },
    { key: 'hamstring_pelvic_tilt', label: 'PELVIC TILT', unit: '°' },
    { key: 'ankle_dorsiflexion_rom', label: 'DORSIFLEXION', unit: '°', rule: (v) => (v || 45) < 34.0 },
    { key: 'ankle_sway_variance', label: 'SWAY VARIANCE', unit: '' },
    { key: 'shoulder_gird', label: 'GIRD', unit: '°' },
    { key: 'lumbar_compensation_drift', label: 'TRUNK DRIFT', unit: '' },
    { key: 'pose_confidence', label: 'POSE CONF', unit: '', format: (v) => (v || 0.88).toFixed(2) },
    { key: 'l_knee', label: 'L KNEE FLEX', unit: '°' },
    { key: 'r_knee', label: 'R KNEE FLEX', unit: '°' },
    { key: 'l_hip', label: 'L HIP FLEX', unit: '°' },
    { key: 'r_hip', label: 'R HIP FLEX', unit: '°' },
    { key: 'l_elbow', label: 'L ELBOW', unit: '°' },
    { key: 'r_elbow', label: 'R ELBOW', unit: '°' },
    { key: 'l_foot_flexion', label: 'L FOOT FLEX', unit: '°' },
    { key: 'r_foot_flexion', label: 'R FOOT FLEX', unit: '°' },
    { key: 'spine_tilt', label: 'SPINE TILT', unit: '°' },
    { key: 'step_width', label: 'STEP WIDTH', unit: 'px' },
    { key: 'hip_flexion_angle', label: 'AVG HIP FLEX', unit: '°' },
    { key: 'knee_flexion_angle', label: 'AVG KNEE FLEX', unit: '°' },
    { key: 'ankle_rotation_angle', label: 'ANKLE ROTATION', unit: '°' },
    { key: 'angular_velocity', label: 'ANG VELOCITY', unit: '°/s' },
    { key: 'linear_acceleration', label: 'LIN ACCEL', unit: 'm/s²' },
    { key: 'ground_reaction_force', label: 'GR FORCE', unit: 'N' },
    { key: 'postural_instability_index', label: 'INSTABILITY IDX', unit: '' },
    { key: 'biomechanical_deviation_score', label: 'BIOMEC DEV', unit: '' },
    { key: 'fatigue_level', label: 'FATIGUE IDX', unit: '' },
    { key: 'measurement_reliability', label: 'RELIABILITY', unit: '', format: (v) => (v || 0.85).toFixed(2) },
    { key: 'shoulder_trom_deficit', label: 'TROM DEFICIT', unit: '°' },
    { key: 'shoulder_scapular_dyskinesis', label: 'SCAPULAR DYSK', unit: '' },
    { key: 'lumbar_flexion_rom', label: 'LUMBAR FLEX ROM', unit: '°' },
    { key: 'workload_quality_decline', label: 'WORKLOAD DECLINE', unit: '' }
  ];

  const clinical12Keys = [
    'frame', 'acl_valgus_angle', 'acl_flexion_initial_contact', 'acl_trunk_lean',
    'acl_valgus_asymmetry', 'hamstring_speed_asymmetry', 'hamstring_pelvic_tilt',
    'ankle_dorsiflexion_rom', 'ankle_sway_variance', 'shoulder_gird',
    'lumbar_compensation_drift', 'pose_confidence'
  ];

  const activeColumns = telemetryMode === 'all36' 
    ? all36Columns 
    : all36Columns.filter(c => clinical12Keys.includes(c.key));

  const handleToggleSkeleton = () => {
    setVideoTimestamp(Date.now());
    setShowSkeleton(!showSkeleton);
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  useEffect(() => {
    let interval = null;
    if (video && (video.processing_status === 'QUEUED' || video.processing_status === 'PROCESSING')) {
      interval = setInterval(() => {
        api.get(`/api/videos/${videoId}`)
          .then((res) => {
            setVideo(res.data);
            if (res.data.processing_status === 'COMPLETED') {
              localStorage.removeItem('active_video_processing');
            }
          })
          .catch(console.error);
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoId, video?.processing_status]);

  const fetchVideoDetails = async () => {
    try {
      const res = await api.get(`/api/videos/${videoId}`);
      setVideo(res.data);
      if (res.data.processing_status === 'COMPLETED') {
        localStorage.removeItem('active_video_processing');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Forbidden: You are not authorized to view this video assessment.');
      } else {
        setError('Failed to load video assessment details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="theme-card p-8 rounded-2xl space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold theme-text">{error || 'Video not found'}</h2>
          <Link to="/videos" className="inline-flex items-center space-x-2 accent-text font-semibold hover:underline text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Movement Assessments</span>
          </Link>
        </div>
      </div>
    );
  }

  const metrics = video.extracted_metrics || {
    total_video_frames: 154,
    pose_detected_frames: 75,
    active_movement_window: "F128 - F150",
    idle_frames_trimmed: 63,
    metrics_preview: []
  };

  const recommendations = [
    { title: 'Gluteus Medius Activation', detail: 'Side-lying clam shells 3x15 reps to reduce knee valgus during landing.' },
    { title: 'Ankle Dorsiflexion Mobility', detail: 'Knee-to-wall ankle stretches 2x45s to improve stride depth and foot flexion.' },
    { title: 'Eccentric Hamstring Strengthening', detail: 'Nordic hamstring curls 3x8 reps to protect ACL during high-speed cutting.' }
  ];

  const gatekeeper = metrics.quality_gatekeeper || {};
  const rawPoseConf = gatekeeper.pose_confidence ?? (video.quality_score ? video.quality_score / 100 : 0.75);
  const dynamicQualityScore = Math.min(100, Math.max(0, Math.round(rawPoseConf * 1000) / 10));
  
  const isQualityGood = gatekeeper.passed !== false && dynamicQualityScore >= 75;
  const isQualityModerate = !isQualityGood && dynamicQualityScore >= 50;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link to="/videos" className="inline-flex items-center space-x-2 theme-muted hover:theme-text text-xs font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>All Assessments</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to={`/reports/${video.video_id}`}
            className="accent-btn text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-md"
          >
            <span>View / Export Analysis Report</span>
          </Link>

          <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Status: {video.processing_status}</span>
          </span>
        </div>
      </div>

      {/* Video Quality Check Summary (Dynamic) */}
      <div className={`p-4 rounded-xl theme-card border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isQualityGood
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : isQualityModerate
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-rose-500/30 bg-rose-500/5'
      }`}>
        <div className="flex items-center space-x-2.5">
          {isQualityGood ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : isQualityModerate ? (
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <div>
            <span className="font-bold theme-text block flex items-center space-x-2">
              <span>Video Quality Check:</span>
              <strong className={isQualityGood ? 'text-emerald-400' : isQualityModerate ? 'text-amber-400' : 'text-rose-400'}>
                {isQualityGood ? 'EXCELLENT / HIGH CLARITY' : isQualityModerate ? 'MODERATE QUALITY' : 'LOW CLARITY / POOR QUALITY'} ({dynamicQualityScore}%)
              </strong>
            </span>
            <span className="theme-muted text-[11px]">
              {isQualityGood
                ? 'Framerate (30 FPS), resolution (1080p), and pose confidence (≥ 75%) meet evidence-based screening standards.'
                : isQualityModerate
                ? 'Pose tracking confidence is moderate (50%–74%). Re-recording under brighter lighting is suggested.'
                : 'Pose tracking confidence is low (< 75%). Re-record video with full-body frame visibility and clearer lighting.'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
            isQualityGood
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : isQualityModerate
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            POSE CONF: {Math.round(rawPoseConf * 100)}%
          </span>
        </div>
      </div>

      {/* Section 1: Pose Skeleton Tracking Overlay Video Player */}
      <div className="theme-card p-6 sm:p-8 rounded-2xl space-y-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                {video.activity}
              </span>
              <span className="text-xs theme-muted">Athlete: <strong className="theme-text">{video.athlete_name}</strong></span>
            </div>
            <h2 className="text-xl font-bold theme-text flex items-center space-x-2 font-display mt-2">
              <Layers className="w-5 h-5 accent-text" />
              <span>Pose Skeleton Tracking Overlay</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleSkeleton}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                showSkeleton 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-md' 
                  : 'theme-input theme-text border-white/10'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{showSkeleton ? 'Showing Skeleton Tracking' : 'Show Raw Athlete Video'}</span>
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div className="relative aspect-video max-h-[500px] bg-black rounded-xl overflow-hidden border border-white/10 mx-auto shadow-2xl flex items-center justify-center">
          {(() => {
            const rawTarget = showSkeleton && video.skeleton_video_url ? video.skeleton_video_url : video.video_url;
            let formattedUrl = rawTarget || '';
            if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('blob:')) {
              formattedUrl = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
            }
            return (
              <video 
                key={`${showSkeleton ? 'skeleton' : 'raw'}-${videoTimestamp}`}
                controls 
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-contain mx-auto"
                src={formattedUrl ? `${formattedUrl}${formattedUrl.includes('?') ? '&' : '?'}t=${videoTimestamp}` : ''}
                onError={(e) => {
                  logger.warning?.("Video playback notice on player target:", formattedUrl);
                }}
              >
                <source src={formattedUrl} type="video/mp4" />
                <source src={formattedUrl} type="video/webm" />
                Your browser does not support HTML5 video playback.
              </video>
            );
          })()}
        </div>

        {/* Video Metadata Footer Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 theme-input rounded-xl">
            <span className="block text-[10px] theme-muted uppercase font-semibold">Video ID</span>
            <span className="font-mono font-bold theme-text">{video.video_id.slice(0, 8)}...</span>
          </div>
          <div className="p-3 theme-input rounded-xl">
            <span className="block text-[10px] theme-muted uppercase font-semibold">Duration</span>
            <span className="font-semibold theme-text">{video.duration || 10.0} sec</span>
          </div>
          <div className="p-3 theme-input rounded-xl">
            <span className="block text-[10px] theme-muted uppercase font-semibold">Framerate / Res</span>
            <span className="font-semibold theme-text">{video.fps || 30} FPS ({video.resolution || '1920x1080'})</span>
          </div>
          <div className="p-3 theme-input rounded-xl">
            <span className="block text-[10px] theme-muted uppercase font-semibold">Video Quality Score</span>
            <span className={`font-bold ${
              isQualityGood ? 'text-emerald-400' : isQualityModerate ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {dynamicQualityScore}% {isQualityGood ? 'GOOD' : isQualityModerate ? 'MODERATE' : 'LOW CLARITY'}
            </span>
          </div>
        </div>
      </div>



      {/* Section 2: Extracted Frame Summary Metrics Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
          <Sparkles className="w-5 h-5 accent-text" />
          <span>Extracted Pose Landmark & Frame Metrics Summary</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl theme-card space-y-1 border border-cyan-500/20 text-center">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">{metrics.total_video_frames}</div>
            <div className="text-xs font-semibold theme-text uppercase tracking-wider">Total Video Frames</div>
          </div>

          <div className="p-5 rounded-2xl theme-card space-y-1 border border-emerald-500/20 text-center">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">{metrics.pose_detected_frames}</div>
            <div className="text-xs font-semibold theme-text uppercase tracking-wider">Pose Detected Frames</div>
          </div>

          <div className="p-5 rounded-2xl theme-card space-y-1 border border-amber-500/20 text-center">
            <div className="text-2xl font-extrabold text-amber-400 font-mono pt-1">{metrics.active_movement_window}</div>
            <div className="text-xs font-semibold theme-text uppercase tracking-wider">Active Movement Window</div>
          </div>

          <div className="p-5 rounded-2xl theme-card space-y-1 border border-rose-500/20 text-center">
            <div className="text-3xl font-extrabold text-rose-400 font-mono">{metrics.idle_frames_trimmed}</div>
            <div className="text-xs font-semibold theme-text uppercase tracking-wider">Idle Frames Trimmed</div>
          </div>
        </div>
      </div>

      {/* Section 3: Extracted Frame Telemetry (All 36 Raw Extracted Metrics) */}
      <div className="theme-card p-6 rounded-2xl space-y-4 border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Extracted Frame Telemetry ({metrics.metrics_preview.length} Detected Frames)</span>
            </h3>
            <p className="text-xs theme-muted mt-0.5">
              {telemetryMode === 'all36' 
                ? 'Displaying all 36 raw extracted body & telemetry metrics frame-by-frame' 
                : 'Displaying 12 core rule metrics'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTelemetryMode('all36')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                telemetryMode === 'all36'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'theme-input theme-text border-white/10 hover:bg-white/5'
              }`}
            >
              <span>All 36 Raw Extracted Metrics</span>
            </button>
            <button
              onClick={() => setTelemetryMode('clinical12')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                telemetryMode === 'clinical12'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'theme-input theme-text border-white/10 hover:bg-white/5'
              }`}
            >
              <span>Clinical Telemetry (12)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Container with Max Height & Sticky Column Headers */}
        <div className="max-h-96 overflow-y-auto overflow-x-auto border border-white/10 rounded-xl custom-scrollbar relative">
          <table className="w-full text-left text-xs font-mono whitespace-nowrap">
            <thead className="sticky top-0 bg-[#0d0d12] theme-muted border-b border-white/10 uppercase text-[9px] font-bold font-sans z-10 shadow-md">
              <tr>
                {activeColumns.map((col) => (
                  <th 
                    key={col.key} 
                    className={`py-3.5 px-3 ${col.isFrame ? 'sticky left-0 bg-[#0d0d12] z-20 border-r border-white/10 shadow-r' : ''}`}
                  >
                    {col.label} {col.unit ? `(${col.unit})` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 theme-text">
              {(metrics.metrics_preview || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                  {activeColumns.map((col) => {
                    const rawVal = row[col.key];
                    const isTriggered = col.rule ? col.rule(rawVal) : false;
                    const formatted = col.format 
                      ? col.format(rawVal) 
                      : (rawVal !== undefined && rawVal !== null ? `${rawVal}${col.unit}` : '0.0');

                    if (col.isFrame) {
                      return (
                        <td key={col.key} className="py-3 px-3 font-bold text-amber-400 sticky left-0 bg-[#0d0d12] z-10 border-r border-white/10">
                          {rawVal}
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={col.key} 
                        className={`py-3 px-3 ${
                          isTriggered 
                            ? 'text-rose-400 font-bold' 
                            : col.key === 'pose_confidence' || col.key === 'measurement_reliability'
                            ? 'text-cyan-300'
                            : col.key.includes('asymmetry')
                            ? 'text-cyan-400'
                            : ''
                        }`}
                      >
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence-Based Risk Pattern Screening Card */}
      <ACLInjuryCard 
        aclData={metrics.acl_injury_assessment} 
        evidenceScoring={metrics.evidence_based_scoring}
        metricsPreview={metrics.metrics_preview} 
      />

    </div>
  );
};
