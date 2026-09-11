import React, { useState, useEffect } from 'react';
import api from '../../api';
import { RegisterAthleteModal } from '../RegisterAthleteModal';
import { EditAthleteModal } from '../EditAthleteModal';
import { ProfileModal } from '../ProfileModal';
import { 
  Users, Dumbbell, Flame, CheckCircle2, AlertCircle, Save, Edit3,
  Activity, ArrowRight, UserPlus, Copy, ShieldCheck, Key, Trash2, Check, Lock,
  Award, Globe, MapPin, Sparkles, UserCheck, Shield, RefreshCw
} from 'lucide-react';

export const CoachDashboard = ({ user }) => {
  const [athletesList, setAthletesList] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dedicated Coach Profile State
  const [coachProfile, setCoachProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Register Athlete Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    sport: 'Basketball',
    position: 'Point Guard',
    age: 22,
    height: 182.5,
    weight: 78.0,
    training_load: 70.0,
    coach_notes: ''
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState('');
  const [regResult, setRegResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Athlete Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);

  // Workload Adjustment Tool State
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [coachLoad, setCoachLoad] = useState(75.0);
  const [coachNote, setCoachNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Access Grants State
  const [grants, setGrants] = useState([]);
  const [selectedGrantStaffId, setSelectedGrantStaffId] = useState('');
  const [grantSubmitting, setGrantSubmitting] = useState(false);

  useEffect(() => {
    fetchSquadRoster();
    fetchStaffUsers();
    fetchCoachProfile();
  }, []);

  const fetchCoachProfile = async () => {
    try {
      const res = await api.get('/api/coach/profile');
      setCoachProfile(res.data);
    } catch (err) {
      console.error("Error fetching coach profile details:", err);
    }
  };

  const fetchSquadRoster = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/athletes');
      const data = res.data || [];
      setAthletesList(data);
      if (data.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('athlete_id');
        const savedId = urlId || localStorage.getItem('injury_sense_coach_selected_athlete_id');
        
        const match = data.find(a => String(a.athlete_id) === String(savedId));
        const target = match || data[0];
        const targetId = target.athlete_id;

        setSelectedAthleteId(targetId);
        localStorage.setItem('injury_sense_coach_selected_athlete_id', targetId);
        setCoachLoad(target.training_load || 75.0);
        setCoachNote(target.coach_notes || '');
        fetchGrantsForAthlete(targetId);
      }
    } catch (err) {
      console.error("Error fetching squad roster for coach:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const res = await api.get('/api/users');
      const filtered = (res.data || []).filter(u => u.role === 'Physiotherapist' || u.role === 'Sports Scientist');
      setStaffUsers(filtered);
      if (filtered.length > 0) {
        setSelectedGrantStaffId(filtered[0].user_id);
      }
    } catch (err) {
      console.error("Error fetching staff users:", err);
    }
  };

  const fetchGrantsForAthlete = async (athId) => {
    try {
      const res = await api.get(`/api/athletes/${athId}/grants`);
      setGrants(res.data || []);
    } catch (err) {
      setGrants([]);
    }
  };

  const handleSelectAthlete = (athId) => {
    setSelectedAthleteId(athId);
    if (athId) {
      localStorage.setItem('injury_sense_coach_selected_athlete_id', athId);
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('athlete_id', athId);
      window.history.replaceState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
    }
    const ath = athletesList.find(a => a.athlete_id === athId);
    if (ath) {
      setCoachLoad(ath.training_load || 75.0);
      setCoachNote(ath.coach_notes || '');
    }
    fetchGrantsForAthlete(athId);
  };

  const handleRegisterAthleteSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegResult(null);

    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.sport || !regForm.position) {
      setRegError('Please fill in all required fields.');
      return;
    }

    setRegSubmitting(true);
    try {
      const res = await api.post('/api/coach/athletes', regForm);
      setRegResult(res.data);
      setAthletesList([...athletesList, {
        athlete_id: res.data.athlete_id,
        user_id: res.data.user_id,
        account_status: res.data.account_status,
        sport: res.data.sport,
        position: res.data.position,
        age: regForm.age,
        height: regForm.height,
        weight: regForm.weight,
        training_load: regForm.training_load,
        flexibility: 80,
        strength: 80,
        balance: 80,
        endurance: 80,
        coach_notes: regForm.coach_notes,
        user: { name: res.data.name, email: res.data.email, account_status: res.data.account_status }
      }]);
    } catch (err) {
      if (!err.response) {
        setRegError('Cannot connect to backend server.');
      } else if (err.response?.status === 409) {
        setRegError('An account with this email address already exists in the system.');
      } else {
        setRegError(err.response?.data?.detail || 'Failed to register athlete.');
      }
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSaveWorkload = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put(`/api/athletes/${selectedAthleteId}`, {
        training_load: parseFloat(coachLoad) || 0,
        coach_notes: coachNote
      });

      setAthletesList(athletesList.map(a => a.athlete_id === selectedAthleteId ? res.data : a));
      setMessage({ type: 'success', text: 'Workload & coach notes updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update workload.' });
    } finally {
      setSaving(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedAthleteId || !selectedGrantStaffId) return;
    setGrantSubmitting(true);
    try {
      const res = await api.post(`/api/athletes/${selectedAthleteId}/grants`, {
        granted_to_user_id: selectedGrantStaffId
      });
      setGrants([...grants.filter(g => g.granted_to_user_id !== selectedGrantStaffId), res.data]);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to grant access.');
    } finally {
      setGrantSubmitting(false);
    }
  };

  const handleRevokeGrant = async (grantId) => {
    try {
      await api.delete(`/api/athletes/${selectedAthleteId}/grants/${grantId}`);
      setGrants(grants.filter(g => g.grant_id !== grantId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to revoke access.');
    }
  };

  const totalAthletes = athletesList.length;
  const pendingCount = athletesList.filter(a => (a.account_status || a.user?.account_status) === 'pending_activation').length;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl theme-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/20 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Coach Ownership Scope
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold theme-text tracking-tight font-display mt-2">
            Coach Management Portal — {user?.name}
          </h1>
          <p className="theme-muted text-xs sm:text-sm mt-1">
            Register athletes, issue activation links, manage full profiles, and grant permissions to medical staff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowProfileModal(true)}
            className="theme-card theme-muted hover:theme-text font-bold text-xs px-4 py-3 rounded-xl border border-white/10 flex items-center space-x-2 w-fit transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => {
              setShowRegisterModal(true);
              setRegResult(null);
              setRegError('');
            }}
            className="accent-btn font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 w-fit"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Athlete</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl theme-card space-y-1">
          <div className="flex items-center justify-between theme-muted text-xs font-medium">
            <span>My Registered Athletes</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold theme-text">{loading ? '...' : totalAthletes}</div>
          <div className="text-[10px] theme-muted">Owned athlete profiles</div>
        </div>

        <div className="p-5 rounded-xl theme-card space-y-1">
          <div className="flex items-center justify-between theme-muted text-xs font-medium">
            <span>Pending Activation</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400">{loading ? '...' : pendingCount}</div>
          <div className="text-[10px] theme-muted">Awaiting athlete password set</div>
        </div>

        <div className="p-5 rounded-xl theme-card space-y-1">
          <div className="flex items-center justify-between theme-muted text-xs font-medium">
            <span>Active Athletes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{loading ? '...' : totalAthletes - pendingCount}</div>
          <div className="text-[10px] theme-muted">Activated athlete logins</div>
        </div>

        <div className="p-5 rounded-xl theme-card space-y-1">
          <div className="flex items-center justify-between theme-muted text-xs font-medium">
            <span>Edit Scope</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400">Full Edit Access</div>
          <div className="text-[10px] theme-muted">Coach Ownership Control</div>
        </div>
      </div>

      {/* Squad Workload Adjustment Tool */}
      <div className="p-6 rounded-2xl theme-card space-y-4 border border-cyan-500/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
            <span>Athlete Profile & Training Load Management</span>
          </h3>

          {selectedAthleteId && (
            <button
              onClick={() => {
                const target = athletesList.find(a => a.athlete_id === selectedAthleteId);
                if (target) {
                  setEditingAthlete(target);
                  setShowEditModal(true);
                }
              }}
              className="accent-btn text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Full Profile</span>
            </button>
          )}
        </div>

        {message.text && (
          <div className={`p-3.5 rounded-xl flex items-center space-x-2.5 text-xs ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveWorkload} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Select Owned Athlete</label>
            <select
              value={selectedAthleteId}
              onChange={(e) => handleSelectAthlete(e.target.value)}
              className="w-full theme-input rounded-xl px-3 py-2 text-xs font-semibold"
            >
              {athletesList.map(a => (
                <option key={a.athlete_id} value={a.athlete_id}>
                  {a.user ? a.user.name : `Athlete ${a.athlete_id.slice(0, 8)}`} — {a.sport} (Status: {a.account_status || a.user?.account_status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">
              Target Training Load Index (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={coachLoad}
              onChange={(e) => setCoachLoad(e.target.value)}
              placeholder="e.g. 75.0"
              className="w-full theme-input rounded-xl px-3 py-2 text-xs font-bold text-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Coach Assessment Notes</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="Enter workload observations..."
                className="w-full theme-input rounded-xl px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={saving}
                className="accent-btn font-semibold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shadow-md whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Access Grants Management Tool */}
      {selectedAthleteId && (
        <div className="p-6 rounded-2xl theme-card space-y-4 border border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Medical & Science Access Grant Permissions</span>
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30">
              Grant & Revoke Access
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-xs">
            <select
              value={selectedGrantStaffId}
              onChange={(e) => setSelectedGrantStaffId(e.target.value)}
              className="w-full sm:w-80 theme-input rounded-xl px-3 py-2 text-xs font-semibold"
            >
              {staffUsers.map(s => (
                <option key={s.user_id} value={s.user_id} className="bg-dark-card">
                  {s.name} ({s.role}) — {s.email}
                </option>
              ))}
            </select>

            <button
              onClick={handleGrantAccess}
              disabled={grantSubmitting || !selectedGrantStaffId}
              className="w-full sm:w-auto accent-btn font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Grant Access to Staff</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase theme-muted block">Active Grants for Selected Athlete</span>
            {grants.filter(g => !g.revoked_at).length === 0 ? (
              <div className="text-xs theme-muted italic p-3 theme-input rounded-xl">
                No active grants. Physiotherapists and Sports Scientists currently have ZERO access to this athlete.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grants.filter(g => !g.revoked_at).map(g => (
                  <div key={g.grant_id} className="p-3 theme-input rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold theme-text block">{g.granted_to_user_name || 'Staff User'}</span>
                      <span className="text-[10px] text-cyan-400 font-semibold">{g.granted_to_user_role}</span>
                    </div>
                    <button
                      onClick={() => handleRevokeGrant(g.grant_id)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-lg border border-rose-500/40 text-[10px] flex items-center space-x-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Revoke</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Owned Athletes Squad Roster Table */}
      <div className="p-6 rounded-2xl theme-card space-y-4 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>My Registered Athlete Roster ({athletesList.length})</span>
          </h3>
          <button
            onClick={fetchSquadRoster}
            disabled={loading}
            className="px-3 py-1.5 theme-input hover:border-cyan-400 text-cyan-400 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Re-check athlete account status & refresh roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {athletesList.length === 0 ? (
          <div className="text-center py-8 text-xs theme-muted space-y-3">
            <p>You have not registered any athletes under your Coach account yet.</p>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="accent-btn font-semibold text-xs px-4 py-2 rounded-xl inline-flex items-center space-x-2 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register First Athlete</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="theme-muted border-b border-white/10 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Athlete Name</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3">Sport / Position</th>
                  <th className="py-3 px-3">Height / Weight</th>
                  <th className="py-3 px-3">Training Load</th>
                  <th className="py-3 px-3">Coach Notes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 theme-text">
                {athletesList.map((ath) => {
                  const statusStr = ath.account_status || ath.user?.account_status || 'active';
                  const isPending = statusStr === 'pending_activation';

                  return (
                    <tr key={ath.athlete_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-xl accent-badge flex items-center justify-center text-xs font-bold uppercase">
                          {ath.user ? ath.user.name[0] : 'A'}
                        </div>
                        <div>
                          <span className="block font-bold theme-text">{ath.user ? ath.user.name : `Athlete ${ath.athlete_id.slice(0, 6)}`}</span>
                          <span className="block text-[10px] theme-muted">{ath.user?.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            isPending 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {isPending ? 'Pending Activation' : 'Active'}
                          </span>
                          {isPending && (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await api.post(`/api/coach/athletes/${ath.athlete_id}/resend-activation`);
                                  setRegResult(res.data);
                                  setShowRegisterModal(true);
                                } catch (err) {
                                  alert(err.response?.data?.detail || 'Failed to resend activation link.');
                                }
                              }}
                              className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold rounded-lg border border-cyan-500/40 text-[10px] flex items-center space-x-1 transition-colors"
                              title="Re-issue a fresh 48-hour activation link"
                            >
                              <Key className="w-3 h-3" />
                              <span>Resend Link</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 theme-muted font-sans">{ath.sport} ({ath.position})</td>
                      <td className="py-3 px-3 font-mono">{ath.height}cm / {ath.weight}kg</td>
                      <td className="py-3 px-3 font-mono text-amber-400 font-bold">{ath.training_load}</td>
                      <td className="py-3 px-3 theme-muted italic text-[11px]">"{ath.coach_notes || 'None'}"</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setEditingAthlete(ath);
                            setShowEditModal(true);
                          }}
                          className="px-2.5 py-1 theme-card hover:border-cyan-400 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 text-[11px] inline-flex items-center space-x-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Profile</span>
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

      {/* Modal: Comprehensive Multi-Tab Register New Athlete */}
      <RegisterAthleteModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          fetchSquadRoster();
        }}
      />

      {/* Modal: Edit Athlete Profile After Creation */}
      <EditAthleteModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAthlete(null);
        }}
        athlete={editingAthlete}
        onSuccess={() => {
          fetchSquadRoster();
        }}
      />

      {/* Modal: Dedicated Professional Coach Profile Details */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          fetchCoachProfile();
        }}
      />

    </div>
  );
};
