import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { PhysioReportModal } from './PhysioReportModal';
import { 
  Stethoscope, ShieldAlert, Plus, CheckCircle2, 
  AlertCircle, Users, Activity, FileText, Video, Eye, Heart, Dumbbell, Calendar, Upload, File, Paperclip, Trash2, Download, Edit, RefreshCw, TrendingUp, Printer, AlertTriangle, Layers
} from 'lucide-react';

export const PhysioDashboard = ({ user }) => {
  const getInitialParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAthleteId = urlParams.get('athlete_id');
    const savedAthleteId = urlAthleteId || localStorage.getItem('injury_sense_physio_selected_athlete_id') || '';
    const urlTab = urlParams.get('tab') || 'records';
    return { athleteId: savedAthleteId, tab: urlTab };
  };

  const initialParams = getInitialParams();
  const [athletesList, setAthletesList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState(initialParams.athleteId);
  const [activeTab, setActiveTab] = useState(initialParams.tab);

  const handleSelectAthlete = (athId) => {
    setSelectedAthleteId(athId);
    if (athId) {
      localStorage.setItem('injury_sense_physio_selected_athlete_id', athId);
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('athlete_id', athId);
      window.history.replaceState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('tab', tabId);
    if (selectedAthleteId) {
      urlParams.set('athlete_id', selectedAthleteId);
    }
    window.history.replaceState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
  };

  // Relational Records State for Selected Athlete
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [rehabPlansList, setRehabPlansList] = useState([]);
  const [recoveryLogsList, setRecoveryLogsList] = useState([]);
  const [clinicalDocsList, setClinicalDocsList] = useState([]);
  const [followupsList, setFollowupsList] = useState([]);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);

  // Form States for Core Physio Functions
  const [assessmentForm, setAssessmentForm] = useState({
    video_id: '',
    observations: 'Clinical examination reveals mild joint tenderness, knee valgus deviation under dynamic squat load, and reduced hamstring flexibility.',
    recommendations: 'Focus on landing control and lower-limb strengthening.',
    precautions: 'Avoid deep knee flexion > 90° and heavy impact sprint drills during acute phase.',
    assessment_severity: 'Moderate',
    clearance_decision: 'Active Rehab'
  });

  const [overallInsightForm, setOverallInsightForm] = useState({
    overall_status: 'Active Rehab',
    overall_comment: 'Movement control has improved across recent assessments. Continue the current rehabilitation program and gradually progress loading based on follow-up assessment.',
    recovery_progress_percent: 75.0,
    current_restrictions: 'High-impact landing drills and maximal acceleration drills currently restricted.',
    next_followup_date: ''
  });

  const [rehabForm, setRehabForm] = useState({
    precautions: 'Avoid deep knee flexion > 90° and heavy impact sprint drills during acute phase.',
    target_clearance_date: '',
    exercises: [
      { exercise_name: 'Isometric Quad Sets', sets: 3, reps: 15, frequency: '2x daily', duration: '2 weeks', instructions: 'Hold for 5 seconds per rep' },
      { exercise_name: 'Single Leg Balance Board', sets: 3, reps: 1, frequency: '1x daily', duration: '3 weeks', instructions: 'Maintain balance for 45s per leg' }
    ]
  });

  const [recoveryForm, setRecoveryForm] = useState({
    physio_defined_recovery_percent: 65,
    improvement_notes: 'Knee valgus angle reduced by 5° compared to baseline screening. Patient demonstrates improved hip stability.',
    baseline_valgus: '14.2°',
    current_valgus: '6.5°'
  });

  const [followupForm, setFollowupForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    outcome_notes: 'Patient reports minimal pain during daily activities. Range of motion improved by 15 degrees.',
    next_followup_date: ''
  });

  const [docUploadState, setDocUploadState] = useState({ document_type: 'PDF Report' });
  const [selectedDocFile, setSelectedDocFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchPhysioData();
  }, []);

  useEffect(() => {
    if (selectedAthleteId) {
      fetchAthleteRelationalData(selectedAthleteId);
    }
  }, [selectedAthleteId]);

  const fetchPhysioData = async () => {
    setLoading(true);
    try {
      const [athletesRes, videosRes] = await Promise.all([
        api.get('/api/athletes'),
        api.get('/api/videos')
      ]);
      const athletes = athletesRes.data || [];
      const videos = videosRes.data || [];
      setAthletesList(athletes);
      setVideosList(videos);

      if (athletes.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('athlete_id');
        const savedId = urlId || localStorage.getItem('injury_sense_physio_selected_athlete_id');

        const match = athletes.find(a => String(a.athlete_id) === String(savedId));
        const targetId = match ? match.athlete_id : athletes[0].athlete_id;

        setSelectedAthleteId(targetId);
        localStorage.setItem('injury_sense_physio_selected_athlete_id', targetId);
      }
    } catch (err) {
      console.error("Error fetching physio data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAthleteRelationalData = async (athleteId) => {
    try {
      const [assRes, planRes, recRes, docRes, folRes] = await Promise.all([
        api.get(`/api/athletes/${athleteId}/assessments`),
        api.get(`/api/athletes/${athleteId}/rehab-plans`),
        api.get(`/api/athletes/${athleteId}/recovery-monitoring`),
        api.get(`/api/athletes/${athleteId}/clinical-documents`),
        api.get(`/api/athletes/${athleteId}/followups`)
      ]);
      setAssessmentsList(assRes.data || []);
      setRehabPlansList(planRes.data || []);
      setRecoveryLogsList(recRes.data || []);
      setClinicalDocsList(docRes.data || []);
      setFollowupsList(folRes.data || []);
    } catch (err) {
      console.error("Error fetching athlete clinical records:", err);
    }
  };

  const formatApiError = (err, fallbackMsg = 'Operation failed.') => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail.map(d => {
          const fieldName = Array.isArray(d.loc) ? d.loc.filter(x => x !== 'body').join(' ➔ ') : '';
          return `${fieldName ? fieldName + ': ' : ''}${d.msg}`;
        }).join('\n');
      }
      if (typeof detail === 'object') return JSON.stringify(detail);
    }
    return err.message || fallbackMsg;
  };

  // 1. Submit Video-Specific Assessment
  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;
    setSubmitting(true);
    try {
      const sanitizedPayload = {
        video_id: assessmentForm.video_id || null,
        injury_id: assessmentForm.injury_id || null,
        observations: assessmentForm.observations,
        recommendations: assessmentForm.recommendations || null,
        precautions: assessmentForm.precautions || null,
        assessment_severity: assessmentForm.assessment_severity || 'Moderate',
        clearance_decision: assessmentForm.clearance_decision || 'Active Rehab'
      };
      const res = await api.post(`/api/athletes/${selectedAthleteId}/assessments`, sanitizedPayload);
      setAssessmentsList([res.data, ...assessmentsList]);
      setActionSuccess('✓ Video-Specific Physio Assessment recorded successfully! Athlete has been notified.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(formatApiError(err, 'Failed to record professional assessment.'));
    } finally {
      setSubmitting(false);
    }
  };

  // 1b. Submit Overall Athlete Insight
  const handleOverallInsightSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;
    setSubmitting(true);
    try {
      const sanitizedPayload = {
        overall_status: overallInsightForm.overall_status || 'Active Rehab',
        overall_comment: overallInsightForm.overall_comment || null,
        recovery_progress_percent: overallInsightForm.recovery_progress_percent !== '' && overallInsightForm.recovery_progress_percent !== null ? parseFloat(overallInsightForm.recovery_progress_percent) : null,
        current_restrictions: overallInsightForm.current_restrictions || null,
        next_followup_date: overallInsightForm.next_followup_date ? overallInsightForm.next_followup_date : null
      };
      await api.post(`/api/athletes/${selectedAthleteId}/overall-insight`, sanitizedPayload);
      setActionSuccess('✓ Overall Athlete Physio Insight recorded successfully! Athlete has been notified.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(formatApiError(err, 'Failed to record overall insight.'));
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit Rehabilitation Plan (Function 5)
  const handleRehabPlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;

    const sanitizedPayload = {
      injury_id: rehabForm.injury_id || null,
      precautions: rehabForm.precautions || null,
      target_clearance_date: rehabForm.target_clearance_date ? rehabForm.target_clearance_date : null,
      exercises: (rehabForm.exercises || []).map(ex => ({
        exercise_name: ex.exercise_name?.trim() || 'General Exercise',
        sets: Math.max(1, parseInt(ex.sets, 10) || 3),
        reps: Math.max(1, parseInt(ex.reps, 10) || 10),
        frequency: ex.frequency || '1x daily',
        duration: ex.duration || '2 weeks',
        instructions: ex.instructions || null
      }))
    };

    if (sanitizedPayload.exercises.length === 0) {
      alert('Please add at least one exercise to the rehabilitation plan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/api/athletes/${selectedAthleteId}/rehab-plans`, sanitizedPayload);
      setRehabPlansList([res.data, ...rehabPlansList]);
      setActionSuccess('✓ Rehabilitation & exercise plan prescribed successfully! Athlete has been notified.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(formatApiError(err, 'Failed to create rehabilitation plan.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExerciseRow = () => {
    setRehabForm({
      ...rehabForm,
      exercises: [
        ...rehabForm.exercises,
        { exercise_name: '', sets: 3, reps: 10, frequency: '1x daily', duration: '2 weeks', instructions: '' }
      ]
    });
  };

  const handleRemoveExerciseRow = (index) => {
    setRehabForm({
      ...rehabForm,
      exercises: rehabForm.exercises.filter((_, idx) => idx !== index)
    });
  };

  // 3. Submit Recovery Monitoring Session (Function 6)
  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;
    setSubmitting(true);
    try {
      const payload = {
        physio_defined_recovery_percent: recoveryForm.physio_defined_recovery_percent ? parseFloat(recoveryForm.physio_defined_recovery_percent) : 0,
        improvement_notes: recoveryForm.improvement_notes || null,
        baseline_metrics: { knee_valgus: recoveryForm.baseline_valgus },
        current_metrics: { knee_valgus: recoveryForm.current_valgus }
      };
      const res = await api.post(`/api/athletes/${selectedAthleteId}/recovery-monitoring`, payload);
      setRecoveryLogsList([res.data, ...recoveryLogsList]);
      setActionSuccess('✓ Recovery monitoring progress recorded successfully! Athlete has been notified.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(formatApiError(err, 'Failed to record recovery progress.'));
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Submit Follow-up Visit (Function 7)
  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;
    setSubmitting(true);
    try {
      const sanitizedPayload = {
        visit_date: followupForm.visit_date || new Date().toISOString().split('T')[0],
        outcome_notes: followupForm.outcome_notes || 'Follow-up visit completed.',
        next_followup_date: followupForm.next_followup_date ? followupForm.next_followup_date : null
      };
      const res = await api.post(`/api/athletes/${selectedAthleteId}/followups`, sanitizedPayload);
      setFollowupsList([res.data, ...followupsList]);
      setActionSuccess('✓ Follow-up visit outcome recorded successfully! Athlete has been notified.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(formatApiError(err, 'Failed to record follow-up.'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAthlete = athletesList.find(a => a.athlete_id === selectedAthleteId) || athletesList[0];
  const athleteVideos = selectedAthlete ? videosList.filter(v => v.athlete_id === selectedAthlete.athlete_id) : [];

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl theme-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Physiotherapist Clinical Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight font-display mt-2">
            Clinical Assessment, Rehabilitation & Recovery Management — Dr. {user?.name}
          </h1>
          <p className="theme-muted text-xs sm:text-sm mt-1">
            InjurySense does not replace a physiotherapist. The AI engine extracts movement metrics and screens risk patterns; the physiotherapist conducts professional assessments, prescribes rehabilitation, monitors recovery progress, and records follow-ups.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          disabled={!selectedAthlete}
          className="accent-btn font-extrabold text-xs py-3 px-5 rounded-xl flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>Generate Printable Clinical Report</span>
        </button>
      </div>

      {athletesList.length === 0 ? (
        <div className="p-8 rounded-2xl theme-card text-center space-y-3 border border-white/10">
          <Stethoscope className="w-12 h-12 text-emerald-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold theme-text">No Granted Athletes Found</h3>
          <p className="text-xs theme-muted max-w-md mx-auto">
            Once an owning Coach grants access to an athlete, their full clinical portal will activate here.
          </p>
        </div>
      ) : (
        <>
          {/* Athlete Selector & 7-Functionality Navigation Header */}
          <div className="p-6 rounded-2xl theme-card space-y-4 border border-emerald-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Select Granted Athlete</span>
                </h3>
                <p className="text-xs theme-muted">Viewing clinical records and management for selected athlete</p>
              </div>

              <select
                value={selectedAthleteId}
                onChange={(e) => handleSelectAthlete(e.target.value)}
                className="w-full sm:w-80 theme-input rounded-xl px-3.5 py-2.5 text-xs font-bold theme-text cursor-pointer"
              >
                {athletesList.map(a => (
                  <option key={a.athlete_id} value={a.athlete_id}>
                    {a.user ? a.user.name : `Athlete ${a.athlete_id.slice(0, 8)}`} — {a.sport} ({a.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Core Functionalities Tab Bar */}
            <div className="p-2 rounded-2xl theme-card border border-emerald-500/20 bg-[#FFF8F0]/80 dark:bg-black/40 backdrop-blur-md flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold shadow-sm">
              {[
                { id: 'records', label: '1. Athlete Records', icon: Users },
                { id: 'movement', label: '2. Movement Analysis', icon: Video },
                { id: 'assessment', label: '3. Professional Assessment', icon: FileText },
                { id: 'rehab', label: '4. Rehabilitation Plan', icon: Dumbbell },
                { id: 'recovery', label: '5. Recovery Monitoring', icon: TrendingUp },
                { id: 'reports', label: '6. Follow-up & Reports', icon: Calendar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-2.5 rounded-xl flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md font-extrabold border border-emerald-700/30'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-500/10 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {actionSuccess && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* TAB 1: ATHLETE RECORDS */}
          {activeTab === 'records' && selectedAthlete && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl theme-card space-y-4 border border-white/10">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Athlete Demographic Profile & Clinical History</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 theme-input rounded-xl space-y-2 border border-white/10">
                    <span className="font-bold theme-text text-sm block border-b border-white/10 pb-1">
                      {selectedAthlete.user ? selectedAthlete.user.name : 'Athlete Profile'}
                    </span>
                    <div className="flex justify-between"><span className="theme-muted">Email:</span><span className="theme-text font-semibold">{selectedAthlete.user?.email}</span></div>
                    <div className="flex justify-between"><span className="theme-muted">Sport & Position:</span><span className="text-cyan-400 font-bold">{selectedAthlete.sport} ({selectedAthlete.position})</span></div>
                    <div className="flex justify-between"><span className="theme-muted">Age / Height / Weight:</span><span className="theme-text">{selectedAthlete.age} yrs / {selectedAthlete.height} cm / {selectedAthlete.weight} kg</span></div>
                    <div className="flex justify-between"><span className="theme-muted">Dominant Leg:</span><span className="theme-text font-semibold">{selectedAthlete.dominant_leg || 'Right'}</span></div>
                  </div>

                  <div className="p-4 theme-input rounded-xl space-y-2 border border-white/10">
                    <span className="font-bold theme-text text-sm block border-b border-white/10 pb-1">
                      Relevant Injury & Rehabilitation History
                    </span>
                    <p className="theme-muted leading-relaxed text-[11px] italic">
                      {selectedAthlete.previous_injuries_summary || 'No historical injury summary recorded by coach.'}
                    </p>
                    <div className="pt-2 flex justify-between">
                      <span className="theme-muted">Recurrence Flag:</span>
                      <span className="text-amber-400 font-bold">{selectedAthlete.injury_recurrence_flag || 'No'}</span>
                    </div>
                  </div>

                  <div className="p-4 theme-input rounded-xl space-y-2 border border-white/10">
                    <span className="font-bold theme-text text-sm block border-b border-white/10 pb-1">
                      Active Reported Symptoms
                    </span>
                    <p className="theme-muted text-[11px]">
                      {selectedAthlete.injuries?.[0]?.symptoms || 'No active acute symptoms reported at present.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVEMENT ANALYSIS */}
          {activeTab === 'movement' && selectedAthlete && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl theme-card space-y-4 border border-cyan-500/20">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-3">
                  <Video className="w-5 h-5 text-cyan-400" />
                  <span>Movement Analysis & MediaPipe Pose Tracking Telemetry ({athleteVideos.length})</span>
                </h3>

                {athleteVideos.length === 0 ? (
                  <div className="text-xs theme-muted italic p-6 theme-input rounded-xl text-center">
                    No movement assessment videos uploaded for this athlete yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {athleteVideos.map((vid) => (
                      <div key={vid.video_id} className="p-5 theme-input rounded-xl space-y-4 border border-white/10 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-extrabold text-sm theme-text">{vid.activity}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              {vid.processing_status}
                            </span>
                          </div>
                          <div className="text-xs theme-muted space-y-1">
                            <div>Framerate: <strong className="theme-text">{vid.fps || 60} FPS</strong> ({vid.duration || 5}s)</div>
                            <div>Quality Score: <strong className="text-emerald-400">{vid.quality_score || 92}%</strong></div>
                            <div>Pose Engine: <strong className="text-cyan-400">MediaPipe (33 Keypoints)</strong></div>
                          </div>
                        </div>

                        <Link
                          to={`/results/${vid.video_id}`}
                          className="accent-btn text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Pose Overlay & Telemetry</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROFESSIONAL ASSESSMENT */}
          {activeTab === 'assessment' && selectedAthlete && (
            <div className="space-y-6">
              {/* Section 1: Video-Specific Professional Assessment */}
              <div className="p-6 rounded-2xl theme-card space-y-6 border border-emerald-500/30">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>Individual Video Assessment (Single Movement)</span>
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Video-Specific Telemetry Link
                  </span>
                </div>

                <form onSubmit={handleAssessmentSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                      Select Target Movement Assessment Video *
                    </label>
                    <select
                      required
                      value={assessmentForm.video_id}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, video_id: e.target.value })}
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Select Athlete's Video --</option>
                      {athleteVideos.map(v => (
                        <option key={v.video_id} value={v.video_id}>
                          {v.activity || 'Movement Video'} — {new Date(v.uploaded_at || Date.now()).toLocaleDateString()} (ID: {v.video_id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Physiotherapist Assessment Severity *
                      </label>
                      <select
                        value={assessmentForm.assessment_severity}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, assessment_severity: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold focus:outline-none"
                      >
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Clearance Decision for Video *
                      </label>
                      <select
                        value={assessmentForm.clearance_decision}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, clearance_decision: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold focus:outline-none"
                      >
                        <option value="Active Rehab">Active Rehab Required</option>
                        <option value="Conditional">Conditional Clearance</option>
                        <option value="Fully Cleared">Fully Cleared for Competition</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                      Video Specific Observations *
                    </label>
                    <textarea
                      rows="3"
                      required
                      value={assessmentForm.observations}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, observations: e.target.value })}
                      placeholder="Record clinical observations for this specific video movement..."
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Recommendations (Video Specific)
                      </label>
                      <textarea
                        rows="2"
                        value={assessmentForm.recommendations}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, recommendations: e.target.value })}
                        placeholder="e.g. Focus on landing control and foot posture..."
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Precautions (Video Specific)
                      </label>
                      <textarea
                        rows="2"
                        value={assessmentForm.precautions}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, precautions: e.target.value })}
                        placeholder="e.g. Avoid deep knee flexion > 90°..."
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !assessmentForm.video_id}
                    className="accent-btn font-bold py-3 px-5 rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving Assessment...' : 'Record Video-Specific Assessment'}
                  </button>
                </form>

                {/* History of Past Video-Specific Assessments */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-extrabold theme-text uppercase tracking-wider">
                    Historical Video Assessment Records ({assessmentsList.length})
                  </h4>
                  {assessmentsList.length === 0 ? (
                    <p className="text-xs theme-muted italic">No video assessments recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {assessmentsList.map((ass) => (
                        <div key={ass.assessment_id} className="p-4 theme-input rounded-xl text-xs space-y-2 border border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-400">Date: {new Date(ass.created_at).toLocaleDateString()}</span>
                            <div className="space-x-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                Severity: {ass.assessment_severity}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {ass.clearance_decision}
                              </span>
                            </div>
                          </div>
                          <p className="theme-text leading-relaxed">{ass.observations}</p>
                          {ass.recommendations && <p className="text-emerald-300 text-[11px]"><strong>Recs:</strong> {ass.recommendations}</p>}
                          {ass.precautions && <p className="text-amber-300 text-[11px]"><strong>Precautions:</strong> {ass.precautions}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Overall Athlete Insight (Long-Term Summary Across All Assessments) */}
              <div className="p-6 rounded-2xl theme-card space-y-6 border border-cyan-500/30">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                    <Stethoscope className="w-5 h-5 text-cyan-400" />
                    <span>Overall Athlete Insight (Long-Term Longitudinal Summary)</span>
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Athlete-Wide Overview
                  </span>
                </div>

                <form onSubmit={handleOverallInsightSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Overall Athlete Clearance Status *
                      </label>
                      <select
                        value={overallInsightForm.overall_status}
                        onChange={(e) => setOverallInsightForm({ ...overallInsightForm, overall_status: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold focus:outline-none"
                      >
                        <option value="Active Rehab">Active Rehab Required</option>
                        <option value="Conditional Clearance">Conditional Clearance</option>
                        <option value="Fully Cleared">Fully Cleared for Competition</option>
                        <option value="Cleared with Monitoring">Cleared with Monitoring</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Recovery Progress (%): {overallInsightForm.recovery_progress_percent !== null ? `${overallInsightForm.recovery_progress_percent}%` : 'Not Set'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 75 (Leave blank if unassessed)"
                        value={overallInsightForm.recovery_progress_percent ?? ''}
                        onChange={(e) => setOverallInsightForm({
                          ...overallInsightForm,
                          recovery_progress_percent: e.target.value === '' ? null : parseFloat(e.target.value)
                        })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Next Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={overallInsightForm.next_followup_date || ''}
                        onChange={(e) => setOverallInsightForm({ ...overallInsightForm, next_followup_date: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                      Current Activity & Movement Restrictions
                    </label>
                    <input
                      type="text"
                      value={overallInsightForm.current_restrictions || ''}
                      onChange={(e) => setOverallInsightForm({ ...overallInsightForm, current_restrictions: e.target.value })}
                      placeholder="e.g. High-impact landing drills restricted..."
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                      Overall Physiotherapist Clinical Comment *
                    </label>
                    <textarea
                      rows="4"
                      required
                      value={overallInsightForm.overall_comment}
                      onChange={(e) => setOverallInsightForm({ ...overallInsightForm, overall_comment: e.target.value })}
                      placeholder="Provide long-term clinical summary across all assessments for this athlete..."
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold text-xs shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving Overall Insight...' : 'Record Overall Athlete Insight'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: REHABILITATION PLAN */}
          {activeTab === 'rehab' && selectedAthlete && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl theme-card space-y-6 border border-purple-500/30">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-3">
                  <Dumbbell className="w-5 h-5 text-purple-400" />
                  <span>Rehabilitation Plan & Exercise Prescriptions</span>
                </h3>

                <form onSubmit={handleRehabPlanSubmit} className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Movement Precautions</label>
                      <input
                        type="text"
                        value={rehabForm.precautions}
                        onChange={(e) => setRehabForm({ ...rehabForm, precautions: e.target.value })}
                        placeholder="e.g. Limit deep knee flexion > 90°"
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Target Clearance Date</label>
                      <input
                        type="date"
                        value={rehabForm.target_clearance_date}
                        onChange={(e) => setRehabForm({ ...rehabForm, target_clearance_date: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Prescribed Exercises List Builder */}
                  <div className="space-y-3 p-4 theme-input rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-purple-400 uppercase text-[11px]">Prescribed Exercises ({rehabForm.exercises.length})</span>
                      <button
                        type="button"
                        onClick={handleAddExerciseRow}
                        className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold rounded-lg border border-purple-500/40 text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exercise</span>
                      </button>
                    </div>

                    {rehabForm.exercises.map((ex, idx) => (
                      <div key={idx} className="p-3.5 bg-black/40 border border-purple-500/20 rounded-xl space-y-3 relative">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1">
                          <span className="text-[10px] font-extrabold uppercase text-purple-400">Exercise #{idx + 1}</span>
                          {rehabForm.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseRow(idx)}
                              className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                              title="Remove Exercise"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-extrabold uppercase theme-muted mb-1">Exercise Name *</label>
                            <input
                              type="text"
                              placeholder="Exercise Name"
                              required
                              value={ex.exercise_name}
                              onChange={(e) => {
                                const updated = [...rehabForm.exercises];
                                updated[idx].exercise_name = e.target.value;
                                setRehabForm({ ...rehabForm, exercises: updated });
                              }}
                              className="w-full theme-input rounded-lg px-2.5 py-1.5 theme-text font-bold text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-extrabold uppercase theme-muted mb-1">Sets</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Sets"
                              value={ex.sets}
                              onChange={(e) => {
                                const updated = [...rehabForm.exercises];
                                const val = parseInt(e.target.value, 10);
                                updated[idx].sets = isNaN(val) ? '' : Math.max(1, val);
                                setRehabForm({ ...rehabForm, exercises: updated });
                              }}
                              className="w-full theme-input rounded-lg px-2.5 py-1.5 theme-text text-xs font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-extrabold uppercase theme-muted mb-1">Reps</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Reps"
                              value={ex.reps}
                              onChange={(e) => {
                                const updated = [...rehabForm.exercises];
                                const val = parseInt(e.target.value, 10);
                                updated[idx].reps = isNaN(val) ? '' : Math.max(1, val);
                                setRehabForm({ ...rehabForm, exercises: updated });
                              }}
                              className="w-full theme-input rounded-lg px-2.5 py-1.5 theme-text text-xs font-bold"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-extrabold uppercase theme-muted mb-1">Frequency</label>
                            <input
                              type="text"
                              placeholder="e.g. 1x daily"
                              value={ex.frequency}
                              onChange={(e) => {
                                const updated = [...rehabForm.exercises];
                                updated[idx].frequency = e.target.value;
                                setRehabForm({ ...rehabForm, exercises: updated });
                              }}
                              className="w-full theme-input rounded-lg px-2.5 py-1.5 theme-text text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase theme-muted mb-1">Instructions / Specific Guidance</label>
                          <input
                            type="text"
                            placeholder="Instructions e.g. Hold 5s per rep"
                            value={ex.instructions}
                            onChange={(e) => {
                              const updated = [...rehabForm.exercises];
                              updated[idx].instructions = e.target.value;
                              setRehabForm({ ...rehabForm, exercises: updated });
                            }}
                            className="w-full theme-input rounded-lg px-2.5 py-1.5 theme-text text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="accent-btn font-bold py-3 px-5 rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Prescribing Plan...' : 'Prescribe Rehabilitation Plan'}
                  </button>
                </form>


              </div>
            </div>
          )}

          {/* TAB 6: RECOVERY MONITORING */}
          {activeTab === 'recovery' && selectedAthlete && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl theme-card space-y-6 border border-emerald-500/30">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Recovery Monitoring & Longitudinal Biomechanical Telemetry Comparison</span>
                </h3>

                <form onSubmit={handleRecoverySubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">
                        Physiotherapist-Defined Recovery Progress %: <strong className="text-emerald-400 font-mono text-sm">{recoveryForm.physio_defined_recovery_percent}%</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={recoveryForm.physio_defined_recovery_percent}
                        onChange={(e) => setRecoveryForm({ ...recoveryForm, physio_defined_recovery_percent: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Baseline Knee Valgus (°)</label>
                      <input
                        type="text"
                        value={recoveryForm.baseline_valgus}
                        onChange={(e) => setRecoveryForm({ ...recoveryForm, baseline_valgus: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Current Knee Valgus (°)</label>
                      <input
                        type="text"
                        value={recoveryForm.current_valgus}
                        onChange={(e) => setRecoveryForm({ ...recoveryForm, current_valgus: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Improvement Notes & Risk-Pattern Changes</label>
                    <textarea
                      rows="3"
                      value={recoveryForm.improvement_notes}
                      onChange={(e) => setRecoveryForm({ ...recoveryForm, improvement_notes: e.target.value })}
                      placeholder="Record biomechanical improvement notes e.g. Knee valgus deviation reduced from 14° to 6°..."
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="accent-btn font-bold py-3 px-5 rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving Progress...' : 'Log Recovery Monitoring Session'}
                  </button>
                </form>

                {/* History of Recovery Monitoring Logs */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-extrabold theme-text uppercase tracking-wider">
                    Recovery Monitoring Sessions ({recoveryLogsList.length})
                  </h4>

                  {recoveryLogsList.length === 0 ? (
                    <p className="text-xs theme-muted italic">No recovery monitoring sessions logged yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recoveryLogsList.map((rec) => (
                        <div key={rec.monitoring_id} className="p-4 theme-input rounded-xl text-xs space-y-2 border border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-400">Logged: {new Date(rec.created_at).toLocaleDateString()}</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {rec.physio_defined_recovery_percent}% Physiotherapist-Defined Recovery Progress
                            </span>
                          </div>
                          <p className="theme-text">{rec.improvement_notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FOLLOW-UP & REPORTS */}
          {activeTab === 'reports' && selectedAthlete && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl theme-card space-y-6 border border-cyan-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Follow-up Visits & Printable Clinical Assessment Reports</span>
                  </h3>

                  <button
                    onClick={() => setShowReportModal(true)}
                    className="accent-btn font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-lg cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Generate Printable Clinical Assessment Report</span>
                  </button>
                </div>

                <form onSubmit={handleFollowupSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Visit Date *</label>
                      <input
                        type="date"
                        required
                        value={followupForm.visit_date}
                        onChange={(e) => setFollowupForm({ ...followupForm, visit_date: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Next Follow-up Date</label>
                      <input
                        type="date"
                        value={followupForm.next_followup_date}
                        onChange={(e) => setFollowupForm({ ...followupForm, next_followup_date: e.target.value })}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase theme-muted mb-1">Follow-up Outcome Notes & Feedback *</label>
                    <textarea
                      rows="3"
                      required
                      value={followupForm.outcome_notes}
                      onChange={(e) => setFollowupForm({ ...followupForm, outcome_notes: e.target.value })}
                      placeholder="Record follow-up outcome notes, athlete feedback, and clinical recommendations..."
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 theme-text focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="accent-btn font-bold py-3 px-5 rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Recording Visit...' : 'Record Follow-up Visit Outcome'}
                  </button>
                </form>

                {/* Follow-up Visit Logs */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-extrabold theme-text uppercase tracking-wider">
                    Follow-up Visit History ({followupsList.length})
                  </h4>

                  {followupsList.length === 0 ? (
                    <p className="text-xs theme-muted italic">No follow-up visits recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {followupsList.map((fol) => (
                        <div key={fol.followup_id} className="p-4 theme-input rounded-xl text-xs space-y-2 border border-white/10">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-cyan-400">Visit Date: {fol.visit_date}</span>
                            {fol.next_followup_date && (
                              <span className="text-emerald-400 text-[11px]">Next Follow-up: {fol.next_followup_date}</span>
                            )}
                          </div>
                          <p className="theme-text">{fol.outcome_notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </>
      )}

      <PhysioReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        athlete={selectedAthlete}
        assessments={assessmentsList}
        rehabPlans={rehabPlansList}
        recoveryLogs={recoveryLogsList}
        followups={followupsList}
        videos={videosList.filter(v => String(v.athlete_id) === String(selectedAthleteId))}
        physioUser={user}
      />

    </div>
  );
};

export default PhysioDashboard;
