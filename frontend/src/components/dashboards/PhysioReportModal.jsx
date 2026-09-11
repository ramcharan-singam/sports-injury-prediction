import React, { useEffect } from 'react';
import { X, Printer, Stethoscope, ShieldAlert, Activity, FileText, CheckCircle2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

export const PhysioReportModal = ({ 
  isOpen, 
  onClose, 
  athlete, 
  assessments = [], 
  rehabPlans = [], 
  recoveryLogs = [], 
  followups = [], 
  videos = [], 
  physioUser 
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !athlete) return null;

  const handlePrint = () => {
    window.print();
  };

  const latestAssessment = assessments[0] || null;
  const latestPlan = rehabPlans[0] || null;
  const latestRecovery = recoveryLogs[0] || null;
  const latestVideo = videos[0] || null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md print:p-0 print:bg-white print:static print:inset-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#121216] dark:bg-[#121216] text-white border border-white/20 max-w-4xl w-full rounded-2xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black print:p-0 print:my-0 print:max-w-none print:block">
        
        {/* Sticky Modal Header with Exit Cross (X) & Print Controls (Hidden when printing) */}
        <div className="sticky top-0 z-30 bg-[#18181f] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl print:hidden shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Official Assessment Report
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="accent-btn font-extrabold text-xs py-2 px-4 rounded-xl flex items-center space-x-2 shadow-lg cursor-pointer hover:scale-105 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition-all cursor-pointer border border-rose-500/30 flex items-center space-x-1.5 text-xs font-extrabold shadow-md hover:scale-105"
              title="Close Report (Esc)"
            >
              <X className="w-5 h-5" />
              <span>Exit (✕)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Report Content Body */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-6 flex-1 print:overflow-visible print:p-0 print:space-y-4">
          
          {/* Report Header */}
          <div className="border-b border-emerald-500/30 pb-4 flex justify-between items-start print:border-black">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-lg print:text-emerald-700">
                <Stethoscope className="w-6 h-6" />
                <span className="tracking-tight">INJURYSENSE CLINICAL PORTAL</span>
              </div>
              <h1 className="text-2xl font-black text-white print:text-black tracking-tight font-display mt-1">
                Printable Clinical Assessment & Follow-up Report
              </h1>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-0.5">
                Authored by: <strong>Dr. {physioUser?.name || 'Physiotherapist'}</strong> | Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="text-right text-xs text-gray-400 print:text-gray-700">
              <span className="font-mono font-bold text-emerald-400 print:text-emerald-800 block text-sm">
                CONFIDENTIAL
              </span>
              <span>Report ID: REP-{athlete.athlete_id?.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Section 1: Comprehensive Athlete Demographic Profile & Physical Baselines */}
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-4 print:border-gray-300 print:bg-gray-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800 border-b border-white/10 print:border-gray-200 pb-2 flex items-center justify-between">
              <span>1. Comprehensive Athlete Demographic & Medical Profile</span>
              <span className="text-[10px] font-mono text-gray-400 print:text-gray-600">ID: {athlete.athlete_id?.slice(0, 8).toUpperCase()}</span>
            </h2>

            {/* Subsection 1: Personal & Athletic Identity */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 print:text-cyan-800 tracking-wider">Personal & Athletic Background</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-gray-200 print:text-black">
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Full Name</span><strong>{athlete.user?.name || 'N/A'}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Email / Phone</span><strong>{athlete.user?.email || 'N/A'} {athlete.user?.phone ? `| ${athlete.user.phone}` : ''}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Sport & Position</span><strong className="text-cyan-400 print:text-cyan-700">{athlete.sport || 'N/A'} ({athlete.position || 'N/A'})</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Team & Jersey #</span><strong>{athlete.team_name || 'Apex Squad'} {athlete.jersey_number ? `#${athlete.jersey_number}` : ''}</strong></div>
              </div>
            </div>

            {/* Subsection 2: Physical Demographics & Medical Clearance */}
            <div className="space-y-1 pt-2 border-t border-white/5 print:border-gray-200">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 print:text-emerald-800 tracking-wider">Demographics & Medical Clearance</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-gray-200 print:text-black">
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Age / DOB / Gender</span><strong>{athlete.age ? `${athlete.age} yrs` : 'N/A'} {athlete.dob ? `(${athlete.dob})` : ''} ({athlete.gender || 'Unspecified'})</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Height / Weight</span><strong>{athlete.height || 'N/A'} cm / {athlete.weight || 'N/A'} kg</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Dominant Leg / Level</span><strong>{athlete.dominant_leg || 'Right'} ({athlete.competition_level || 'Amateur'})</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Medical Status / Clearance</span><strong className="text-emerald-400 print:text-emerald-800">{athlete.current_injury_status || 'Fully Cleared'} ({athlete.medical_clearance_status || 'Cleared'})</strong></div>
              </div>
            </div>

            {/* Subsection 3: Physical Performance & Biomechanical Baselines */}
            <div className="space-y-1 pt-2 border-t border-white/5 print:border-gray-200">
              <span className="text-[10px] font-extrabold uppercase text-purple-400 print:text-purple-800 tracking-wider">Physical Fitness & Biomechanical Baselines</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-gray-200 print:text-black">
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Training Load</span><strong>{athlete.training_load ? `${athlete.training_load}%` : '70%'}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Flexibility</span><strong>{athlete.flexibility ? `${athlete.flexibility}%` : '80%'}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Strength</span><strong>{athlete.strength ? `${athlete.strength}%` : '80%'}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Balance</span><strong>{athlete.balance ? `${athlete.balance}%` : '80%'}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Endurance</span><strong>{athlete.endurance ? `${athlete.endurance}%` : '80%'}</strong></div>
              </div>
              {(athlete.nordic_strength_score || athlete.baseline_less_score || athlete.quad_hamstring_ratio || athlete.hamstring_flexibility) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] border-t border-white/5 print:border-gray-200">
                  {athlete.nordic_strength_score && <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Nordic Strength Score</span><strong className="text-amber-300 print:text-amber-800">{athlete.nordic_strength_score} N</strong></div>}
                  {athlete.baseline_less_score && <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Baseline LESS Score</span><strong className="text-amber-300 print:text-amber-800">{athlete.baseline_less_score} / 17</strong></div>}
                  {athlete.quad_hamstring_ratio && <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Q:H Ratio</span><strong className="text-cyan-300 print:text-cyan-800">{athlete.quad_hamstring_ratio}</strong></div>}
                  {athlete.hamstring_flexibility && <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Hamstring Flex</span><strong className="text-emerald-300 print:text-emerald-800">{athlete.hamstring_flexibility}°</strong></div>}
                </div>
              )}
            </div>

            {/* Subsection 4: Emergency Contact & Notes */}
            {(athlete.previous_injuries_summary || athlete.emergency_contact || athlete.coach_notes) && (
              <div className="pt-2 border-t border-white/5 print:border-gray-200 text-[11px] space-y-1.5">
                {athlete.emergency_contact && (
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px] font-bold uppercase">Emergency Contact:</span>
                    <p className="text-gray-200 print:text-black font-semibold">{athlete.emergency_contact}</p>
                  </div>
                )}
                {athlete.previous_injuries_summary && (
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px] font-bold uppercase">Relevant Injury & Rehabilitation History:</span>
                    <p className="italic text-gray-300 print:text-gray-800">{athlete.previous_injuries_summary}</p>
                  </div>
                )}
                {athlete.coach_notes && (
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px] font-bold uppercase">Coach & Clinical Notes:</span>
                    <p className="text-gray-300 print:text-gray-800 font-medium">{athlete.coach_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: AI Movement Analysis & Biomechanical Telemetry */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 print:border-gray-300 print:bg-gray-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800 border-b border-white/10 print:border-gray-200 pb-1 flex items-center space-x-1.5">
              <Activity className="w-4 h-4" />
              <span>2. AI Movement Analysis & Biomechanical Measurements</span>
            </h2>
            {latestVideo ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-gray-200 print:text-black">
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Activity Analyzed</span><strong>{latestVideo.activity}</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Framerate & Duration</span><strong>{latestVideo.fps || 60} FPS ({latestVideo.duration || 5}s)</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Pose Tracking Engine</span><strong>MediaPipe (33 Landmarks)</strong></div>
                <div><span className="text-gray-400 print:text-gray-600 block text-[10px]">Quality Score %</span><strong className="text-emerald-400 print:text-emerald-700">{latestVideo.quality_score || 92}%</strong></div>
              </div>
            ) : (
              <p className="text-gray-400 italic">No movement analysis video uploaded.</p>
            )}
          </div>

          {/* Section 3: Non-Diagnostic Risk Screening Summary */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 print:border-gray-300 print:bg-gray-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800 border-b border-white/10 print:border-gray-200 pb-1 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>3. System Non-Diagnostic Risk Screening Summary</span>
            </h2>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-gray-400 print:text-gray-600 block text-[10px]">Screening Status:</span>
                <span className="font-bold text-amber-400 print:text-amber-800 text-sm">
                  Elevated Biomechanical Strain / Valgus Deviation Flagged
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 print:bg-amber-100 print:text-amber-900 print:border-amber-400">
                Non-Diagnostic Screening Evidence
              </span>
            </div>
          </div>

          {/* Section 4: Physiotherapist Professional Assessment */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 print:border-emerald-600 print:bg-emerald-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-900 border-b border-emerald-500/20 print:border-emerald-200 pb-1 flex items-center space-x-1.5">
              <FileText className="w-4 h-4" />
              <span>4. Physiotherapist Professional Assessment</span>
            </h2>
            {latestAssessment ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px]">Physiotherapist Assessment Severity</span>
                    <strong className="text-rose-400 print:text-rose-700 font-bold">{latestAssessment.assessment_severity}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px]">Clearance Recommendation</span>
                    <strong className="text-emerald-400 print:text-emerald-800 font-bold">{latestAssessment.clearance_decision}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 print:text-gray-600 block text-[10px] font-bold uppercase">Clinical Observations:</span>
                  <p className="text-gray-200 print:text-black leading-relaxed font-medium">{latestAssessment.observations}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">No formal professional assessment logged yet.</p>
            )}
          </div>

          {/* Section 5: Rehabilitation Plan & Prescribed Exercises */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 print:border-gray-300 print:bg-gray-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 print:text-purple-900 border-b border-white/10 print:border-gray-200 pb-1">
              5. Prescribed Rehabilitation Plan & Exercises
            </h2>
            {latestPlan ? (
              <div className="space-y-3 pt-1">
                {latestPlan.precautions && (
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px] font-bold uppercase">Movement Precautions:</span>
                    <p className="text-amber-300 print:text-amber-900 font-medium">{latestPlan.precautions}</p>
                  </div>
                )}

                {latestPlan.exercises && latestPlan.exercises.length > 0 && (
                  <div>
                    <span className="text-gray-400 print:text-gray-600 block text-[10px] font-bold uppercase mb-1">Prescribed Exercise List ({latestPlan.exercises.length}):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {latestPlan.exercises.map((ex, idx) => (
                        <div key={idx} className="p-2.5 bg-black/40 border border-white/10 rounded-lg print:border-gray-300 print:bg-white text-[11px]">
                          <strong className="theme-text print:text-black block">{ex.exercise_name}</strong>
                          <span className="text-purple-300 print:text-purple-800 text-[10px]">
                            {ex.sets} sets × {ex.reps} reps | {ex.frequency} ({ex.duration})
                          </span>
                          {ex.instructions && <p className="text-gray-400 print:text-gray-600 text-[10px] mt-0.5">{ex.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No active rehabilitation plan prescribed.</p>
            )}
          </div>

          {/* Section 6: Recovery Monitoring Progress Trajectory */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 print:border-gray-300 print:bg-gray-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-900 border-b border-white/10 print:border-gray-200 pb-1 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>6. Recovery Monitoring & Biomechanical Metric Comparison</span>
            </h2>
            {latestRecovery ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 print:text-gray-700 font-bold">Physiotherapist-Defined Recovery Progress %</span>
                  <span className="font-mono font-bold text-emerald-400 print:text-emerald-800 text-sm">{latestRecovery.physio_defined_recovery_percent}% Recovered</span>
                </div>
                {latestRecovery.improvement_notes && (
                  <p className="text-gray-300 print:text-gray-800 italic">{latestRecovery.improvement_notes}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No recovery monitoring sessions logged.</p>
            )}
          </div>

          {/* Section 7: Follow-up Visits Log */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 print:border-gray-300 print:bg-gray-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-900 border-b border-white/10 print:border-gray-200 pb-1 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>7. Follow-up Visits & Clinical Outcomes Log ({followups.length})</span>
            </h2>
            {followups.length > 0 ? (
              <div className="space-y-2 pt-1">
                {followups.slice(0, 3).map((f, idx) => (
                  <div key={idx} className="p-2.5 bg-black/40 border border-white/10 rounded-lg print:border-gray-300 print:bg-white text-[11px] space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-cyan-300 print:text-cyan-900">Visit Date: {f.visit_date}</span>
                      {f.next_followup_date && <span className="text-emerald-400 print:text-emerald-800">Next Follow-up: {f.next_followup_date}</span>}
                    </div>
                    <p className="text-gray-300 print:text-gray-800">{f.outcome_notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No follow-up visits recorded yet.</p>
            )}
          </div>

          {/* Clinical Disclaimer */}
          <div className="pt-4 border-t border-white/10 text-[10px] text-gray-400 print:text-gray-600 space-y-1">
            <p>
              <strong>Clinical & Non-Diagnostic Disclaimer:</strong> InjurySense provides computer vision movement screening metrics and non-diagnostic risk indicators. This report reflects objective screening evidence combined with the Physiotherapist's professional assessment and recovery plan.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PhysioReportModal;
