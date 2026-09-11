import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  UploadCloud, Film, CheckCircle2, Clock, 
  AlertCircle, ArrowRight, PlayCircle, FileVideo, User, Dumbbell, Activity,
  Sparkles, Loader2, Cpu, ShieldAlert, Scan, Check
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
const MAX_FILE_SIZE_MB = 100;

const MOVEMENT_ACTIVITIES = [
  { id: 'jump_landing', name: 'Jump Landing', icon: '🏋️', focus: 'ACL Knee Valgus & Initial Contact Flexion' },
  { id: 'running_sprinting', name: 'Running / Sprinting', icon: '🏃', focus: 'Hamstring Speed Asymmetry & Sprint Workload' },
  { id: 'squat', name: 'Squat', icon: '🦵', focus: 'Deep Knee/Hip Flexion & Lumbar ROM' },
  { id: 'cutting_direction_change', name: 'Cutting / Direction Change', icon: '↔️', focus: 'Torso Lateral Lean & Valgus Asymmetry' },
  { id: 'walking_gait', name: 'Walking / Gait Analysis', icon: '🚶', focus: 'Center-of-Mass Sway Variance & Gait Symmetry' },
  { id: 'single_leg_movement', name: 'Single-Leg Movement', icon: '🦶', focus: 'Single-Leg Postural Instability Index' },
  { id: 'lunge', name: 'Lunge / Split Stance', icon: '🏃‍♂️', focus: 'Anterior Pelvic Tilt & Bilateral Flexion' }
];

const PROCESSING_STAGES = [
  { id: 1, title: 'Video Quality Scan', detail: 'Verifying 30 FPS framerate & lighting clarity' },
  { id: 2, title: 'Pose Keypoint Tracking', detail: 'Extracting 36 anatomical joint landmarks' },
  { id: 3, title: 'Activity Weight Calibration', detail: 'Applying category weights for selected activity' },
  { id: 4, title: 'Risk Pattern Screening', detail: 'Evaluating rules & generating recommendations' }
];

const MICRO_MESSAGES = [
  "🔍 Running OpenCV Video Quality Assessment...",
  "🦴 Detecting RTMPose anatomical joint landmarks frame-by-frame...",
  "📐 Computing knee valgus angle & trunk lateral lean...",
  "⚡ Evaluating hamstring angular-speed asymmetry...",
  "⚖️ Normalizing screening score over assessable categories...",
  "🎥 Encoding web-native H.264 skeleton overlay video..."
];

export const VideoUploadPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('jump_landing');
  const [file, setFile] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [status, setStatus] = useState(null); // QUEUED, PROCESSING, COMPLETED
  const [error, setError] = useState('');

  const [activeStage, setActiveStage] = useState(1);
  const [microMsgIndex, setMicroMsgIndex] = useState(0);

  // Check localStorage for active video processing on page refresh
  useEffect(() => {
    const activeProcessing = localStorage.getItem('active_video_processing');
    if (activeProcessing) {
      try {
        const task = JSON.parse(activeProcessing);
        if (task && task.video_id) {
          setUploading(true);
          setSelectedActivity(task.activity || 'jump_landing');
          setUploadProgress(75);
          
          api.get(`/api/videos/${task.video_id}`)
            .then((res) => {
              setUploadedVideo(res.data);
              setStatus(res.data.processing_status);
              if (res.data.processing_status === 'COMPLETED') {
                localStorage.removeItem('active_video_processing');
                navigate(`/results/${res.data.video_id}`);
              }
            })
            .catch(() => {
              localStorage.removeItem('active_video_processing');
              setUploading(false);
            });
        }
      } catch (e) {
        localStorage.removeItem('active_video_processing');
      }
    }
  }, []);

  useEffect(() => {
    // Fetch user's athlete profile or list of athletes if staff
    api.get('/api/athletes/me')
      .then((res) => {
        setSelectedAthleteId(res.data.athlete_id);
      })
      .catch(() => {
        // Fallback: list all athletes for staff role
        api.get('/api/athletes')
          .then((res) => {
            setAthletes(res.data);
            if (res.data.length > 0) {
              setSelectedAthleteId(res.data[0].athlete_id);
            }
          })
          .catch((err) => console.error(err));
      });
  }, []);

  // Cycle micro-messages and stage steps during processing animation
  useEffect(() => {
    let msgInterval = null;
    let stageInterval = null;

    if (uploading || (uploadedVideo && status !== 'COMPLETED' && status !== 'FAILED')) {
      msgInterval = setInterval(() => {
        setMicroMsgIndex((prev) => (prev + 1) % MICRO_MESSAGES.length);
      }, 1400);

      stageInterval = setInterval(() => {
        setActiveStage((prev) => (prev < 4 ? prev + 1 : 4));
      }, 2500);
    } else {
      setActiveStage(1);
      setMicroMsgIndex(0);
    }

    return () => {
      if (msgInterval) clearInterval(msgInterval);
      if (stageInterval) clearInterval(stageInterval);
    };
  }, [uploading, uploadedVideo, status]);

  // Live status poller when video is uploaded
  useEffect(() => {
    let interval = null;
    if (uploadedVideo && status !== 'COMPLETED' && status !== 'FAILED') {
      interval = setInterval(() => {
        api.get(`/api/videos/${uploadedVideo.video_id}`)
          .then((res) => {
            setStatus(res.data.processing_status);
            setUploadedVideo(res.data);
            if (res.data.processing_status === 'COMPLETED') {
              localStorage.removeItem('active_video_processing');
              navigate(`/results/${res.data.video_id}`);
            }
          })
          .catch((err) => console.error(err));
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploadedVideo, status]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      const fileSizeMB = selectedFile.size / (1024 * 1024);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Invalid format '.${ext}'. Please upload an MP4, MOV, AVI, WEBM, or MKV video clip.`);
        setFile(null);
        return;
      }

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB.`);
        setFile(null);
        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid video file to upload.');
      return;
    }
    if (!selectedAthleteId) {
      setError('Please complete your athlete profile first.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(15);
    setActiveStage(1);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('athlete_id', selectedAthleteId);
    formData.append('activity', selectedActivity);

    try {
      const res = await api.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(98, Math.max(15, percentCompleted)));
        }
      });

      localStorage.setItem('active_video_processing', JSON.stringify({
        video_id: res.data.video_id,
        activity: selectedActivity,
        athlete_id: selectedAthleteId
      }));

      setUploadedVideo(res.data);
      setStatus(res.data.processing_status);
      setUploadProgress(100);
      setActiveStage(4);

      if (res.data.processing_status === 'COMPLETED') {
        localStorage.removeItem('active_video_processing');
        navigate(`/results/${res.data.video_id}`);
      }
    } catch (err) {
      localStorage.removeItem('active_video_processing');
      setError(err.response?.data?.detail || 'Video upload failed.');
      setUploading(false);
    }
  };

  const selectedActivityObj = MOVEMENT_ACTIVITIES.find(a => a.id === selectedActivity) || MOVEMENT_ACTIVITIES[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Heading UI */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl accent-badge flex items-center justify-center mx-auto mb-2 shadow-lg">
          <Film className="w-6 h-6 accent-text" />
        </div>
        <h1 className="text-3xl font-extrabold theme-text tracking-tight font-display">Upload Movement Assessment</h1>
        <p className="text-xs theme-muted max-w-md mx-auto">
          Select movement activity type and upload video clip for dynamic evidence-based risk pattern screening
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2.5 text-rose-400 text-xs shadow-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form Card UI */}
      {!uploading && !uploadedVideo ? (
        <form onSubmit={handleUpload} className="p-8 rounded-2xl theme-card border space-y-6 shadow-2xl">
          
          {/* Target Athlete Dropdown */}
          {athletes.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider theme-muted">
                Target Athlete
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 theme-muted" />
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="w-full theme-input rounded-xl pl-10 pr-4 py-2.5 text-xs theme-text appearance-none cursor-pointer"
                >
                  {athletes.map((a) => (
                    <option key={a.athlete_id} value={a.athlete_id} className="bg-dark-card">
                      {a.user ? a.user.name : `Athlete ${a.athlete_id.slice(0, 8)}`} — {a.sport}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Interactive 7 Movement Activity Selector Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-wider theme-muted flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Movement Activity (7 Criteria Types)</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                Active Focus: {selectedActivityObj.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MOVEMENT_ACTIVITIES.map((act) => {
                const isSelected = selectedActivity === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedActivity(act.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                        : 'theme-input hover:border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{act.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      )}
                    </div>
                    <div>
                      <span className={`block text-xs font-bold font-display ${isSelected ? 'text-cyan-300' : 'theme-text'}`}>
                        {act.name}
                      </span>
                      <span className="block text-[9px] theme-muted mt-0.5 line-clamp-1">
                        {act.focus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop File Selector Zone */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider theme-muted">
              Select Video File
            </label>
            <div className="border border-dashed border-white/15 hover:border-cyan-500/50 rounded-xl p-8 text-center theme-input transition-colors">
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
                onChange={handleFileChange}
                className="hidden"
                id="video-input"
              />
              <label htmlFor="video-input" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-full accent-badge flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6 accent-text" />
                </div>
                
                {file ? (
                  <div>
                    <span className="font-semibold theme-text text-xs flex items-center justify-center space-x-1.5">
                      <FileVideo className="w-4 h-4 accent-text" />
                      <span>{file.name}</span>
                    </span>
                    <span className="block text-[10px] theme-muted mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold theme-text block">
                      Click to choose video file or drag and drop
                    </span>
                    <span className="block text-[10px] theme-muted mt-1">
                      Supports .MP4, .MOV, .AVI, .WEBM, .MKV (Max 100MB)
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file}
            className="w-full accent-btn font-semibold py-3 px-6 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{`Upload & Process ${selectedActivityObj.name} Video`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        /* HIGH-TECH ANIMATED PROCESSING & RADAR SCANNER DASHBOARD */
        <div className="p-8 sm:p-10 rounded-2xl theme-card border border-cyan-500/30 shadow-2xl space-y-8 text-center relative overflow-hidden">
          
          {/* Glowing Animated Radar Scanner & Rotating Nodes */}
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            {/* Outer Pulsing Aura Ring */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-40"></div>
            {/* Rotating Scanning Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 animate-[spin_6s_linear_infinite]"></div>
            {/* Inner Glowing Badge with Activity Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 border border-cyan-400/50 flex items-center justify-center text-4xl shadow-inner relative z-10">
              {selectedActivityObj.icon}
            </div>
            {/* Corner Keypoint Node Pulsers */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          </div>

          {/* Heading & Live Status */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold font-mono">
              <Scan className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>AI Pose Landmark Pipeline Active</span>
            </div>

            <h3 className="text-2xl font-black theme-text font-display tracking-tight">
              Processing <span className="text-cyan-400">{selectedActivityObj.name}</span> Assessment
            </h3>
            
            <p className="text-xs text-cyan-300/90 font-mono max-w-md mx-auto h-5 flex items-center justify-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{MICRO_MESSAGES[microMsgIndex]}</span>
            </p>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div className="space-y-2 max-w-lg mx-auto">
            <div className="flex justify-between text-xs font-mono font-bold theme-text">
              <span className="flex items-center space-x-1.5 text-cyan-300">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Extraction & Screening Engine</span>
              </span>
              <span className="text-cyan-400">{uploadProgress}%</span>
            </div>

            <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden border border-white/10 p-0.5 relative shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 transition-all duration-500 ease-out shadow-[0_0_12px_#22d3ee]"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="w-full h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Interactive Pipeline Progress Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2 text-left">
            {PROCESSING_STAGES.map((stg) => {
              const isDone = activeStage > stg.id || status === 'COMPLETED';
              const isCurrent = activeStage === stg.id && status !== 'COMPLETED';
              
              return (
                <div
                  key={stg.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-md ring-1 ring-cyan-400/40'
                      : 'theme-input opacity-50 theme-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider">
                      Stage {stg.id}
                    </span>
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    ) : null}
                  </div>
                  <span className="block text-xs font-bold font-display leading-tight">
                    {stg.title}
                  </span>
                  <span className="block text-[9px] mt-0.5 opacity-80 line-clamp-1">
                    {stg.detail}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Floating Live Landmarks Detected Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/10 text-[11px] font-mono theme-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Extracted Joints:</span>
            {['L_HIP ✓', 'R_HIP ✓', 'L_KNEE ✓', 'R_KNEE ✓', 'L_ANKLE ✓', 'R_ANKLE ✓'].map((j, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] animate-pulse">
                {j}
              </span>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
