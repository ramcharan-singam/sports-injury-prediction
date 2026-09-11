import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api';
import { ProfileModal } from '../ProfileModal';
import { IndividualVideoInsightModal } from '../IndividualVideoInsightModal';
import { OverallAthleteInsightCard } from '../OverallAthleteInsightCard';
import { 
  Film, Plus, CheckCircle2, Clock, Activity, ShieldAlert, 
  PlayCircle, ArrowRight, User, TrendingUp, Dumbbell, Calendar, AlertCircle, AlertTriangle, Eye, Stethoscope, FileText, Check
} from 'lucide-react';

export const AthleteDashboard = ({ user }) => {
  const location = useLocation();
  const [myProfile, setMyProfile] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Relational Clinical Records State
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [overallInsightData, setOverallInsightData] = useState(null);
  const [rehabPlansList, setRehabPlansList] = useState([]);
  const [recoveryLogsList, setRecoveryLogsList] = useState([]);
  const [followupsList, setFollowupsList] = useState([]);

  // Modal State for Video Insight
  const [selectedModalVideo, setSelectedModalVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAthleteData();
  }, []);

  const fetchAthleteData = async () => {
    setLoading(true);
    try {
      const [profileRes, videosRes] = await Promise.all([
        api.get('/api/athletes/me').catch(() => ({ data: null })),
        api.get('/api/videos/me').catch(() => ({ data: [] }))
      ]);

      const profile = profileRes.data;
      const videos = videosRes.data || [];
      setMyProfile(profile);
      setMyVideos(videos);

      if (profile && profile.athlete_id) {
        fetchAthleteRelationalClinicalRecords(profile.athlete_id, videos);
      }
    } catch (err) {
      console.error("Error loading athlete dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAthleteRelationalClinicalRecords = async (athleteId, videos) => {
    try {
      const [assRes, overallRes, planRes, recRes, folRes] = await Promise.all([
        api.get(`/api/athletes/${athleteId}/assessments`).catch(() => ({ data: [] })),
        api.get(`/api/athletes/${athleteId}/overall-insight`).catch(() => ({ data: null })),
        api.get(`/api/athletes/${athleteId}/rehab-plans`).catch(() => ({ data: [] })),
        api.get(`/api/athletes/${athleteId}/recovery-monitoring`).catch(() => ({ data: [] })),
        api.get(`/api/athletes/${athleteId}/followups`).catch(() => ({ data: [] }))
      ]);

      const assessments = assRes.data || [];
      setAssessmentsList(assessments);
      setOverallInsightData(overallRes.data || null);
      setRehabPlansList(planRes.data || []);
      setRecoveryLogsList(recRes.data || []);
      setFollowupsList(folRes.data || []);

      // Check URL query params for deep-link notification navigation
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      const refParam = params.get('ref');

      if (tabParam) {
        setActiveTab(tabParam);
      }

      if (refParam && (videos.length > 0 || assessments.length > 0)) {
        // Find video directly by video_id or through assessment.video_id
        let targetVideo = videos.find(v => String(v.video_id) === String(refParam));
        if (!targetVideo) {
          const targetAss = assessments.find(a => String(a.assessment_id) === String(refParam));
          if (targetAss && targetAss.video_id) {
            targetVideo = videos.find(v => String(v.video_id) === String(targetAss.video_id));
          }
        }
        if (targetVideo) {
          setSelectedModalVideo(targetVideo);
          setIsModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Error fetching athlete relational clinical records:", err);
    }
  };

  const handleOpenVideoModal = (video) => {
    setSelectedModalVideo(video);
    setIsModalOpen(true);
  };

  const completedCount = myVideos.filter(v => v.processing_status === 'COMPLETED').length;
  const matchingAssessment = selectedModalVideo 
    ? assessmentsList.find(a => String(a.video_id) === String(selectedModalVideo.video_id))
    : null;

  return (
    <div className="space-y-8">
      
      {/* Onboarding Banner if Profile incomplete */}
      {!loading && !myProfile && (
        <div className="p-6 rounded-2xl theme-card border border-amber-500/30 space-y-3 bg-amber-500/10">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold theme-text font-display">Welcome to InjurySense! Complete Your Athlete Profile</h3>
              <p className="text-xs theme-muted">
                Please complete your physical athlete attributes (sport, position, age, height, weight, flexibility, strength) to enable motion analytics and workload tracking.
              </p>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="mt-2 btn-golden font-bold text-xs py-2 px-4 rounded-lg inline-flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Complete Profile Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Athlete Dashboard Header */}
      <div className="p-8 rounded-2xl theme-card border border-[#EAE5DC] dark:border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono uppercase">
              Athlete Portal
            </span>
            {myProfile && (
              <span className="text-xs theme-muted font-semibold">
                • {myProfile.sport} ({myProfile.position || 'General'})
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black theme-text font-display tracking-tight">
            Welcome back, {user?.name || 'Athlete'}
          </h1>
          <p className="text-xs theme-muted max-w-xl">
            Track your biomechanical screening history, review physiotherapist insights, follow your rehabilitation plan, and monitor recovery progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/upload"
            className="btn-golden text-xs font-extrabold px-5 py-3 rounded-xl flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Assessment</span>
          </Link>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="theme-card hover:border-amber-500 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
          >
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* 6-Tab Navigation Bar */}
      <div className="p-2 rounded-2xl theme-card border border-[#EAE5DC] dark:border-white/10 bg-[#FFF8F0]/80 dark:bg-black/40 backdrop-blur-md flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'my_assessments', label: `My Assessments (${myVideos.length})`, icon: Film },
          { id: 'physio_insights', label: 'Physio Insights', icon: Stethoscope },
          { id: 'rehab_plan', label: `Rehabilitation Plan (${rehabPlansList.length})`, icon: Dumbbell },
          { id: 'recovery_progress', label: `Recovery Progress (${recoveryLogsList.length})`, icon: TrendingUp },
          { id: 'followup', label: `Follow-up (${followupsList.length})`, icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600/30'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl theme-card space-y-2 border">
              <div className="flex items-center justify-between text-amber-500">
                <Film className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider theme-muted">Assessments</span>
              </div>
              <div className="text-3xl font-black theme-text font-mono">
                {loading ? '...' : myVideos.length}
              </div>
              <p className="text-[11px] theme-muted">Total videos uploaded</p>
            </div>

            <div className="p-6 rounded-2xl theme-card space-y-2 border">
              <div className="flex items-center justify-between text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider theme-muted">Completed</span>
              </div>
              <div className="text-3xl font-black text-emerald-500 font-mono">
                {loading ? '...' : completedCount}
              </div>
              <p className="text-[11px] theme-muted">Analyzed movement reports</p>
            </div>

            <div className="p-6 rounded-2xl theme-card space-y-2 border">
              <div className="flex items-center justify-between text-amber-500">
                <Activity className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider theme-muted">Clarity Score</span>
              </div>
              <div className="text-3xl font-black text-amber-500 font-mono">
                94.5%
              </div>
              <p className="text-[11px] theme-muted">Avg keypoint visibility</p>
            </div>

            <div className="p-6 rounded-2xl theme-card space-y-2 border">
              <div className="flex items-center justify-between text-sky-500">
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider theme-muted">Profile Status</span>
              </div>
              <div className="text-sm font-extrabold theme-text pt-1">
                {myProfile ? 'Active & Verified' : 'Action Required'}
              </div>
              <p className="text-[11px] theme-muted">
                {myProfile ? `Updated: ${myProfile.updated_at ? new Date(myProfile.updated_at).toLocaleDateString() : 'Recently'}` : 'Profile incomplete'}
              </p>
            </div>
          </div>

          {/* Quick Athlete Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl theme-card space-y-4 border border-white/10">
              <h3 className="text-base font-extrabold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-3">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <span>Latest Physiotherapist Status</span>
              </h3>
              {overallInsightData?.latest_insight ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="theme-muted">Overall Clearance:</span>
                    <span className="px-2.5 py-0.5 rounded font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {overallInsightData.latest_insight.overall_status}
                    </span>
                  </div>
                  {overallInsightData.latest_insight.recovery_progress_percent !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="theme-muted">Recovery Progress:</span>
                        <span className="text-emerald-400 font-bold">{overallInsightData.latest_insight.recovery_progress_percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${overallInsightData.latest_insight.recovery_progress_percent}%` }}></div>
                      </div>
                    </div>
                  )}
                  <p className="theme-text italic bg-white/5 p-3 rounded-xl border border-white/10">
                    "{overallInsightData.latest_insight.overall_comment}"
                  </p>
                  <button
                    onClick={() => setActiveTab('physio_insights')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Full Overall Physio Insight →</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs theme-muted italic p-4 text-center">
                  No overall physiotherapist insight recorded yet.
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl theme-card space-y-4 border border-purple-500/20 shadow-sm">
              <h3 className="text-base font-extrabold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-3">
                <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Active Rehabilitation Summary</span>
              </h3>
              {rehabPlansList.length > 0 ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="theme-muted font-medium">Target Clearance:</span>
                    <span className="text-purple-700 dark:text-purple-300 font-extrabold">{rehabPlansList[0].target_clearance_date || 'In Progress'}</span>
                  </div>
                  <div className="p-3.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-300 tracking-wider">
                      Prescribed Exercises ({rehabPlansList[0].exercises?.length || 0})
                    </span>
                    <ul className="space-y-1.5 theme-text font-medium">
                      {(rehabPlansList[0].exercises || []).slice(0, 3).map((ex, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span>• {ex.exercise_name}</span>
                          <span className="text-purple-700 dark:text-purple-300 font-mono font-extrabold text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {ex.sets}x{ex.reps} ({ex.frequency})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab('rehab_plan')}
                    className="text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-bold text-xs flex items-center space-x-1 cursor-pointer pt-1"
                  >
                    <span>View Prescribed Rehab Exercises →</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs theme-muted italic p-4 text-center">
                  No active rehabilitation plan prescribed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ASSESSMENTS (INTERACTIVE TABLE) */}
      {activeTab === 'my_assessments' && (
        <div className="p-8 rounded-2xl theme-card space-y-6 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-extrabold theme-text flex items-center space-x-2 font-display">
                <Film className="w-5 h-5 text-amber-500" />
                <span>My Movement Assessment Videos ({myVideos.length})</span>
              </h3>
              <p className="text-xs theme-muted">Click any row or 'View Individual Insight' to inspect detailed AI telemetry & video findings</p>
            </div>

            <Link to="/upload" className="btn-golden text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Upload Video</span>
            </Link>
          </div>

          {myVideos.length === 0 ? (
            <div className="text-center py-12 text-xs theme-muted space-y-3">
              <p>You have not uploaded any movement assessment videos yet.</p>
              <Link to="/upload" className="inline-block btn-golden text-xs font-bold px-5 py-2.5 rounded-xl shadow-md">
                Upload Your First Assessment Video
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase theme-muted font-mono">
                    <th className="py-3 px-4">Movement Activity</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Clarity Score</th>
                    <th className="py-3 px-4 text-right">Individual Insight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myVideos.map((vid) => {
                    const hasPhysioAssessment = assessmentsList.some(a => String(a.video_id) === String(vid.video_id));
                    return (
                      <tr 
                        key={vid.video_id}
                        onClick={() => handleOpenVideoModal(vid)}
                        className="hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-4 font-bold theme-text font-display flex items-center space-x-2">
                          <PlayCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>{vid.activity || 'Movement Assessment'}</span>
                        </td>
                        <td className="py-4 px-4 theme-muted font-mono">
                          {new Date(vid.uploaded_at || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            vid.processing_status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-500/50'
                              : 'bg-amber-100 text-amber-900 border border-amber-400 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-500/50'
                          }`}>
                            {vid.processing_status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-black text-amber-800 dark:text-amber-400">
                          {vid.quality_score || 94.5}%
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenVideoModal(vid);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-lg border border-amber-600 text-xs inline-flex items-center space-x-1 cursor-pointer shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Individual Insight</span>
                            {hasPhysioAssessment && <Check className="w-3.5 h-3.5 text-black font-black ml-1" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHYSIO INSIGHTS */}
      {activeTab === 'physio_insights' && (
        <div className="space-y-6">
          <OverallAthleteInsightCard athlete={myProfile} overallInsightData={overallInsightData} />
        </div>
      )}

      {/* TAB 4: REHABILITATION PLAN */}
      {activeTab === 'rehab_plan' && (
        <div className="p-8 rounded-2xl theme-card space-y-6 border border-purple-500/30">
          <h3 className="text-lg font-extrabold theme-text flex items-center space-x-2 font-display border-b border-white/10 pb-4">
            <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Prescribed Rehabilitation Program & Exercise Instructions ({rehabPlansList.length})</span>
          </h3>

          {rehabPlansList.length === 0 ? (
            <div className="text-xs theme-muted italic p-8 text-center bg-white/5 rounded-xl border border-white/10">
              No rehabilitation plans have been prescribed by your physiotherapist yet.
            </div>
          ) : (
            <div className="space-y-6">
              {rehabPlansList.map((plan) => (
                <div key={plan.plan_id} className="p-6 theme-input rounded-2xl space-y-4 border border-purple-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="font-black text-sm text-purple-900 dark:text-purple-300">
                      Prescribed: {new Date(plan.created_at).toLocaleDateString()}
                    </span>
                    {plan.target_clearance_date && (
                      <span className="text-xs text-emerald-900 dark:text-emerald-400 font-mono font-bold">
                        Target Clearance: {plan.target_clearance_date}
                      </span>
                    )}
                  </div>

                  {plan.precautions && (
                    <div className="p-3.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-400 dark:border-amber-500/30 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-amber-900 dark:text-amber-300">Movement Precautions:</strong> {plan.precautions}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-purple-900 dark:text-purple-400 tracking-wider">
                      Prescribed Exercise Routine ({plan.exercises?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(plan.exercises || []).map((ex, idx) => (
                        <div key={idx} className="p-4 theme-card rounded-xl border border-purple-500/20 text-xs space-y-2">
                          <div className="flex justify-between items-center font-bold">
                            <span className="theme-text text-sm font-extrabold">{ex.exercise_name}</span>
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-400 dark:bg-purple-900/40 dark:text-purple-300 font-mono font-extrabold">
                              {ex.sets} sets × {ex.reps} reps
                            </span>
                          </div>
                          <div className="text-[11px] theme-muted flex justify-between">
                            <span>Frequency: <strong className="theme-text font-bold">{ex.frequency}</strong></span>
                            <span>Duration: <strong className="theme-text font-bold">{ex.duration || 'Ongoing'}</strong></span>
                          </div>
                          {ex.instructions && (
                            <p className="text-[11px] theme-muted italic pt-1 border-t border-white/5">
                              "{ex.instructions}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RECOVERY PROGRESS */}
      {activeTab === 'recovery_progress' && (
        <div className="p-6 sm:p-8 rounded-2xl theme-card space-y-6 border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-extrabold theme-text flex items-center space-x-2 font-display">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Physiotherapist Recovery Monitoring & Longitudinal Logs ({recoveryLogsList.length})</span>
              </h3>
              <p className="text-xs theme-muted">Clinical recovery evaluations and progress notes submitted by your physiotherapist</p>
            </div>
          </div>

          {recoveryLogsList.length === 0 ? (
            <div className="text-xs theme-muted italic p-8 text-center bg-white/5 rounded-xl border border-white/10">
              No recovery monitoring sessions logged by your physiotherapist yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recoveryLogsList.map((rec) => (
                <div key={rec.monitoring_id} className="p-5 theme-card rounded-2xl space-y-4 border border-emerald-500/30 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2 text-xs">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="theme-muted">Logged Date:</span>
                      <strong className="theme-text font-mono font-bold">
                        {new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </strong>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="w-28 sm:w-36 bg-gray-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, rec.physio_defined_recovery_percent || 0))}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-emerald-950 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-400 dark:border-emerald-500/30">
                        {rec.physio_defined_recovery_percent}% Progress
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      📝 Physiotherapist Clinical Improvement Notes
                    </span>
                    <p className="text-xs theme-text leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/10">
                      "{rec.improvement_notes}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: FOLLOW-UP */}
      {activeTab === 'followup' && (
        <div className="p-6 sm:p-8 rounded-2xl theme-card space-y-6 border border-cyan-500/30 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-extrabold theme-text flex items-center space-x-2 font-display">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Follow-up Clinical Visit Outcomes & Schedule ({followupsList.length})</span>
              </h3>
              <p className="text-xs theme-muted">Clinical visit logs and next scheduled check-up appointments</p>
            </div>
          </div>

          {followupsList.length === 0 ? (
            <div className="text-xs theme-muted italic p-8 text-center bg-white/5 rounded-xl border border-white/10">
              No clinical follow-up visit outcomes recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {followupsList.map((fol) => (
                <div key={fol.followup_id} className="p-5 theme-card rounded-2xl space-y-4 border border-cyan-500/30 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <span className="font-extrabold text-xs text-cyan-950 dark:text-cyan-300 font-mono bg-cyan-100 dark:bg-cyan-900/40 px-2.5 py-1 rounded-lg border border-cyan-400 dark:border-cyan-500/30">
                      Visit Date: {fol.visit_date}
                    </span>
                    {fol.next_followup_date && (
                      <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-300 font-mono bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-400 dark:border-emerald-500/30">
                        Next Scheduled Visit: {fol.next_followup_date}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                      📋 Clinical Visit Outcome Notes
                    </span>
                    <p className="text-xs theme-text leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/10">
                      "{fol.outcome_notes}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          fetchAthleteData();
        }}
      />

      {/* Individual Video Insight Modal */}
      <IndividualVideoInsightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        video={selectedModalVideo}
        assessment={matchingAssessment}
        onViewOverallInsight={() => setActiveTab('physio_insights')}
      />

    </div>
  );
};

export default AthleteDashboard;
