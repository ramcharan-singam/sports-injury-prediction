import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  Activity, Search, Filter, ArrowUpDown, FileText, Eye, Download, 
  Upload, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';

export const AnalysesHistoryPage = () => {
  const { user } = useContext(AuthContext);

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, Sort, Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAnalyses();
  }, [sortBy]);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/analyses?sort_by=${sortBy}`);
      setAnalyses(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Forbidden: You are only permitted to view your own analysis history.');
      } else {
        setError('Failed to load analysis history from backend database.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (videoId) => {
    try {
      const res = await api.get(`/api/analyses/${videoId}/pdf-report`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KINEMA_AI_Report_${videoId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF report. Please try again.');
    }
  };

  // Compute filtered & searched list
  const filteredAnalyses = analyses.filter((item) => {
    // 1. Search Query
    const matchesSearch = searchQuery.trim() === '' || 
      item.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sport && item.sport.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Risk Level Filter
    const evidenceScoring = item.extracted_metrics?.evidence_based_scoring || {};
    const score = evidenceScoring.screening_score ?? (item.quality_score || 24.5);
    const rawClass = (evidenceScoring.classification || '').toUpperCase();

    let level = "LOW";
    if (rawClass === 'HIGH' || score >= 66.0) {
      level = "HIGH";
    } else if (rawClass === 'MODERATE' || (score > 33.0 && score < 66.0)) {
      level = "MODERATE";
    } else {
      level = "LOW";
    }

    const matchesRisk = riskFilter === 'ALL' || level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage) || 1;
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner Card */}
      <div className="theme-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold theme-text font-display">
                Movement Analysis History
              </h1>
              <p className="text-xs theme-muted pt-0.5">
                Complete record of AI motion assessments & biomechanical injury risk predictions for <strong className="theme-text">{user?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/upload"
          className="accent-btn font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 w-fit"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Movement Video</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter & Search Bar Controls */}
      <div className="theme-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search movement type..."
            className="w-full theme-input rounded-xl pl-10 pr-4 py-2 text-xs theme-text focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
          
          {/* Filter by Risk Level */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 theme-muted" />
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="theme-input rounded-xl px-3 py-2 theme-text font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk Only</option>
              <option value="MODERATE">Moderate Risk Only</option>
              <option value="HIGH">High Risk Only</option>
            </select>
          </div>

          {/* Sort By Date */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 theme-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="theme-input rounded-xl px-3 py-2 theme-text font-semibold focus:outline-none cursor-pointer"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Analyses Data Table or Empty State */}
      {filteredAnalyses.length === 0 ? (
        <div className="theme-card p-12 rounded-2xl text-center space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold theme-text font-display">No movement analyses yet</h3>
            <p className="text-xs theme-muted max-w-md mx-auto">
              Upload a movement video to begin your first biomechanical assessment and generate your evidence-based injury risk report.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 accent-btn text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Movement Video</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="theme-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d0d12] theme-muted border-b border-white/10 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-5">Assessment Date</th>
                  <th className="py-4 px-5">Movement Type</th>
                  <th className="py-4 px-5 text-center">Screening Score</th>
                  <th className="py-4 px-5 text-center">Risk Level</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 theme-text font-mono">
                {paginatedAnalyses.map((item) => {
                  const evidenceScoring = item.extracted_metrics?.evidence_based_scoring || {};
                  const score = evidenceScoring.screening_score ?? (item.quality_score || 24.5);
                  const classification = evidenceScoring.classification || 'Low';
                  const isHigh = classification === 'High' || score >= 66.0;
                  const isMod = classification === 'Moderate' || (score > 33.0 && score < 66.0);

                  const formattedDate = item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A';

                  return (
                    <tr key={item.video_id} className="hover:bg-white/[0.03] transition-colors">
                      
                      {/* Date */}
                      <td className="py-4 px-5 font-sans">
                        <span className="font-bold theme-text block">{formattedDate}</span>
                        <span className="text-[10px] theme-muted">ID: {item.video_id.slice(0, 8)}...</span>
                      </td>

                      {/* Movement Type */}
                      <td className="py-4 px-5 font-sans font-semibold text-cyan-400">
                        {item.activity}
                      </td>

                      {/* Risk Score */}
                      <td className="py-4 px-5 text-center font-bold text-cyan-400">
                        {typeof score === 'number' ? score.toFixed(1) : score} / 100
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-4 px-5 text-center font-sans">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center space-x-1.5 border ${
                          isHigh
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : isMod
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isHigh ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>{classification} Risk</span>
                        </span>
                      </td>

                      {/* Action Links */}
                      <td className="py-4 px-5 text-right font-sans">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/results/${item.video_id}`}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 text-[11px] flex items-center space-x-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Analysis</span>
                          </Link>

                          <button
                            onClick={() => handleDownloadReport(item.video_id)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 theme-text font-semibold border border-white/20 text-[11px] flex items-center space-x-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Download Report</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs theme-muted bg-[#0d0d12]">
              <span>
                Showing page <strong className="theme-text">{currentPage}</strong> of <strong className="theme-text">{totalPages}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-lg theme-input disabled:opacity-30 hover:theme-text transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-lg theme-input disabled:opacity-30 hover:theme-text transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
