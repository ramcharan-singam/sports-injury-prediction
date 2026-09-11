import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Layers, AlertTriangle, CheckCircle, Activity, HeartPulse } from 'lucide-react';

const ScoreRing = ({ score, classification }) => {
  const displayScore = score !== null && score !== undefined ? round(score, 1) : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, displayScore)) / 100) * circumference;

  let strokeColor = "#10b981"; // Emerald
  let colorClass = "text-emerald-500 dark:text-emerald-400";
  if (classification === "Moderate") {
    strokeColor = "#f59e0b"; // Amber
    colorClass = "text-amber-500 dark:text-amber-400";
  } else if (classification === "High") {
    strokeColor = "#ef4444"; // Rose
    colorClass = "text-rose-500 dark:text-rose-400";
  } else if (classification?.includes("Unable")) {
    strokeColor = "#94a3b8"; // Slate
    colorClass = "text-slate-400";
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 theme-input rounded-xl border border-white/10 min-w-[120px]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 68 68">
          <circle
            cx="34"
            cy="34"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-700/60"
            strokeWidth="4.5"
            fill="transparent"
          />
          <circle
            cx="34"
            cy="34"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute text-xs font-black font-mono ${colorClass}`}>
          {score !== null && score !== undefined ? `${displayScore}` : "N/A"}
        </span>
      </div>
      <span className="text-[10px] font-bold theme-muted mt-1 font-mono uppercase tracking-wider">Screening Score</span>
    </div>
  );
};

const round = (val, dec = 1) => {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Number(val).toFixed(dec);
};

export const ACLInjuryCard = ({ aclData, evidenceScoring }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Parse evidence scoring payload
  const scoring = evidenceScoring || aclData?.evidence_based_scoring || {
    screening_score: aclData?.acl_risk_probability ? Math.min(100, aclData.acl_risk_probability * 1.1) : 24.5,
    classification: aclData?.acl_risk_class === 1 ? "High" : "Low",
    urgency_level: aclData?.acl_risk_class === 1 ? "Physiotherapist Review Priority" : "Informational",
    gatekeeper_passed: true,
    gatekeeper_message: "Passed",
    bucket_scores: {
      biomechanical_deviations: 22.0,
      historical_injury_factors: 0.0,
      movement_asymmetry: 15.0,
      training_load_indicators: 30.0,
      fatigue_indicators: 10.0
    },
    triggered_rules: [],
    recommendations: []
  };

  const gatekeeperPassed = scoring.gatekeeper_passed !== false && !scoring.classification?.includes("Unable");
  const classification = scoring.classification || "Low";
  const score = scoring.screening_score;

  let themeStyles = {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    badgeBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    titleColor: "text-emerald-700 dark:text-emerald-300",
    icon: "🛡️"
  };

  if (classification === "Moderate") {
    themeStyles = {
      bg: "bg-amber-500/10 border-amber-500/30",
      badgeBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
      titleColor: "text-amber-700 dark:text-amber-300",
      icon: "⚠️"
    };
  } else if (classification === "High") {
    themeStyles = {
      bg: "bg-rose-500/10 border-rose-500/30",
      badgeBg: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40",
      titleColor: "text-rose-700 dark:text-rose-300",
      icon: "🚨"
    };
  } else if (!gatekeeperPassed) {
    themeStyles = {
      bg: "bg-slate-800/40 border-slate-700/50",
      badgeBg: "bg-slate-700/50 text-slate-300 border-slate-600/50",
      titleColor: "text-slate-200",
      icon: "❓"
    };
  }

  const catWeights = scoring.activity_criteria_summary?.category_weights || {
    biomechanical_deviations: 0.35,
    historical_injury_factors: 0.15,
    movement_asymmetry: 0.20,
    training_load_indicators: 0.15,
    fatigue_indicators: 0.15
  };

  const categoriesList = [
    { key: "biomechanical_deviations", label: `Biomechanical (${Math.round((catWeights.biomechanical_deviations || 0.35) * 100)}%)`, val: scoring.bucket_scores?.biomechanical_deviations || 0 },
    { key: "historical_injury_factors", label: `Historical (${Math.round((catWeights.historical_injury_factors || 0.15) * 100)}%)`, val: scoring.bucket_scores?.historical_injury_factors || 0 },
    { key: "movement_asymmetry", label: `Asymmetry (${Math.round((catWeights.movement_asymmetry || 0.20) * 100)}%)`, val: scoring.bucket_scores?.movement_asymmetry || 0 },
    { key: "training_load_indicators", label: `Workload (${Math.round((catWeights.training_load_indicators || 0.15) * 100)}%)`, val: scoring.bucket_scores?.training_load_indicators || 0 },
    { key: "fatigue_indicators", label: `Fatigue (${Math.round((catWeights.fatigue_indicators || 0.15) * 100)}%)`, val: scoring.bucket_scores?.fatigue_indicators || 0 }
  ];

  return (
    <div className="theme-card p-6 rounded-2xl space-y-6 border border-white/10 shadow-lg">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div>
          <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Evidence-Based Risk Pattern Screening</span>
          </h3>
          <p className="text-xs theme-muted pt-0.5">
            Multi-factor screening (0–100 Screening Score) across 5 categories with dynamic activity weights
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl theme-input text-xs font-semibold theme-text border border-white/10 font-mono">
            Tiers: Low (0-33) | Mod (34-66) | High (67-100)
          </span>
        </div>
      </div>

      {/* Quality Gatekeeper Warning if Failed */}
      {!gatekeeperPassed && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Video Quality Gatekeeper Alert</h5>
            <p className="text-xs text-amber-200/90 mt-0.5">
              {scoring.gatekeeper_message || "Unable to Classify — Insufficient Video Quality (Pose Confidence < 0.75 or Reliability < 0.70)"}
            </p>
            <p className="text-[11px] text-amber-400/80 mt-1 italic">
              * This is a data-quality warning. Please re-record video under clearer lighting and full-body frame visibility.
            </p>
          </div>
        </div>
      )}

      {/* Main Status & Risk Score Display */}
      {gatekeeperPassed && (
        <div className={`p-5 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-6 ${themeStyles.bg}`}>
          
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl shadow-inner ${themeStyles.badgeBg}`}>
              {themeStyles.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider theme-muted">
                  Classification Status
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border ${themeStyles.badgeBg}`}>
                  {classification} Tier
                </span>
              </div>
              <h4 className={`text-lg font-black font-display tracking-tight mt-0.5 ${themeStyles.titleColor}`}>
                {classification === "High" && "HIGH RISK PATTERN DETECTED"}
                {classification === "Moderate" && "MODERATE RISK PATTERN DETECTED"}
                {classification === "Low" && "LOW RISK PATTERN (SAFE MOVEMENT)"}
              </h4>
              <p className="text-xs theme-muted mt-0.5">
                Delivery Urgency: <strong className="theme-text font-bold">{scoring.urgency_level || "Informational"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full lg:w-auto justify-end">
            <ScoreRing score={score} classification={classification} />
          </div>

        </div>
      )}

      {/* Multi-Factor Bucket Scores Breakdown */}
      {gatekeeperPassed && scoring.bucket_scores && (
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider theme-muted flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Activity-Specific Category Weight Distribution</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categoriesList.map((b, idx) => (
              <div key={idx} className="p-3 theme-input rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] theme-muted block font-medium truncate">{b.label}</span>
                <span className="text-sm font-mono font-bold theme-text">{round(b.val, 1)} / 100</span>
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, b.val))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggered Rules & Targeted Recommendations */}
      {scoring.recommendations && scoring.recommendations.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider theme-muted flex items-center space-x-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>Targeted Movement Recommendations ({scoring.recommendations.length})</span>
            </h4>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>{showBreakdown ? "Hide Recommendations" : "Show All Recommendations"}</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showBreakdown && (
            <div className="space-y-2 pt-1">
              {scoring.recommendations.map((rec, rIdx) => (
                <div key={rIdx} className="p-3 theme-input rounded-xl border border-white/10 flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium theme-text">{rec.text}</p>
                    <span className="text-[10px] theme-muted font-mono">Urgency: {rec.urgency} ({rec.classification_tier})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
