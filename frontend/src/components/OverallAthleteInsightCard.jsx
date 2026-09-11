import React from 'react';
import { Stethoscope, CheckCircle2, TrendingUp, Calendar, AlertTriangle, UserCheck, Activity, Clock } from 'lucide-react';

export const OverallAthleteInsightCard = ({ athlete, overallInsightData }) => {
  const latestInsight = overallInsightData?.latest_insight || null;
  const objectiveTrends = overallInsightData?.objective_trends || [];

  const overallStatus = latestInsight?.overall_status || 'Pending Physio Assessment';
  const overallComment = latestInsight?.overall_comment || null;
  const progressPercent = latestInsight?.recovery_progress_percent ?? null;
  const currentRestrictions = latestInsight?.current_restrictions || null;
  const nextFollowup = latestInsight?.next_followup_date || null;
  const physioName = latestInsight?.physio_name || null;

  const isCleared = overallStatus.toLowerCase().includes('clear');
  const isConditional = overallStatus.toLowerCase().includes('conditional');
  const isPending = !latestInsight || overallStatus.toLowerCase().includes('pending');

  return (
    <div className="p-6 sm:p-8 rounded-2xl theme-card border border-emerald-500/30 shadow-2xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">
              OVERALL PHYSIOTHERAPIST INSIGHT
            </span>
          </div>
          <h2 className="text-2xl font-black theme-text font-display tracking-tight mt-1">
            {athlete?.user?.name || athlete?.name || 'Athlete'}'s Longitudinal Rehabilitation Status
          </h2>
          <p className="text-xs theme-muted mt-0.5">
            Sport: <strong className="theme-text">{athlete?.sport || 'General'}</strong> | Total Videos Analyzed: <strong className="text-amber-600 dark:text-amber-400 font-mono">{overallInsightData?.total_assessments_count || 0}</strong>
          </p>
        </div>

        <div className="shrink-0">
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md inline-flex items-center space-x-2 ${
            isCleared
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-500/50'
              : isConditional
              ? 'bg-amber-100 text-amber-900 border border-amber-400 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-500/50'
              : isPending
              ? 'bg-slate-200 text-slate-900 border border-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
              : 'bg-purple-100 text-purple-900 border border-purple-400 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-500/50'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isCleared ? 'bg-emerald-600' : isPending ? 'bg-slate-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span>Status: {overallStatus}</span>
          </span>
        </div>
      </div>

      {/* Key Patterns Section (Objective AI Trends + Physio Restrictions) */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center space-x-1.5">
          <Activity className="w-4 h-4" />
          <span>KEY PATTERNS & BIOMECHANICAL TRENDS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          {/* Objective AI Trends */}
          <div className="p-4 rounded-xl theme-card border border-white/10 space-y-2">
            <span className="block text-[10px] font-extrabold uppercase theme-muted">Objective AI Telemetry Trends</span>
            {objectiveTrends.length > 0 ? (
              <div className="space-y-1.5">
                {objectiveTrends.map((tr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="theme-text font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{tr.label}</span>
                    </span>
                    <span className="font-mono font-extrabold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                      {tr.initial} → {tr.latest}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="theme-muted text-[11px] italic">
                Upload at least 2 movement assessment videos to track biomechanical trend progression over time.
              </p>
            )}
          </div>

          {/* Physio Guidance & Current Restrictions */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 space-y-2">
            <span className="block text-[10px] font-extrabold uppercase text-amber-900 dark:text-amber-300">Physio Restrictions & Precautions</span>
            {currentRestrictions ? (
              <div className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200 font-medium">
                <div className="flex items-start space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{currentRestrictions}</span>
                </div>
              </div>
            ) : (
              <p className="text-amber-900 dark:text-amber-200 font-semibold text-[11px] italic">
                No active movement restrictions recorded by physiotherapist.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Recovery Progress Bar */}
      <div className="space-y-2 p-4 rounded-xl theme-card border border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase theme-muted flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Rehabilitation Recovery Progress</span>
          </span>
          <span className="font-mono font-black text-emerald-800 dark:text-emerald-400 text-sm">
            {progressPercent !== null && progressPercent !== undefined ? `${progressPercent}%` : 'In Assessment'}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent !== null && progressPercent !== undefined ? Math.min(100, Math.max(0, progressPercent)) : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Physio's Overall Comment */}
      <div className="p-4.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 space-y-2">
        <span className="block text-[10px] font-extrabold uppercase text-emerald-900 dark:text-emerald-300">
          💬 PHYSIOTHERAPIST'S OVERALL COMMENT
        </span>
        {overallComment ? (
          <blockquote className="text-xs theme-text leading-relaxed italic border-l-2 border-emerald-600 pl-3 py-1 font-medium">
            "{overallComment}"
          </blockquote>
        ) : (
          <p className="text-xs theme-text font-semibold italic pl-1">
            No overall clinical comment recorded by physiotherapist yet.
          </p>
        )}
      </div>

      {/* Footer Details: Next Follow-up & Physio Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
        <div className="flex items-center space-x-2 text-xs">
          <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span className="theme-muted font-medium">Next Scheduled Follow-up:</span>
          <strong className="text-amber-900 dark:text-amber-200 font-mono font-extrabold bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30">
            {nextFollowup ? new Date(nextFollowup).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
          </strong>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          {physioName ? (
            <>
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-black theme-text block">
                  {physioName}
                </span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">
                  Verified Physiotherapist ✓
                </span>
              </div>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-xs font-black theme-text block">Unassigned Physio</span>
                <span className="text-[10px] theme-muted font-extrabold uppercase tracking-wider block">Pending Clinical Review</span>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default OverallAthleteInsightCard;
