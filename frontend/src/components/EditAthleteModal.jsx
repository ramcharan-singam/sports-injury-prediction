import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Edit3, X, User, Award, ShieldAlert, HeartPulse, FileText, 
  CheckCircle2, AlertCircle, Save
} from 'lucide-react';

export const EditAthleteModal = ({ isOpen, onClose, athlete, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    dob: '',
    gender: 'Unspecified',
    height: 180.0,
    weight: 75.0,
    dominant_leg: 'Right',
    sport: '',
    position: '',
    team_name: '',
    jersey_number: '',
    age: 22,
    years_experience: 1.0,
    competition_level: 'Amateur',
    training_frequency: 4,
    previous_injuries_summary: '',
    injury_recurrence_flag: 'No',
    current_injury_status: 'Fully Cleared',
    nordic_strength_score: '',
    hamstring_flexibility: '',
    baseline_less_score: '',
    quad_hamstring_ratio: '',
    parental_consent: 'Cleared / N/A',
    medical_clearance_status: 'Cleared',
    emergency_contact: '',
    coach_notes: '',
    training_load: 70.0,
    flexibility: 80.0,
    strength: 80.0,
    balance: 80.0,
    endurance: 80.0
  });

  useEffect(() => {
    if (athlete) {
      setForm({
        name: athlete.user?.name || '',
        email: athlete.user?.email || '',
        dob: athlete.dob || '',
        gender: athlete.gender || 'Unspecified',
        height: athlete.height || 180.0,
        weight: athlete.weight || 75.0,
        dominant_leg: athlete.dominant_leg || 'Right',
        sport: athlete.sport || '',
        position: athlete.position || '',
        team_name: athlete.team_name || '',
        jersey_number: athlete.jersey_number || '',
        age: athlete.age || 22,
        years_experience: athlete.years_experience || 1.0,
        competition_level: athlete.competition_level || 'Amateur',
        training_frequency: athlete.training_frequency || 4,
        previous_injuries_summary: athlete.previous_injuries_summary || '',
        injury_recurrence_flag: athlete.injury_recurrence_flag || 'No',
        current_injury_status: athlete.current_injury_status || 'Fully Cleared',
        nordic_strength_score: athlete.nordic_strength_score !== null && athlete.nordic_strength_score !== undefined ? athlete.nordic_strength_score : '',
        hamstring_flexibility: athlete.hamstring_flexibility !== null && athlete.hamstring_flexibility !== undefined ? athlete.hamstring_flexibility : '',
        baseline_less_score: athlete.baseline_less_score !== null && athlete.baseline_less_score !== undefined ? athlete.baseline_less_score : '',
        quad_hamstring_ratio: athlete.quad_hamstring_ratio !== null && athlete.quad_hamstring_ratio !== undefined ? athlete.quad_hamstring_ratio : '',
        parental_consent: athlete.parental_consent || 'Cleared / N/A',
        medical_clearance_status: athlete.medical_clearance_status || 'Cleared',
        emergency_contact: athlete.emergency_contact || '',
        coach_notes: athlete.coach_notes || '',
        training_load: athlete.training_load || 70.0,
        flexibility: athlete.flexibility || 80.0,
        strength: athlete.strength || 80.0,
        balance: athlete.balance || 80.0,
        endurance: athlete.endurance || 80.0
      });
    }
  }, [athlete]);

  if (!isOpen || !athlete) return null;

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
    setSuccessMsg('');

    if (!form.name?.trim() || !form.email?.trim() || !form.sport?.trim() || !form.position?.trim()) {
      setError('Please fill in all required fields marked with * (Name, Email, Sport, Position).');
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
        dob: form.dob || null,
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
        nordic_strength_score: form.nordic_strength_score !== '' ? parseFloat(form.nordic_strength_score) : null,
        hamstring_flexibility: form.hamstring_flexibility !== '' ? parseFloat(form.hamstring_flexibility) : null,
        baseline_less_score: form.baseline_less_score !== '' ? parseFloat(form.baseline_less_score) : null,
        quad_hamstring_ratio: form.quad_hamstring_ratio !== '' ? parseFloat(form.quad_hamstring_ratio) : null,
        parental_consent: form.parental_consent,
        medical_clearance_status: form.medical_clearance_status,
        emergency_contact: form.emergency_contact ? form.emergency_contact.trim() : null,
        coach_notes: form.coach_notes ? form.coach_notes.trim() : null,
        training_load: parseFloat(form.training_load) || 70.0
      };

      const res = await api.put(`/api/athletes/${athlete.athlete_id}`, payload);
      setSuccessMsg('Athlete profile updated successfully!');
      if (onSuccess) onSuccess(res.data);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update athlete profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl w-full theme-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 theme-header">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 accent-text" />
            <h2 className="text-base font-bold theme-text font-display">
              Edit Athlete Profile: {athlete.user?.name || 'Athlete'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg theme-muted hover:theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
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
            <span>5. Consent & Workload</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

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
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Athlete Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Position *</label>
                    <input
                      type="text"
                      required
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-semibold"
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
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Jersey / Squad Number</label>
                    <input
                      type="text"
                      value={form.jersey_number}
                      onChange={(e) => setForm({ ...form, jersey_number: e.target.value })}
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
                    className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Competition Level</label>
                  <select
                    value={form.competition_level}
                    onChange={(e) => setForm({ ...form, competition_level: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-semibold"
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
                    placeholder="Detail past injury location, type, date, severity & recovery duration..."
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
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-semibold"
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
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Hamstring / Quad Flexibility (°)</label>
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

            {/* TAB 5: Consent & Workload */}
            {activeTab === 'admin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Target Training Load Index (0-100)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.training_load}
                      onChange={(e) => setForm({ ...form, training_load: parseFloat(e.target.value) || 0 })}
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-bold text-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Medical Clearance Status</label>
                    <select
                      value={form.medical_clearance_status}
                      onChange={(e) => setForm({ ...form, medical_clearance_status: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none font-semibold"
                    >
                      <option value="Cleared">Cleared for Full Play</option>
                      <option value="Restricted">Restricted Training Only</option>
                      <option value="Pending">Pending Clearance</option>
                    </select>
                  </div>
                </div>

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
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Emergency Contact Details</label>
                    <input
                      type="text"
                      value={form.emergency_contact}
                      onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                      placeholder="e.g. Jane Doe (Mother) - +1 555-0192"
                      className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coach Assessment Notes</label>
                  <textarea
                    rows="2"
                    value={form.coach_notes}
                    onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
                    placeholder="Enter coaching observations..."
                    className="w-full theme-input rounded-xl px-3 py-2 theme-text focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="text-[11px] theme-muted font-medium">
                {activeTab === 'identity' && 'Section 1 of 5: Identity & Basic Info'}
                {activeTab === 'sports' && 'Section 2 of 5: Sports Background'}
                {activeTab === 'injury' && 'Section 3 of 5: Injury History'}
                {activeTab === 'screening' && 'Section 4 of 5: Physical Screening Baselines'}
                {activeTab === 'admin' && 'Section 5 of 5: Consent & Workload'}
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
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
