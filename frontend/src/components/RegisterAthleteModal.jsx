import React, { useState } from 'react';
import api from '../api';
import { 
  UserPlus, X, User, Activity, Dumbbell, ShieldAlert, CheckCircle2, 
  AlertCircle, Copy, Check, Calendar, Award, Phone, FileText, HeartPulse
} from 'lucide-react';

function cleanDate(val) {
  if (!val || typeof val !== 'string' || !val.trim()) return null;
  const t = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const parts = t.split(/[-/]/);
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return null;
}

export const RegisterAthleteModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [form, setForm] = useState({
    // 1. Identity & Basic Info
    name: '',
    email: '',
    dob: '',
    gender: 'Unspecified',
    height: 182.5,
    weight: 78.0,
    dominant_leg: 'Right',
    sport: 'Basketball',
    position: 'Point Guard',
    team_name: '',
    jersey_number: '',
    age: 22,

    // 2. Sports Background
    years_experience: 3.0,
    competition_level: 'Amateur',
    training_frequency: 4,

    // 3. Injury History
    previous_injuries_summary: '',
    injury_recurrence_flag: 'No',
    current_injury_status: 'Fully Cleared',

    // 4. Physical Screening Baselines
    nordic_strength_score: '',
    hamstring_flexibility: '',
    baseline_less_score: '',
    quad_hamstring_ratio: '',

    // 5. Consent & Admin
    parental_consent: 'Cleared / N/A',
    medical_clearance_status: 'Cleared',
    emergency_contact: '',
    coach_notes: ''
  });

  if (!isOpen) return null;

  const handleDobChange = (dobValue) => {
    let derivedAge = form.age;
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      derivedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        derivedAge--;
      }
    }
    setForm({ ...form, dob: dobValue, age: Math.max(0, derivedAge) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.sport.trim() || !form.position.trim()) {
      setError('Please fill in all required fields (Name, Email, Sport, Position).');
      setActiveTab('identity');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        sport: form.sport.trim(),
        position: form.position.trim(),
        age: form.age || 22,
        height: parseFloat(form.height) || 180.0,
        weight: parseFloat(form.weight) || 75.0,
        dob: cleanDate(form.dob),
        gender: form.gender,
        dominant_leg: form.dominant_leg,
        team_name: form.team_name ? form.team_name.trim() : null,
        jersey_number: form.jersey_number ? form.jersey_number.trim() : null,

        years_experience: parseFloat(form.years_experience) || 1.0,
        competition_level: form.competition_level,
        training_frequency: parseInt(form.training_frequency) || 4,

        previous_injuries_summary: form.previous_injuries_summary ? form.previous_injuries_summary.trim() : null,
        injury_recurrence_flag: form.injury_recurrence_flag,
        current_injury_status: form.current_injury_status,

        nordic_strength_score: form.nordic_strength_score ? parseFloat(form.nordic_strength_score) : null,
        hamstring_flexibility: form.hamstring_flexibility ? parseFloat(form.hamstring_flexibility) : null,
        baseline_less_score: form.baseline_less_score ? parseFloat(form.baseline_less_score) : null,
        quad_hamstring_ratio: form.quad_hamstring_ratio ? parseFloat(form.quad_hamstring_ratio) : null,

        parental_consent: form.parental_consent,
        medical_clearance_status: form.medical_clearance_status,
        emergency_contact: form.emergency_contact ? form.emergency_contact.trim() : null,
        coach_notes: form.coach_notes ? form.coach_notes.trim() : null
      };

      const res = await api.post('/api/coach/athletes', payload);
      setResult(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(`An account with email "${form.email}" already exists in the system.`);
      } else if (err.response?.status === 422) {
        const d = err.response.data?.detail;
        if (Array.isArray(d)) {
          setError(d.map(item => `${item.loc ? item.loc[item.loc.length - 1] : 'field'}: ${item.msg}`).join(' | '));
        } else {
          setError(typeof d === 'string' ? d : 'Validation error. Please check input values.');
        }
      } else {
        setError(err.response?.data?.detail || 'Failed to register athlete.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl w-full theme-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 theme-header">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 accent-text" />
            <h2 className="text-base font-bold theme-text font-display">Register New Athlete</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg theme-muted hover:theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        {!result && (
          <div className="flex border-b border-white/10 bg-white/[0.02] overflow-x-auto custom-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'identity' 
                  ? 'border-cyan-400 accent-text bg-white/5' 
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1. Identity & Basic Info</span>
            </button>

            <button
              onClick={() => setActiveTab('sports')}
              className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'sports' 
                  ? 'border-cyan-400 accent-text bg-white/5' 
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>2. Sports Background</span>
            </button>

            <button
              onClick={() => setActiveTab('injury')}
              className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'injury' 
                  ? 'border-cyan-400 accent-text bg-white/5' 
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>3. Injury History</span>
            </button>

            <button
              onClick={() => setActiveTab('screening')}
              className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'screening' 
                  ? 'border-cyan-400 accent-text bg-white/5' 
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>4. Physical Screening</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'admin' 
                  ? 'border-cyan-400 accent-text bg-white/5' 
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>5. Consent & Admin</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            /* Successful Registration & Activation Token Display */
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold theme-text">Athlete Profile Registered Successfully!</h3>
                <p className="text-xs theme-muted">
                  An activation account has been created for <strong className="theme-text">{result.name}</strong> ({result.email}).
                </p>
              </div>

              <div className="p-4 theme-input rounded-xl text-left space-y-3 border border-white/10">
                <div className="text-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">6-Digit Activation Code</span>
                  <div className="font-mono text-2xl font-extrabold tracking-widest text-cyan-300 select-all">
                    {result.activation_code || result.activation_token}
                  </div>
                  <p className="text-[10px] theme-muted">Provide this 6-digit code to the athlete to activate their account.</p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase theme-muted block">Direct Activation Link</span>
                  <div className="font-mono text-xs p-2 rounded-lg bg-black/40 border border-white/10 theme-text truncate select-all">
                    {result.activation_url}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(result.activation_code || result.activation_token)}
                    className="accent-btn font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Code Copied!' : 'Copy 6-Digit Code'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(result.activation_url)}
                    className="theme-input hover:bg-white/10 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 border border-white/10 cursor-pointer theme-text"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Link</span>
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full theme-input hover:bg-white/10 font-bold py-2.5 rounded-xl theme-text"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* TAB 1: Identity & Basic Info */}
              {activeTab === 'identity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Athlete Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Athlete Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Date of Birth (DOB)</label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) => handleDobChange(e.target.value)}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Derived Age (Years)</label>
                      <input
                        type="number"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Unspecified</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Height (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={form.height}
                        onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Weight (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Dominant Leg / Foot</label>
                      <select
                        value={form.dominant_leg}
                        onChange={(e) => setForm({ ...form, dominant_leg: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      >
                        <option value="Right">Right Leg</option>
                        <option value="Left">Left Leg</option>
                        <option value="Ambidextrous">Ambidextrous</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Sport *</label>
                      <input
                        type="text"
                        required
                        value={form.sport}
                        onChange={(e) => setForm({ ...form, sport: e.target.value })}
                        placeholder="e.g. Basketball, Soccer"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Position *</label>
                      <input
                        type="text"
                        required
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                        placeholder="e.g. Point Guard, Center"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Team / Club Name</label>
                      <input
                        type="text"
                        value={form.team_name}
                        onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                        placeholder="e.g. Red Dragons Basketball Club"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Jersey / Squad Number</label>
                      <input
                        type="text"
                        value={form.jersey_number}
                        onChange={(e) => setForm({ ...form, jersey_number: e.target.value })}
                        placeholder="e.g. #23"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Sports Background */}
              {activeTab === 'sports' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Years of Competitive Experience</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.years_experience}
                      onChange={(e) => setForm({ ...form, years_experience: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 4.5"
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Competition Level</label>
                    <select
                      value={form.competition_level}
                      onChange={(e) => setForm({ ...form, competition_level: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    >
                      <option value="School / Junior">School / Junior</option>
                      <option value="Amateur">Amateur</option>
                      <option value="Semi-Pro">Semi-Pro</option>
                      <option value="Elite / Professional">Elite / Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Training Frequency (Sessions / Week)</label>
                    <input
                      type="number"
                      value={form.training_frequency}
                      onChange={(e) => setForm({ ...form, training_frequency: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 4"
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Injury History */}
              {activeTab === 'injury' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Previous Injury History Summary</label>
                    <textarea
                      rows="3"
                      value={form.previous_injuries_summary}
                      onChange={(e) => setForm({ ...form, previous_injuries_summary: e.target.value })}
                      placeholder="Detail past injury location, type, date, severity & recovery duration (e.g. Left Knee ACL Grade II sprain in 2024, 6 months rehab)..."
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Injury Recurrence Flag</label>
                      <select
                        value={form.injury_recurrence_flag}
                        onChange={(e) => setForm({ ...form, injury_recurrence_flag: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      >
                        <option value="No">No Recurrence History</option>
                        <option value="Yes - Minor">Yes - Minor Recurrence</option>
                        <option value="Yes - Chronic">Yes - Chronic Recurrence</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Injury Status</label>
                      <select
                        value={form.current_injury_status}
                        onChange={(e) => setForm({ ...form, current_injury_status: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      >
                        <option value="Fully Cleared">Fully Cleared / Uninjured</option>
                        <option value="Returning-to-Play">Returning-to-Play Protocol</option>
                        <option value="Injured / Active Rehab">Injured / Active Rehab</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Physical Screening Baselines */}
              {activeTab === 'screening' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Nordic Hamstring Eccentric Strength (N)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.nordic_strength_score}
                        onChange={(e) => setForm({ ...form, nordic_strength_score: e.target.value })}
                        placeholder="e.g. 380 N"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Hamstring / Quad Flexibility (°) </label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.hamstring_flexibility}
                        onChange={(e) => setForm({ ...form, hamstring_flexibility: e.target.value })}
                        placeholder="e.g. 85°"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Baseline LESS Score (0-17)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.baseline_less_score}
                        onChange={(e) => setForm({ ...form, baseline_less_score: e.target.value })}
                        placeholder="e.g. 4.5"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Quadriceps:Hamstring Ratio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.quad_hamstring_ratio}
                        onChange={(e) => setForm({ ...form, quad_hamstring_ratio: e.target.value })}
                        placeholder="e.g. 0.65"
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Consent & Admin */}
              {activeTab === 'admin' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Parent / Guardian Consent Status</label>
                      <select
                        value={form.parental_consent}
                        onChange={(e) => setForm({ ...form, parental_consent: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      >
                        <option value="Cleared / N/A">Cleared / Adult (18+)</option>
                        <option value="Signed Minor Consent">Signed Minor Consent On File</option>
                        <option value="Pending Signature">Pending Minor Signature</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Medical Clearance Status</label>
                      <select
                        value={form.medical_clearance_status}
                        onChange={(e) => setForm({ ...form, medical_clearance_status: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                      >
                        <option value="Cleared">Cleared for Full Play</option>
                        <option value="Restricted">Restricted Training Only</option>
                        <option value="Pending">Pending Clearance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Emergency Contact Details</label>
                    <input
                      type="text"
                      value={form.emergency_contact}
                      onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                      placeholder="e.g. Jane Doe (Mother) - +1 555-0192"
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coach Initial Assessment Notes</label>
                    <textarea
                      rows="2"
                      value={form.coach_notes}
                      onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
                      placeholder="Enter initial coaching observations..."
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-[11px] theme-muted font-medium">
                  {activeTab === 'identity' && 'Step 1 of 5: Identity & Basic Info'}
                  {activeTab === 'sports' && 'Step 2 of 5: Sports Background'}
                  {activeTab === 'injury' && 'Step 3 of 5: Injury History'}
                  {activeTab === 'screening' && 'Step 4 of 5: Physical Screening Baselines'}
                  {activeTab === 'admin' && 'Step 5 of 5: Consent & Admin'}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 theme-muted hover:theme-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="accent-btn font-bold px-5 py-2.5 rounded-xl shadow-lg disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>{submitting ? 'Registering Profile...' : 'Register & Generate Activation Token'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
