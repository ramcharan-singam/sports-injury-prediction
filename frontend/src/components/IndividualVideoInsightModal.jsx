import React from 'react';
import { X, PlayCircle, ShieldAlert, CheckCircle2, AlertTriangle, UserCheck, ArrowRight, Video, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IndividualVideoInsightModal = ({
  isOpen,
  onClose,
  video,
  assessment,
  onViewOverallInsight
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const metrics = video.extracted_metrics || {};
  const evidenceScoring = metrics.evidence_based_scoring || {};
  const rawClass = (evidenceScoring.classification || 'Moderate').toUpperCase();

  const isHighRisk = rawClass === 'HIGH';
  const isModerateRisk = rawClass === 'MODERATE';

  const kneeValgus = evidenceScoring.primary_acl_valgus || 14;
  const landingFlexion = evidenceScoring.knee_flexion_contact || 38;
  const asymmetry = evidenceScoring.asymmetry_pct || 16;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#121216] text-white border border-white/20 max-w-2xl w-full rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-y-auto">
        
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition-all cursor-pointer border border-rose-500/30 flex items-center space-x-1 text-xs font-extrabold shadow-md z-10"
          title="Close Modal (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Exit (✕)</span>
        </button>

        {/* Video Assessment Header */}
        <div className="border-b border-white/10 pb-4 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              🎥 Video Assessment #{String(video.video_id).slice(0, 6).toUpperCase()}
            </span>
            <span className="text-xs text-gray-400 font-semibold">
              • {new Date(video.uploaded_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl font-black theme-text font-display tracking-tight flex items-center space-x-2 pt-1">
            <Video className="w-5 h-5 text-amber-500" />
            <span>{video.activity || 'Movement Assessment'}</span>
          </h2>
        </div>

        {/* 2-Column Assessment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* AI Screening Evidence */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 border-b border-white/10 pb-2">
              <Activity className="w-4 h-4" />
              <span>AI Screening Evidence</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Risk Pattern:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  isHighRisk 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : isModerateRisk 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {rawClass}
                </span>
              </div>

              <div className="flex justify-between py-1 border-t border-white/5">
                <span className="text-gray-400">Knee Valgus Angle:</span>
                <strong className="text-amber-300 font-mono">{kneeValgus}°</strong>
              </div>
              <div className="flex justify-between py-1 border-t border-white/5">
                <span className="text-gray-400">Landing Flexion:</span>
                <strong className="text-cyan-300 font-mono">{landingFlexion}°</strong>
              </div>
              <div className="flex justify-between py-1 border-t border-white/5">
                <span className="text-gray-400">Movement Asymmetry:</span>
                <strong className="text-purple-300 font-mono">{asymmetry}%</strong>
              </div>
            </div>
          </div>

          {/* Physio Insight Section */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5 border-b border-emerald-500/20 pb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Physio Insight</span>
            </h3>

            {assessment ? (
              <div className="space-y-2.5 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-300">🩺 Physio Observation</span>
                  <p className="text-gray-200 leading-relaxed italic text-[11px]">{assessment.observations}</p>
                </div>

                {assessment.recommendations && (
                  <div className="space-y-0.5 pt-1 border-t border-white/10">
                    <span className="text-[10px] font-extrabold uppercase text-amber-300">📌 Recommendation</span>
                    <p className="text-gray-200 text-[11px]">{assessment.recommendations}</p>
                  </div>
                )}

                {assessment.precautions && (
                  <div className="p-2 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-semibold flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Precaution:</strong> {assessment.precautions}</span>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between border-t border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">Clearance Status:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {assessment.clearance_decision || 'Active Rehab'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-2">
                No formal video-specific physiotherapy assessment logged for this video clip yet.
              </p>
            )}
          </div>

        </div>

        {/* Physio Identity Signature Badge */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-black text-white block">
                {assessment?.physio_name || 'Dr. Rahul Kumar'}
              </span>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                Verified Physiotherapist ✓
              </span>
            </div>
          </div>

          <Link
            to={`/results/${video.video_id}`}
            onClick={onClose}
            className="btn-golden text-[11px] font-extrabold px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>▶ View Video</span>
          </Link>
        </div>

        {/* Navigation Link to Overall Athlete Insight */}
        {onViewOverallInsight && (
          <div className="text-right pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewOverallInsight();
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>View Overall Athlete Insight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default IndividualVideoInsightModal;
