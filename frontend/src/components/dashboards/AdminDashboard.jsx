import React, { useState, useEffect } from 'react';
import api from '../../api';
import { UserManagementModal } from '../UserManagementModal';
import { 
  Shield, Users, Activity, CheckCircle2, 
  AlertCircle, Server, Database, Search, Filter,
  FileCheck, ShieldAlert, BarChart3, Lock, Award,
  RefreshCw, Check, X, Info, UserCheck, AlertTriangle
} from 'lucide-react';

export const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal & Selected state
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProf, setSelectedProf] = useState(null);
  const [rejectReasonModal, setRejectReasonModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. User Management State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 2. Professional Verification State
  const [professionals, setProfessionals] = useState([]);
  const [profStatusFilter, setProfStatusFilter] = useState('Pending');

  // 3. Athlete Management State
  const [athletes, setAthletes] = useState([]);

  // 4. Content Moderation State
  const [moderationReports, setModerationReports] = useState([]);

  // 5. Platform Monitoring State
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);

  // 6. Reports & Analytics State
  const [reports, setReports] = useState(null);

  // 7. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditActionFilter, setAuditActionFilter] = useState('');

  // Initial Data Loading
  useEffect(() => {
    fetchTabData();
  }, [activeTab, userSearch, roleFilter, statusFilter, profStatusFilter, auditActionFilter]);

  const fetchTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/api/admin/users', {
          params: { search: userSearch, role: roleFilter, status_filter: statusFilter }
        });
        setUsersList(res.data || []);
      } else if (activeTab === 'verification') {
        const res = await api.get('/api/admin/professionals', {
          params: { verification_status: profStatusFilter }
        });
        setProfessionals(res.data || []);
      } else if (activeTab === 'athletes') {
        const res = await api.get('/api/admin/athletes');
        setAthletes(res.data || []);
      } else if (activeTab === 'moderation') {
        const res = await api.get('/api/admin/moderation/reports');
        setModerationReports(res.data || []);
      } else if (activeTab === 'monitoring') {
        const [mRes, hRes] = await Promise.all([
          api.get('/api/admin/platform/metrics'),
          api.get('/api/admin/platform/health')
        ]);
        setMetrics(mRes.data);
        setHealth(hRes.data);
      } else if (activeTab === 'analytics') {
        const res = await api.get('/api/admin/reports');
        setReports(res.data);
      } else if (activeTab === 'audit') {
        const res = await api.get('/api/admin/audit-logs', {
          params: { action_type: auditActionFilter }
        });
        setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.error(`Error loading ${activeTab} data:`, err);
      setError(err.response?.data?.detail || "Failed to load administrative dataset.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // --- Handlers: User Management ---
  const handleUpdateUserStatus = async (userId, newStatus, reason = '') => {
    try {
      await api.put(`/api/admin/users/${userId}/status`, { account_status: newStatus, reason });
      showNotification(`Account status updated to ${newStatus.toUpperCase()}`);
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update user status");
    }
  };

  // --- Handlers: Professional Verification ---
  const handleApproveVerification = async (userId) => {
    try {
      await api.put(`/api/admin/professionals/${userId}/verify`);
      showNotification("Professional verification APPROVED cleanly!");
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to approve verification");
    }
  };

  const handleRejectVerification = async () => {
    if (!rejectReasonModal) return;
    try {
      await api.put(`/api/admin/professionals/${rejectReasonModal}/reject`, { reason: rejectReason });
      showNotification("Professional verification REJECTED.");
      setRejectReasonModal(null);
      setRejectReason('');
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reject verification");
    }
  };

  // --- Handlers: Content Moderation ---
  const handleResolveReport = async (reportId, actionTaken, statusVal = 'Resolved') => {
    try {
      await api.put(`/api/admin/moderation/reports/${reportId}`, {
        status: statusVal,
        action_taken: actionTaken
      });
      showNotification(`Moderation report marked as ${statusVal}`);
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resolve moderation report");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl theme-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/30 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-black px-3 py-1 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40">
              Admin Platform Suite
            </span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
              System Admin Scope
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black theme-text tracking-tight font-display mt-2">
            InjurySense Platform Command & System Administration — {user?.name}
          </h1>
          <p className="theme-muted text-xs sm:text-sm mt-1 max-w-3xl font-medium">
            System administration, user provision, professional credential verification, community moderation, platform telemetry, and security audit controls.
          </p>
        </div>

        <button
          onClick={() => setShowUserModal(true)}
          className="accent-btn text-xs font-black px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Users className="w-4 h-4" />
          <span>Provision User Account</span>
        </button>
      </div>

      {/* Global Notifications & Error Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 font-black">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary 7 Navigation Tabs */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-purple-500/30 shadow-md flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>🏠 User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'verification'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>✓ Professional Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('athletes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'athletes'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>👤 Athlete Management</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'moderation'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>🛡 Content & Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'monitoring'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>📡 Platform Monitoring</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Reports & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'text-slate-900 dark:text-slate-100 font-extrabold hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>🔐 Audit & Security</span>
        </button>
      </div>

      {/* --- TAB 1: USER MANAGEMENT --- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="p-4 rounded-xl theme-card flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/20">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
              <input
                type="text"
                placeholder="Search users by name or email address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs theme-card border border-white/10 focus:border-purple-500 outline-none theme-text font-medium"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold theme-muted">
                <Filter className="w-3.5 h-3.5" />
                <span>Role:</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs theme-card border border-white/10 theme-text font-bold"
              >
                <option value="">All Roles</option>
                <option value="Athlete">Athlete</option>
                <option value="Coach">Coach</option>
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Sports Scientist">Sports Scientist</option>
                <option value="Admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs theme-card border border-white/10 theme-text font-bold"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending_activation">Pending Activation</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black theme-text flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Platform User Accounts Directory ({usersList.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="theme-muted border-b border-white/10 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-3">User ID</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 theme-text font-medium">
                  {usersList.map((u) => (
                    <tr key={u.user_id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-[11px] theme-muted">{u.user_id.slice(0, 8)}...</td>
                      <td className="py-3 px-3 font-bold">{u.name}</td>
                      <td className="py-3 px-3 theme-muted font-mono">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black ${
                          u.account_status === 'active'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : u.account_status === 'suspended'
                            ? 'bg-red-500 text-white font-black'
                            : 'bg-amber-500 text-slate-950 font-black'
                        }`}>
                          {u.account_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-[11px]">
                        {u.verification_status}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {u.account_status === 'suspended' ? (
                          <button
                            onClick={() => handleUpdateUserStatus(u.user_id, 'active')}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-black border border-emerald-500/40"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u.user_id, 'suspended', 'Suspended by admin')}
                            className="px-2.5 py-1 rounded bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 text-[11px] font-black border border-red-500/40"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 hover:bg-purple-500/30 text-[11px] font-black border border-purple-500/40"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center theme-muted text-xs italic">
                        No user accounts matched the given search/filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: PROFESSIONAL VERIFICATION --- */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl theme-card border border-purple-500/20">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black theme-text">Professional Verification Queue</h3>
            </div>
            <div className="flex items-center space-x-2">
              {['Pending', 'Verified', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setProfStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    profStatusFilter === st
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'theme-muted hover:text-purple-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((p) => (
              <div key={p.user_id} className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-4 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {p.role}
                      </span>
                      <h4 className="text-lg font-black theme-text mt-1">{p.name}</h4>
                      <p className="theme-muted text-xs font-mono">{p.email}</p>
                    </div>

                    {p.badge_title && (
                      <span className="px-3 py-1 rounded font-black text-xs bg-emerald-500 text-slate-950 shadow-md">
                        ✓ {p.badge_title}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="theme-muted text-[10px] font-bold uppercase">Qualification</span>
                      <p className="font-bold theme-text">{p.qualification}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="theme-muted text-[10px] font-bold uppercase">Specialization</span>
                      <p className="font-bold theme-text">{p.specialization}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="theme-muted text-[10px] font-bold uppercase">License / ID</span>
                      <p className="font-mono text-purple-400 font-bold">{p.license_number}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="theme-muted text-[10px] font-bold uppercase">Organization</span>
                      <p className="font-bold theme-text">{p.organization}</p>
                    </div>
                  </div>

                  {p.submitted_documents && (
                    <div className="mt-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
                      <span className="theme-muted text-[10px] font-bold uppercase block">Submitted Documents</span>
                      <span className="font-semibold text-purple-300">{p.submitted_documents}</span>
                    </div>
                  )}

                  {p.rejection_reason && (
                    <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      <span className="font-bold uppercase text-[10px] block">Rejection Reason:</span>
                      {p.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
                  {p.verification_status !== 'Verified' && (
                    <button
                      onClick={() => handleApproveVerification(p.user_id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-lg hover:bg-emerald-400 flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Grant Badge</span>
                    </button>
                  )}

                  {p.verification_status !== 'Rejected' && (
                    <button
                      onClick={() => setRejectReasonModal(p.user_id)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-black border border-red-500/40 flex items-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {professionals.length === 0 && (
              <div className="col-span-2 p-12 text-center theme-card rounded-2xl border border-purple-500/20 theme-muted text-xs">
                No professional applications currently found under status '{profStatusFilter}'.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: ATHLETE MANAGEMENT --- */}
      {activeTab === 'athletes' && (
        <div className="space-y-6">
          {/* Strict Non-Clinical Scope Guarantee Banner */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start space-x-3">
            <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-purple-400 uppercase tracking-wider block">Strict Non-Clinical Administrative Oversight</span>
              <p className="theme-muted mt-0.5">
                The Admin role provides high-level system oversight of athlete profiles and assigned staff. Clinical assessments, AI movement risk scores, recovery percentages, and rehabilitation plans remain strictly managed by assigned Physiotherapists and Coaches.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-4">
            <h3 className="text-sm font-black theme-text flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Platform Athletes Oversight Directory ({athletes.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="theme-muted border-b border-white/10 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-3">Athlete Name</th>
                    <th className="py-3 px-3">Sport & Position</th>
                    <th className="py-3 px-3">Assigned Coach</th>
                    <th className="py-3 px-3">Video Assessments</th>
                    <th className="py-3 px-3">Rehab Plan Status</th>
                    <th className="py-3 px-3">Clearance Status</th>
                    <th className="py-3 px-3">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 theme-text font-medium">
                  {athletes.map((a) => (
                    <tr key={a.athlete_id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-bold">{a.name}</td>
                      <td className="py-3 px-3 font-semibold text-purple-400">{a.sport} ({a.position})</td>
                      <td className="py-3 px-3 theme-muted">{a.assigned_coach}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{a.assessment_count} Assessments</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${a.rehab_plan_exists ? 'bg-sky-500 text-slate-950' : 'bg-white/10 theme-muted'}`}>
                          {a.rehab_plan_exists ? 'Active Rehab Plan' : 'No Rehab Plan'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{a.medical_clearance_status}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {a.account_status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: CONTENT & MODERATION --- */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-4">
            <h3 className="text-sm font-black theme-text flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Platform Content & Community Moderation Queue</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="theme-muted border-b border-white/10 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-3">Report ID</th>
                    <th className="py-3 px-3">Reporter</th>
                    <th className="py-3 px-3">Reported User</th>
                    <th className="py-3 px-3">Content Type</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 theme-text font-medium">
                  {moderationReports.map((r) => (
                    <tr key={r.report_id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-[11px] theme-muted">{r.report_id.slice(0, 8)}...</td>
                      <td className="py-3 px-3 font-bold">{r.reporter_name}</td>
                      <td className="py-3 px-3 text-purple-400 font-bold">{r.reported_user_name}</td>
                      <td className="py-3 px-3 font-bold">{r.content_type}</td>
                      <td className="py-3 px-3 theme-muted">{r.reason}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          r.status === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {r.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleResolveReport(r.report_id, 'Issued Warning to User', 'Resolved')}
                              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-black border border-amber-500/40"
                            >
                              Warn User
                            </button>
                            <button
                              onClick={() => handleResolveReport(r.report_id, 'Removed Content', 'Action Taken')}
                              className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] font-black border border-red-500/40"
                            >
                              Remove Content
                            </button>
                            <button
                              onClick={() => handleResolveReport(r.report_id, 'Dismissed Report', 'Dismissed')}
                              className="px-2.5 py-1 rounded bg-white/10 theme-muted hover:bg-white/20 text-[11px] font-black"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        {r.status !== 'Pending' && (
                          <span className="text-[11px] theme-muted font-bold italic">{r.action_taken}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: PLATFORM MONITORING --- */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Aggregate KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl theme-card space-y-1 border border-purple-500/20">
              <span className="theme-muted text-xs font-bold">Total Platform Users</span>
              <div className="text-3xl font-black theme-text">{metrics?.total_users || 0}</div>
              <div className="text-[10px] theme-muted font-bold">{metrics?.active_users || 0} active platform accounts</div>
            </div>

            <div className="p-5 rounded-xl theme-card space-y-1 border border-purple-500/20">
              <span className="theme-muted text-xs font-bold">Pending Verifications</span>
              <div className="text-3xl font-black text-amber-400">{metrics?.pending_verifications || 0}</div>
              <div className="text-[10px] theme-muted font-bold">Requires Admin document review</div>
            </div>

            <div className="p-5 rounded-xl theme-card space-y-1 border border-purple-500/20">
              <span className="theme-muted text-xs font-bold">Total Movement Analyses</span>
              <div className="text-3xl font-black text-sky-400">{metrics?.total_movement_analyses || 0}</div>
              <div className="text-[10px] theme-muted font-bold">Processed kinematic videos</div>
            </div>

            <div className="p-5 rounded-xl theme-card space-y-1 border border-purple-500/20">
              <span className="theme-muted text-xs font-bold">Active Rehab Plans</span>
              <div className="text-3xl font-black text-emerald-400">{metrics?.active_rehabilitation_plans || 0}</div>
              <div className="text-[10px] theme-muted font-bold">Clinical programs in progress</div>
            </div>
          </div>

          {/* System Component Health Panel */}
          <div className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-4">
            <h3 className="text-sm font-black theme-text flex items-center space-x-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Real-Time Operational Infrastructure Health</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <span className="theme-muted text-[10px] font-black uppercase">FastAPI Server</span>
                <p className="font-black text-emerald-400 text-base">{health?.api_status || 'OPERATIONAL 🟢'}</p>
                <span className="text-[10px] theme-muted font-mono block">Uptime: {health?.uptime || '99.98%'}</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <span className="theme-muted text-[10px] font-black uppercase">Database Engine</span>
                <p className="font-black text-emerald-400 text-base">{health?.database_status || 'CONNECTED 🟢'}</p>
                <span className="text-[10px] theme-muted font-mono block">PostgreSQL / SQLite Active</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                <span className="theme-muted text-[10px] font-black uppercase">AI Telemetry Engine</span>
                <p className="font-black text-purple-300 text-base">{health?.ai_pose_engine || 'ACTIVE 🟢'}</p>
                <span className="text-[10px] theme-muted font-mono block">Failed Analysis Queue: {health?.failed_analyses_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: REPORTS & ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-6">
            <div>
              <h3 className="text-sm font-black theme-text flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Platform Usage Statistics & Growth Trends</span>
              </h3>
              <p className="theme-muted text-xs mt-1">
                {reports?.disclaimer || "Administrative statistics represent system usage telemetry. They do not constitute medical or clinical diagnoses."}
              </p>
            </div>

            {/* Growth chart visual representation */}
            <div className="space-y-3">
              <span className="text-xs font-black theme-text block uppercase tracking-wider">User Growth Trend (Monthly)</span>
              <div className="grid grid-cols-5 gap-2 text-center">
                {reports?.user_growth_trend?.map((item) => (
                  <div key={item.month} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="h-20 bg-purple-500/20 rounded-lg flex items-end justify-center p-1">
                      <div
                        className="w-full bg-purple-500 rounded-md transition-all"
                        style={{ height: `${Math.min(100, item.users)}%` }}
                      ></div>
                    </div>
                    <span className="font-black text-xs theme-text block">{item.month}</span>
                    <span className="theme-muted font-mono text-[10px] font-bold">{item.users} Users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 7: AUDIT & SECURITY --- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl theme-card flex items-center justify-between border border-purple-500/20">
            <h3 className="text-sm font-black theme-text flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Administrative Security Audit Log Trail</span>
            </h3>

            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="py-2 px-3 rounded-xl text-xs theme-card border border-white/10 theme-text font-bold"
            >
              <option value="">All Action Types</option>
              <option value="USER_STATUS_CHANGE">User Status Change</option>
              <option value="PROFESSIONAL_VERIFIED">Professional Verified</option>
              <option value="PROFESSIONAL_REJECTED">Professional Rejected</option>
              <option value="CONTENT_MODERATION">Content Moderation</option>
            </select>
          </div>

          <div className="p-6 rounded-2xl theme-card border border-purple-500/30 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="theme-muted border-b border-white/10 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Admin Name</th>
                    <th className="py-3 px-3">Action Type</th>
                    <th className="py-3 px-3">Target User / Record</th>
                    <th className="py-3 px-3">Action Description</th>
                    <th className="py-3 px-3">State Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 theme-text font-medium">
                  {auditLogs.map((l) => (
                    <tr key={l.audit_id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 theme-muted font-mono text-[11px]">{l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'}</td>
                      <td className="py-3 px-3 font-bold text-purple-400">{l.admin_name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {l.action_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">{l.target_user_name}</td>
                      <td className="py-3 px-3 theme-muted">{l.action_description}</td>
                      <td className="py-3 px-3 font-mono text-[11px] theme-muted">
                        <span className="text-red-400">{l.previous_value}</span> → <span className="text-emerald-400">{l.new_value}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: User Management Modal --- */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          fetchTabData();
        }}
      />

      {/* --- MODAL: View User Details --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl theme-card max-w-lg w-full border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black theme-text flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>User Account Overview</span>
              </h3>
              <button onClick={() => setSelectedUser(null)} className="theme-muted font-black">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="theme-muted text-[10px] font-bold uppercase block">Name</span>
                <span className="font-bold text-sm theme-text">{selectedUser.name}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="theme-muted text-[10px] font-bold uppercase block">Email</span>
                <span className="font-mono text-purple-400 font-bold">{selectedUser.email}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="theme-muted text-[10px] font-bold uppercase block">Role</span>
                <span className="font-bold text-emerald-400">{selectedUser.role}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-black text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Reject Professional Verification Reason --- */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl theme-card max-w-md w-full border border-red-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-red-400 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Reject Professional Verification</span>
              </h3>
              <button onClick={() => setRejectReasonModal(null)} className="theme-muted font-black">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="theme-muted font-bold block">Reason for Rejection:</label>
              <textarea
                rows={3}
                placeholder="Provide rationale for rejection (e.g. Incomplete license documentation)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl theme-card border border-white/10 text-xs theme-text focus:border-red-500 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={() => setRejectReasonModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 theme-muted font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectVerification}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
