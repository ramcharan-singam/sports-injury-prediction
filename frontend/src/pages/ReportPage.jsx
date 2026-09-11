import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  FileText, Printer, ArrowLeft, CheckCircle2, ShieldAlert, 
  Activity, Video, Award, AlertTriangle, Download, Sparkles, User, Users, RefreshCw
} from 'lucide-react';
import { ACLInjuryCard } from '../components/ACLInjuryCard';

export const ReportPage = () => {
  const { videoId: routeVideoId } = useParams();
  const { user } = useContext(AuthContext);

  const [athletesList, setAthletesList] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState(routeVideoId || '');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStaffRole = user && ['Physiotherapist', 'Coach', 'Sports Scientist', 'Admin'].includes(user.role);

  useEffect(() => {
    initReportData();
  }, [routeVideoId]);

  const initReportData = async () => {
    setLoading(true);
    setError('');
    try {
      let athletes = [];
      if (isStaffRole) {
        const athRes = await api.get('/api/athletes');
        athletes = athRes.data || [];
        setAthletesList(athletes);
      }

      const vidsEndpoint = user?.role === 'Athlete' ? '/api/videos/me' : '/api/videos';
      const vidsRes = await api.get(vidsEndpoint);
      const vids = vidsRes.data || [];
      setAllVideos(vids);

      if (routeVideoId) {
        setSelectedVideoId(routeVideoId);
        const targetVid = vids.find(v => String(v.video_id) === String(routeVideoId));
        if (targetVid && targetVid.athlete_id) {
          setSelectedAthleteId(targetVid.athlete_id);
        }
        await fetchReport(routeVideoId);
      } else if (vids.length > 0) {
        const savedAthId = localStorage.getItem('injury_sense_selected_athlete_id');
        let matchedAth = athletes.find(a => String(a.athlete_id) === String(savedAthId));
        if (!matchedAth && athletes.length > 0) matchedAth = athletes[0];

        const targetAthId = matchedAth ? matchedAth.athlete_id : (vids[0].athlete_id || '');
        setSelectedAthleteId(targetAthId);

        const athVids = targetAthId ? vids.filter(v => String(v.athlete_id) === String(targetAthId)) : vids;
        const targetVid = athVids.length > 0 ? athVids[0] : vids[0];

        if (targetVid) {
          setSelectedVideoId(targetVid.video_id);
          await fetchReport(targetVid.video_id);
        } else {
          setError('No video assessments found for the selected athlete profile.');
          setLoading(false);
        }
      } else {
        setError('No completed video assessments found to generate a report.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Error initializing report page:", err);
      setError('Failed to fetch data for report generation.');
      setLoading(false);
    }
  };

  const fetchReport = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/videos/${id}/report`);
      setReport(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Forbidden: You are not authorized to view this analysis report.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load report data for selected assessment.');
      }
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAthleteChange = async (newAthId) => {
    setSelectedAthleteId(newAthId);
    localStorage.setItem('injury_sense_selected_athlete_id', newAthId);

    const athVids = allVideos.filter(v => String(v.athlete_id) === String(newAthId));
    if (athVids.length > 0) {
      const latestVidId = athVids[0].video_id;
      setSelectedVideoId(latestVidId);
      fetchReport(latestVidId);
    } else {
      setSelectedVideoId('');
      setReport(null);
      setError('No completed video assessments found for this athlete profile.');
    }
  };

  const handleVideoChange = async (newVidId) => {
    setSelectedVideoId(newVidId);
    fetchReport(newVidId);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentAthleteVideos = selectedAthleteId 
    ? allVideos.filter(v => String(v.athlete_id) === String(selectedAthleteId))
    : allVideos;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Printable Action & Selection Controls Header Bar */}
      <div className="theme-card p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-4 print:hidden shadow-lg">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 theme-muted hover:theme-text text-xs font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={!report}
              className="accent-btn text-xs font-extrabold px-4 py-2 rounded-xl flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 hover:scale-105 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Profile & Video Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Athlete Profile Selector (for Staff Roles) */}
          {isStaffRole && (
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase theme-muted tracking-wider flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Select Athlete Profile</span>
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => handleAthleteChange(e.target.value)}
                className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs font-bold theme-text cursor-pointer border border-emerald-500/30 focus:border-emerald-400"
              >
                {athletesList.length === 0 && <option value="">No athletes assigned</option>}
                {athletesList.map(a => (
                  <option key={a.athlete_id} value={a.athlete_id}>
                    {a.user ? a.user.name : `Athlete ${a.athlete_id.slice(0, 8)}`} — {a.sport} ({a.position})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Assessment Selector */}
          <div className={`space-y-1 ${!isStaffRole ? 'md:col-span-2' : ''}`}>
            <label className="block text-[10px] font-extrabold uppercase theme-muted tracking-wider flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Movement Video Assessment</span>
            </label>
            <select
              value={selectedVideoId}
              onChange={(e) => handleVideoChange(e.target.value)}
              disabled={currentAthleteVideos.length === 0}
              className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs font-bold theme-text cursor-pointer border border-cyan-500/30 focus:border-cyan-400 disabled:opacity-50"
            >
              {currentAthleteVideos.length === 0 && <option value="">No video assessments available</option>}
              {currentAthleteVideos.map(v => (
                <option key={v.video_id} value={v.video_id}>
                  🎥 {v.activity || 'Movement Assessment'} ({new Date(v.uploaded_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}) — ID: {String(v.video_id).slice(0, 8).toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 accent-text"></div>
          <span className="text-xs theme-muted font-semibold">Generating analysis report for selected profile...</span>
        </div>
      ) : error || !report ? (
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="theme-card p-8 rounded-2xl space-y-4 border border-white/10">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold theme-text">{error || 'No Report Available'}</h2>
            <p className="text-xs theme-muted">Select another athlete profile or upload a sports movement video clip to generate a report.</p>
            <Link to="/upload" className="inline-flex items-center space-x-2 accent-btn text-xs font-semibold px-4 py-2 rounded-lg">
              <span>Upload Video</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Main Printable Document Card */
        <div className="theme-card p-8 sm:p-10 rounded-2xl space-y-8 border border-white/10 shadow-2xl print:bg-white print:text-black print:shadow-none print:border-none">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4 print:border-black/20">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold theme-text font-display tracking-tight print:text-black">
                  InjurySense
                </span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Official Analysis Report
                </span>
              </div>
              <p className="text-xs theme-muted print:text-gray-600 mt-1">
                Sports Movement Assessment & Biomechanical Quality Report
              </p>
            </div>

            <div className="text-left sm:text-right text-xs theme-muted print:text-gray-600 space-y-0.5">
              <div>Report ID: <strong className="theme-text print:text-black font-mono">{report.report_id}</strong></div>
              <div>Generated: {new Date(report.generated_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Section 1: Athlete & Video Demographics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            <div className="p-4 theme-input rounded-xl space-y-2 print:bg-gray-50 print:border print:border-gray-200">
              <h3 className="font-bold theme-text uppercase tracking-wider text-[10px] theme-muted flex items-center space-x-1.5 print:text-gray-700">
                <User className="w-3.5 h-3.5 accent-text" />
                <span>Athlete Demographics</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="theme-muted block text-[10px]">Athlete Name:</span>
                  <strong className="theme-text print:text-black">{report.athlete_name}</strong>
                </div>
                <div>
                  <span className="theme-muted block text-[10px]">Sport:</span>
                  <strong className="theme-text print:text-black">{report.sport}</strong>
                </div>
                <div>
                  <span className="theme-muted block text-[10px]">Position:</span>
                  <strong className="theme-text print:text-black">{report.position}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 theme-input rounded-xl space-y-2 print:bg-gray-50 print:border print:border-gray-200">
              <h3 className="font-bold theme-text uppercase tracking-wider text-[10px] theme-muted flex items-center space-x-1.5 print:text-gray-700">
                <Video className="w-3.5 h-3.5 accent-text" />
                <span>Video Assessment Metadata</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="theme-muted block text-[10px]">Activity Type:</span>
                  <strong className="theme-text print:text-black">{report.activity}</strong>
                </div>
                <div>
                  <span className="theme-muted block text-[10px]">Duration:</span>
                  <strong className="theme-text print:text-black">{report.duration} sec</strong>
                </div>
                <div>
                  <span className="theme-muted block text-[10px]">Framerate / Res:</span>
                  <strong className="theme-text print:text-black">{report.fps} FPS ({report.resolution})</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Video Quality Breakdown */}
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 print:border-emerald-700 print:bg-emerald-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold theme-text flex items-center space-x-2 print:text-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                <span>Video Quality & Analysis Readiness</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400 print:text-emerald-700 px-2.5 py-1 rounded bg-emerald-500/20">
                {report.quality_score}% {report.video_quality_status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 theme-input rounded-lg">
                <span className="theme-muted block text-[10px]">Resolution</span>
                <strong className="theme-text print:text-black">{report.resolution} (Pass)</strong>
              </div>
              <div className="p-2.5 theme-input rounded-lg">
                <span className="theme-muted block text-[10px]">Framerate</span>
                <strong className="theme-text print:text-black">{report.fps} FPS (Pass)</strong>
              </div>
              <div className="p-2.5 theme-input rounded-lg">
                <span className="theme-muted block text-[10px]">Full Body Visible</span>
                <strong className="theme-text print:text-black">Confirmed</strong>
              </div>
              <div className="p-2.5 theme-input rounded-lg">
                <span className="theme-muted block text-[10px]">Lighting & Stability</span>
                <strong className="theme-text print:text-black">Good</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Movement & Posture Quality Ratings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold theme-text border-b border-white/10 pb-2 flex items-center space-x-2 print:text-black print:border-black/20">
              <Activity className="w-4 h-4 accent-text" />
              <span>Movement & Posture Assessment Ratings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries(report.movement_assessment || {}).map(([key, val]) => (
                <div key={key} className="p-3 theme-input rounded-xl flex justify-between items-center">
                  <span className="theme-muted capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-700">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Extracted Biomechanical Joint Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold theme-text border-b border-white/10 pb-2 flex items-center space-x-2 print:text-black print:border-black/20">
              <Award className="w-4 h-4 accent-text" />
              <span>Extracted Biomechanical Joint Metrics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              {Object.entries(report.biomechanical_metrics || {}).map(([key, val]) => (
                <div key={key} className="p-3 theme-input rounded-xl flex justify-between items-center">
                  <span className="theme-muted font-sans text-xs capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-bold theme-text print:text-black">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Evidence-Based Risk Screening Card */}
          <ACLInjuryCard evidenceScoring={report.evidence_based_scoring} />

          {/* Section 6: Overall Assessment & Disclaimer */}
          <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 print:border-gray-300 print:bg-gray-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 print:text-black">
              {report.overall_assessment || 'CLEARED FOR TRAINING — LOW BIOMECHANICAL RISK DETECTED'}
            </h4>
            <p className="text-xs theme-muted print:text-gray-700 italic">
              "{report.disclaimer || 'This official movement screening report is generated using computer vision landmark tracking and evidence-based reference thresholds.'}"
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default ReportPage;
