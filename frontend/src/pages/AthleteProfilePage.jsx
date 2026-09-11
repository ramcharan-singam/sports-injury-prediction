import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Activity, Heart, ShieldAlert, Plus, CheckCircle2, 
  Save, AlertCircle, Calendar, FileText, Users, Award, Camera,
  Edit3, X, Sparkles, Scale, Gauge, Dumbbell, Zap, RotateCcw, HeartPulse
} from 'lucide-react';

export const AthleteProfilePage = () => {
  const { user } = useContext(AuthContext);
  const isCoach = user?.role === 'Coach';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Dedicated Coach Profile State (All 19 Attributes)
  const [coachProfile, setCoachProfile] = useState(null);
  const [coachFormData, setCoachFormData] = useState({
    full_name: '',
    profile_image: '',
    dob: '',
    national_identity_number: '',
    coach_license_number: '',
    certification_level: '',
    issuing_authority: '',
    license_expiry_date: '',
    assigned_team_id: '',
    current_designation: '',
    qualification: '',
    coaching_specialization: '',
    years_coaching_experience: 10,
    primary_sport: '',
    club_academy: '',
    coaching_level: 'Elite',
    certifications_licenses: '',
    sports_worked_with: '',
    achievements: '',
    areas_of_expertise: '',
    location: '',
    languages: '',
    bio: '',
    verification_status: 'Verified ✅',
    teams_athletes_coached: ''
  });

  // Comprehensive Athlete Profile State (Matching 5 Tabs)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    age: 22,
    gender: 'Unspecified',
    height: 182.5,
    weight: 78.0,
    dominant_side: 'Right',
    sport: 'Basketball',
    position: 'Point Guard',
    team_name: '',
    jersey_number: '',
    years_experience: 1.0,
    competition_level: 'Amateur',
    training_frequency: 5,
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
    training_load: 75.0,
    flexibility: 82.0,
    strength: 85.0,
    balance: 78.0,
    endurance: 90.0,
  });

  const [injuries, setInjuries] = useState([]);

  useEffect(() => {
    loadMyProfile();
  }, [user]);

  const loadMyProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (isCoach) {
      try {
        const res = await api.get('/api/coach/profile');
        setCoachProfile(res.data);
        setCoachFormData({
          full_name: res.data.full_name || user?.name || '',
          profile_image: res.data.profile_image || user?.profile_image || '',
          dob: res.data.dob || '',
          national_identity_number: res.data.national_identity_number || '',
          coach_license_number: res.data.coach_license_number || '',
          certification_level: res.data.certification_level || '',
          issuing_authority: res.data.issuing_authority || '',
          license_expiry_date: res.data.license_expiry_date || '',
          assigned_team_id: res.data.assigned_team_id || '',
          current_designation: res.data.current_designation || 'Head Performance & Fitness Coach',
          qualification: res.data.qualification || 'M.Sc. Sports Science & Biomechanics, CSCS',
          coaching_specialization: res.data.coaching_specialization || 'ACL Injury Prevention & Athletic Conditioning',
          years_coaching_experience: res.data.years_coaching_experience ?? 10,
          primary_sport: res.data.primary_sport || 'Soccer / Football',
          club_academy: res.data.club_academy || 'Apex Performance Academy',
          coaching_level: res.data.coaching_level || 'Elite',
          certifications_licenses: res.data.certifications_licenses || 'UEFA A License, CSCS',
          sports_worked_with: res.data.sports_worked_with || 'Soccer, Track & Field, Basketball',
          achievements: res.data.achievements || 'Guided 15+ Elite Athletes to International Competitions',
          areas_of_expertise: res.data.areas_of_expertise || 'Biomechanical Video Analysis, Return-to-Sport Protocols',
          location: res.data.location || 'London, United Kingdom',
          languages: res.data.languages || 'English, Spanish',
          bio: res.data.bio || 'Dedicated Senior High-Performance Coach with over 10 years of experience.',
          verification_status: res.data.verification_status || 'Verified ✅',
          teams_athletes_coached: res.data.teams_athletes_coached || 'Apex FC, Olympic Squad'
        });
        setIsEditing(false);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load Coach professional profile.' });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.get('/api/athletes/me');
      setProfile(res.data);
      setFormData({
        name: res.data.user?.name || user?.name || '',
        email: res.data.user?.email || user?.email || '',
        dob: res.data.dob || res.data.date_of_birth || '',
        age: res.data.age || 22,
        gender: res.data.gender || 'Unspecified',
        height: res.data.height || 182.5,
        weight: res.data.weight || 78.0,
        dominant_side: res.data.dominant_leg || res.data.dominant_side || 'Right',
        sport: res.data.sport || 'Basketball',
        position: res.data.position || 'Point Guard',
        team_name: res.data.team_name || '',
        jersey_number: res.data.jersey_number || '',
        years_experience: res.data.years_experience || 1.0,
        competition_level: res.data.competition_level || 'Amateur',
        training_frequency: res.data.training_frequency || 5,
        previous_injuries_summary: res.data.previous_injuries_summary || '',
        injury_recurrence_flag: res.data.injury_recurrence_flag || 'No',
        current_injury_status: res.data.current_injury_status || 'Fully Cleared',
        nordic_strength_score: res.data.nordic_strength_score !== null && res.data.nordic_strength_score !== undefined ? res.data.nordic_strength_score : '',
        hamstring_flexibility: res.data.hamstring_flexibility !== null && res.data.hamstring_flexibility !== undefined ? res.data.hamstring_flexibility : '',
        baseline_less_score: res.data.baseline_less_score !== null && res.data.baseline_less_score !== undefined ? res.data.baseline_less_score : '',
        quad_hamstring_ratio: res.data.quad_hamstring_ratio !== null && res.data.quad_hamstring_ratio !== undefined ? res.data.quad_hamstring_ratio : '',
        parental_consent: res.data.parental_consent || 'Cleared / N/A',
        medical_clearance_status: res.data.medical_clearance_status || 'Cleared',
        emergency_contact: res.data.emergency_contact || '',
        coach_notes: res.data.coach_notes || '',
        training_load: res.data.training_load || 75.0,
        flexibility: res.data.flexibility || 82.0,
        strength: res.data.strength || 85.0,
        balance: res.data.balance || 78.0,
        endurance: res.data.endurance || 90.0,
      });
      setInjuries(res.data.injuries || []);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
        setIsEditing(true);
      } else {
        setMessage({ type: 'error', text: 'Failed to load athlete profile.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoachProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (
      !coachFormData.full_name?.trim() ||
      !coachFormData.qualification?.trim() ||
      !coachFormData.coaching_specialization?.trim() ||
      !coachFormData.primary_sport?.trim() ||
      !coachFormData.current_designation?.trim()
    ) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields marked with * (Full Name, Qualification, Specialization, Primary Sport, Position).'
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/api/coach/profile', coachFormData);
      setCoachProfile(res.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Coach professional profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update Coach profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCoach = () => {
    if (coachProfile) {
      setCoachFormData({
        full_name: coachProfile.full_name || '',
        profile_image: coachProfile.profile_image || '',
        dob: coachProfile.dob || '',
        national_identity_number: coachProfile.national_identity_number || '',
        coach_license_number: coachProfile.coach_license_number || '',
        certification_level: coachProfile.certification_level || '',
        issuing_authority: coachProfile.issuing_authority || '',
        license_expiry_date: coachProfile.license_expiry_date || '',
        assigned_team_id: coachProfile.assigned_team_id || '',
        current_designation: coachProfile.current_designation || '',
        qualification: coachProfile.qualification || '',
        coaching_specialization: coachProfile.coaching_specialization || '',
        years_coaching_experience: coachProfile.years_coaching_experience ?? 10,
        primary_sport: coachProfile.primary_sport || '',
        club_academy: coachProfile.club_academy || '',
        coaching_level: coachProfile.coaching_level || 'Elite',
        certifications_licenses: coachProfile.certifications_licenses || '',
        sports_worked_with: coachProfile.sports_worked_with || '',
        achievements: coachProfile.achievements || '',
        areas_of_expertise: coachProfile.areas_of_expertise || '',
        location: coachProfile.location || '',
        languages: coachProfile.languages || '',
        bio: coachProfile.bio || '',
        verification_status: coachProfile.verification_status || 'Verified ✅',
        teams_athletes_coached: coachProfile.teams_athletes_coached || ''
      });
    }
    setIsEditing(false);
  };

  const handleAthleteSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        sport: formData.sport,
        position: formData.position,
        age: parseInt(formData.age) || 22,
        height: parseFloat(formData.height) || 180.0,
        weight: parseFloat(formData.weight) || 75.0,
        dob: formData.dob || null,
        gender: formData.gender,
        dominant_leg: formData.dominant_side,
        team_name: formData.team_name || null,
        jersey_number: formData.jersey_number || null,
        years_experience: parseFloat(formData.years_experience) || 1.0,
        competition_level: formData.competition_level,
        training_frequency: parseInt(formData.training_frequency) || 4,
        previous_injuries_summary: formData.previous_injuries_summary || null,
        injury_recurrence_flag: formData.injury_recurrence_flag,
        current_injury_status: formData.current_injury_status,
        nordic_strength_score: formData.nordic_strength_score !== '' ? parseFloat(formData.nordic_strength_score) : null,
        hamstring_flexibility: formData.hamstring_flexibility !== '' ? parseFloat(formData.hamstring_flexibility) : null,
        baseline_less_score: formData.baseline_less_score !== '' ? parseFloat(formData.baseline_less_score) : null,
        quad_hamstring_ratio: formData.quad_hamstring_ratio !== '' ? parseFloat(formData.quad_hamstring_ratio) : null,
        parental_consent: formData.parental_consent,
        medical_clearance_status: formData.medical_clearance_status,
        emergency_contact: formData.emergency_contact || null,
        coach_notes: formData.coach_notes || null,
        training_load: parseFloat(formData.training_load) || 70.0,
        flexibility: parseFloat(formData.flexibility) || 80.0,
        strength: parseFloat(formData.strength) || 80.0,
        balance: parseFloat(formData.balance) || 80.0,
        endurance: parseFloat(formData.endurance) || 80.0
      };

      if (profile) {
        const res = await api.put(`/api/athletes/${profile.athlete_id}`, payload);
        setProfile(res.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Athlete profile updated successfully!' });
      } else {
        const res = await api.post('/api/athletes', payload);
        setProfile(res.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Athlete profile created successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Error saving athlete profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  /* RENDER COACH PROFILE PAGE WHEN USER ROLE IS COACH */
  if (isCoach && coachProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Banner Card */}
        <div className="p-6 sm:p-8 rounded-2xl theme-card border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-purple-500/5 shadow-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="relative group">
              {coachFormData.profile_image ? (
                <img 
                  src={coachFormData.profile_image} 
                  alt={coachFormData.full_name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl" 
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  {(coachFormData.full_name || 'C').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase shadow">
                {coachFormData.coaching_level || 'Elite'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold theme-text font-display">
                  Coach {coachFormData.full_name}'s Professional Profile
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {coachFormData.verification_status || 'Verified ✅'}
                </span>
              </div>

              <p className="text-xs theme-muted">
                Email: <span className="theme-text font-semibold">{user?.email}</span> | Unique Coach ID: <span className="font-mono text-emerald-400 font-bold">{coachProfile.unique_coach_id}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {coachFormData.current_designation}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  ⚽ {coachFormData.primary_sport}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  🏆 {coachFormData.years_coaching_experience}+ Yrs Exp
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="accent-btn text-xs font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Coach Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelCoach}
                className="theme-card theme-muted hover:theme-text text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors border border-white/10 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form rendering all 19 Coach attributes */}
        <form onSubmit={handleSaveCoachProfile} className="space-y-8">
          
          {/* SECTION 1: Core Profile & Identity */}
          <div className="theme-card p-6 rounded-2xl space-y-4 border border-emerald-500/20">
            <h3 className="text-base font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
              <User className="w-5 h-5 text-emerald-400" />
              <span>Core Profile & Identity Details</span>
            </h3>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Full Name</span>
                  <span className="text-sm font-extrabold theme-text">{coachFormData.full_name}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Coach ID</span>
                  <span className="text-sm font-mono font-extrabold text-emerald-400">{coachProfile.unique_coach_id}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Qualification</span>
                  <span className="text-xs font-bold text-amber-400">{coachFormData.qualification || 'Not Specified'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Coaching Specialization</span>
                  {coachFormData.coaching_specialization ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {coachFormData.coaching_specialization.split(',').map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-xs theme-muted">Not Specified</span>}
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase theme-muted">
                    <span>Coaching Experience</span>
                    <span className="text-amber-400 font-extrabold">{coachFormData.years_coaching_experience} Yrs</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (coachFormData.years_coaching_experience / 25) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Verification Status</span>
                  <span className="text-xs font-bold text-emerald-400">{coachFormData.verification_status || 'Verified ✅'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Preset Avatar Selector */}
                <div className="p-3.5 rounded-xl theme-input space-y-2">
                  <label className="block text-[10px] font-bold uppercase theme-muted">Quick Choose Avatar Preset or Input Custom URL</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
                    ].map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoachFormData({ ...coachFormData, profile_image: url })}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          coachFormData.profile_image === url ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste custom photo URL..."
                    value={coachFormData.profile_image}
                    onChange={(e) => setCoachFormData({ ...coachFormData, profile_image: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Full Name <span className="text-rose-400 font-bold">*</span></label>
                    <input
                      type="text"
                      required
                      value={coachFormData.full_name}
                      onChange={(e) => setCoachFormData({ ...coachFormData, full_name: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coach ID (System Generated)</label>
                    <input
                      type="text"
                      disabled
                      value={coachProfile.unique_coach_id}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 opacity-80 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Qualification <span className="text-rose-400 font-bold">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M.Sc. Sports Science & Biomechanics, CSCS"
                      value={coachFormData.qualification}
                      onChange={(e) => setCoachFormData({ ...coachFormData, qualification: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coaching Specialization <span className="text-rose-400 font-bold">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ACL Injury Prevention, Athletic Conditioning"
                      value={coachFormData.coaching_specialization}
                      onChange={(e) => setCoachFormData({ ...coachFormData, coaching_specialization: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Years of Coaching Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={coachFormData.years_coaching_experience}
                      onChange={(e) => setCoachFormData({ ...coachFormData, years_coaching_experience: parseInt(e.target.value) || 0 })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Sport & Organization Assignment */}
          <div className="theme-card p-6 rounded-2xl space-y-4 border border-cyan-500/20">
            <h3 className="text-base font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Sport & Team Assignment</span>
            </h3>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Primary Sport</span>
                  <span className="text-xs font-bold text-cyan-400">{coachFormData.primary_sport || 'Not Specified'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Team / Club / Academy</span>
                  <span className="text-xs font-semibold theme-text">{coachFormData.club_academy || 'Not Specified'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Coaching Level</span>
                  <span className="text-xs font-extrabold text-emerald-400">{coachFormData.coaching_level || 'Elite'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Current Team / Position</span>
                  <span className="text-xs font-semibold theme-text">{coachFormData.current_designation || 'Not Specified'}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Primary Sport <span className="text-rose-400 font-bold">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soccer / Football"
                    value={coachFormData.primary_sport}
                    onChange={(e) => setCoachFormData({ ...coachFormData, primary_sport: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Team / Club / Academy</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Performance Academy"
                    value={coachFormData.club_academy}
                    onChange={(e) => setCoachFormData({ ...coachFormData, club_academy: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coaching Level</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Beginner', 'Academy', 'Professional', 'Elite'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setCoachFormData({ ...coachFormData, coaching_level: level })}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                          coachFormData.coaching_level === level
                            ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-md'
                            : 'theme-card theme-muted hover:theme-text border-white/10'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Team / Position <span className="text-rose-400 font-bold">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Head Performance & Fitness Coach"
                    value={coachFormData.current_designation}
                    onChange={(e) => setCoachFormData({ ...coachFormData, current_designation: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Certifications, Experience & Achievements */}
          <div className="theme-card p-6 rounded-2xl space-y-4 border border-amber-500/20">
            <h3 className="text-base font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Certifications, Experience & Achievements</span>
            </h3>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Certifications / Licenses</span>
                  {coachFormData.certifications_licenses ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coachFormData.certifications_licenses.split(',').map((item, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          📜 {item.trim()}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-xs theme-muted">Not Specified</span>}
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Sports Worked With</span>
                  {coachFormData.sports_worked_with ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coachFormData.sports_worked_with.split(',').map((item, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          🏅 {item.trim()}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-xs theme-muted">Not Specified</span>}
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Areas of Expertise</span>
                  {coachFormData.areas_of_expertise ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coachFormData.areas_of_expertise.split(',').map((item, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          🧠 {item.trim()}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-xs theme-muted">Not Specified</span>}
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Teams / Athletes Coached</span>
                  {coachFormData.teams_athletes_coached ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coachFormData.teams_athletes_coached.split(',').map((item, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          👥 {item.trim()}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-xs theme-muted">Not Specified</span>}
                </div>

                <div className="md:col-span-2 p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Achievements</span>
                  <p className="text-xs font-semibold text-amber-300 leading-relaxed pt-0.5">
                    ⭐ {coachFormData.achievements || 'Guided 15+ Elite Athletes to International Competitions'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Certifications / Licenses (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. UEFA A License, NSCA Certified Strength Coach"
                    value={coachFormData.certifications_licenses}
                    onChange={(e) => setCoachFormData({ ...coachFormData, certifications_licenses: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Sports Worked With (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Soccer, Basketball, Track & Field"
                    value={coachFormData.sports_worked_with}
                    onChange={(e) => setCoachFormData({ ...coachFormData, sports_worked_with: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Areas of Expertise (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Biomechanical Video Analysis, Return-to-Sport Protocols"
                    value={coachFormData.areas_of_expertise}
                    onChange={(e) => setCoachFormData({ ...coachFormData, areas_of_expertise: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Teams / Athletes Coached (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Football Club, Olympic Track Squad"
                    value={coachFormData.teams_athletes_coached}
                    onChange={(e) => setCoachFormData({ ...coachFormData, teams_athletes_coached: e.target.value })}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Achievements</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Guided 15+ Elite Athletes to International Competitions & Zero ACL Recurrence"
                    value={coachFormData.achievements}
                    onChange={(e) => setCoachFormData({ ...coachFormData, achievements: e.target.value })}
                    className="w-full theme-input rounded-xl p-3 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Location, Languages & Bio */}
          <div className="theme-card p-6 rounded-2xl space-y-4 border border-purple-500/20">
            <h3 className="text-base font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Location, Languages & Bio</span>
            </h3>

            {!isEditing ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Location</span>
                    <span className="text-xs font-extrabold text-purple-400">📍 {coachFormData.location || 'London, UK'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Languages</span>
                    {coachFormData.languages ? (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {coachFormData.languages.split(',').map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                            🗣️ {item.trim()}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-xs theme-muted">Not Specified</span>}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Verification Status</span>
                    <span className="text-xs font-extrabold text-emerald-400">{coachFormData.verification_status || 'Verified ✅'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase theme-muted">Professional Bio</span>
                  <p className="text-xs leading-relaxed theme-text font-medium whitespace-pre-line">
                    {coachFormData.bio || 'Dedicated Senior High-Performance Coach.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. London, United Kingdom"
                      value={coachFormData.location}
                      onChange={(e) => setCoachFormData({ ...coachFormData, location: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Languages (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. English, Spanish"
                      value={coachFormData.languages}
                      onChange={(e) => setCoachFormData({ ...coachFormData, languages: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Verification Status ✅</label>
                    <input
                      type="text"
                      disabled
                      value={coachFormData.verification_status || 'Verified ✅'}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 opacity-85 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Professional Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Write your professional coaching bio here..."
                    value={coachFormData.bio}
                    onChange={(e) => setCoachFormData({ ...coachFormData, bio: e.target.value })}
                    className="w-full theme-input rounded-xl p-3 text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coach Save / Cancel Bar */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelCoach}
                className="theme-card theme-muted hover:theme-text font-semibold text-xs py-2.5 px-5 rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="accent-btn font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Coach Profile...' : 'Save Coach Profile'}</span>
              </button>
            </div>
          )}

        </form>
      </div>
    );
  }

  /* RENDER ATHLETE PROFILE PAGE WHEN USER ROLE IS ATHLETE */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Card */}
      <div className="theme-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-2 border-white/20">
              {formData.name ? formData.name.slice(0, 2).toUpperCase() : user?.name ? user.name.slice(0, 2).toUpperCase() : 'AT'}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-black rounded-lg border border-white/20 text-cyan-400">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold theme-text font-display">
              {formData.name || user?.name}'s Athlete Profile
            </h1>
            <p className="text-xs theme-muted">
              Email: <span className="theme-text font-semibold">{formData.email || user?.email}</span> | Account ID: <span className="font-mono text-cyan-400">{profile?.athlete_id ? profile.athlete_id.slice(0, 8) + '...' : user?.user_id ? user.user_id.slice(0, 8) + '...' : 'Active Account'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                {user?.role ? user.role : 'Athlete'}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                {formData.sport} • {formData.position}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                {formData.competition_level}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Toggle Edit Mode */}
        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <span className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Editing Active Mode
            </span>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 5 Tab Navigation Bar matching EditAthleteModal */}
      <div className="flex border-b border-white/10 theme-card rounded-xl overflow-x-auto custom-scrollbar text-xs p-1">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-3 font-semibold transition-all rounded-lg flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'identity' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-bold' 
              : 'theme-muted hover:theme-text'
          }`}
        >
          <User className="w-4 h-4 text-cyan-400" />
          <span>1. Identity & Basic Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sports')}
          className={`px-4 py-3 font-semibold transition-all rounded-lg flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sports' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-bold' 
              : 'theme-muted hover:theme-text'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>2. Sports Background</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('injury')}
          className={`px-4 py-3 font-semibold transition-all rounded-lg flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'injury' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-bold' 
              : 'theme-muted hover:theme-text'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>3. Injury History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('screening')}
          className={`px-4 py-3 font-semibold transition-all rounded-lg flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'screening' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-bold' 
              : 'theme-muted hover:theme-text'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <span>4. Physical Screening</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-3 font-semibold transition-all rounded-lg flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-bold' 
              : 'theme-muted hover:theme-text'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>5. Consent & Workload</span>
        </button>
      </div>

      {/* Main Content Area */}
      <form onSubmit={handleAthleteSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Selected Tab Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB 1: Identity & Basic Info */}
          {activeTab === 'identity' && (
            <div className="theme-card p-6 rounded-2xl space-y-6 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                  <User className="w-5 h-5 accent-text" />
                  <span>1. Athlete Personal & Identity Information</span>
                </h3>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Athlete Full Name</span>
                    <span className="text-sm font-bold theme-text">{formData.name}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Email Address</span>
                    <span className="text-sm font-bold theme-text">{formData.email}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Sport</span>
                    <span className="text-sm font-semibold theme-text">{formData.sport}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Position</span>
                    <span className="text-sm font-semibold theme-text">{formData.position}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Date of Birth</span>
                    <span className="text-sm font-semibold theme-text">{formData.dob || 'N/A'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Age</span>
                    <span className="text-sm font-semibold theme-text">{formData.age} years</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Gender</span>
                    <span className="text-sm font-semibold theme-text">{formData.gender}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Dominant Leg / Foot</span>
                    <span className="text-sm font-semibold theme-text">{formData.dominant_side}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Height</span>
                    <span className="text-sm font-semibold theme-text">{formData.height} cm</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Weight</span>
                    <span className="text-sm font-semibold theme-text">{formData.weight} kg</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Team / Club Name</span>
                    <span className="text-sm font-semibold theme-text">{formData.team_name || 'N/A'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Jersey Number</span>
                    <span className="text-sm font-semibold text-cyan-400">#{formData.jersey_number || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Athlete Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Athlete Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Age (Years) *</label>
                      <input
                        type="number"
                        required
                        min="10"
                        max="80"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Unspecified</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Height (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Weight (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Dominant Leg / Foot</label>
                      <select
                        value={formData.dominant_side}
                        onChange={(e) => setFormData({ ...formData, dominant_side: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      >
                        <option value="Right">Right Leg</option>
                        <option value="Left">Left Leg</option>
                        <option value="Ambidextrous">Ambidextrous</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Sport *</label>
                      <input
                        type="text"
                        required
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Position *</label>
                      <input
                        type="text"
                        required
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Team / Club Name</label>
                      <input
                        type="text"
                        value={formData.team_name}
                        onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Jersey / Squad Number</label>
                      <input
                        type="text"
                        value={formData.jersey_number}
                        onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Sports Background */}
          {activeTab === 'sports' && (
            <div className="theme-card p-6 rounded-2xl space-y-6 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>2. Sports Background & Competition Details</span>
                </h3>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Years Competitive Experience</span>
                    <span className="text-sm font-bold text-amber-400">{formData.years_experience} years</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Competition Level</span>
                    <span className="text-sm font-bold text-emerald-400">{formData.competition_level}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Training Frequency</span>
                    <span className="text-sm font-bold theme-text">{formData.training_frequency} sessions / week</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Years of Competitive Experience</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseFloat(e.target.value) || 0 })}
                      className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Competition Level</label>
                    <select
                      value={formData.competition_level}
                      onChange={(e) => setFormData({ ...formData, competition_level: e.target.value })}
                      className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-semibold"
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
                      min="1"
                      max="7"
                      value={formData.training_frequency}
                      onChange={(e) => setFormData({ ...formData, training_frequency: parseInt(e.target.value) || 1 })}
                      className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Injury History */}
          {activeTab === 'injury' && (
            <div className="theme-card p-6 rounded-2xl space-y-6 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>3. Relevant Injury & Rehabilitation History</span>
                </h3>
              </div>

              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Previous Injury History Summary</span>
                    <p className="theme-text leading-relaxed whitespace-pre-line">
                      {formData.previous_injuries_summary || 'No previous injury history recorded.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Injury Recurrence Flag</span>
                      <span className={`text-xs font-extrabold ${formData.injury_recurrence_flag === 'No' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formData.injury_recurrence_flag}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Current Injury Status</span>
                      <span className="text-xs font-extrabold text-cyan-400">{formData.current_injury_status}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Previous Injury History Summary</label>
                    <textarea
                      rows="3"
                      value={formData.previous_injuries_summary}
                      onChange={(e) => setFormData({ ...formData, previous_injuries_summary: e.target.value })}
                      placeholder="Detail past injury location, type, date, severity & recovery duration..."
                      className="w-full theme-input rounded-xl p-3 theme-text focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Injury Recurrence Flag</label>
                      <select
                        value={formData.injury_recurrence_flag}
                        onChange={(e) => setFormData({ ...formData, injury_recurrence_flag: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      >
                        <option value="No">No Recurrence History</option>
                        <option value="Yes - Minor">Yes - Minor Recurrence</option>
                        <option value="Yes - Chronic">Yes - Chronic Recurrence</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Injury Status</label>
                      <select
                        value={formData.current_injury_status}
                        onChange={(e) => setFormData({ ...formData, current_injury_status: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-semibold"
                      >
                        <option value="Fully Cleared">Fully Cleared / Uninjured</option>
                        <option value="Returning-to-Play">Returning-to-Play Protocol</option>
                        <option value="Injured / Active Rehab">Injured / Active Rehab</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Physical Screening Baselines */}
          {activeTab === 'screening' && (
            <div className="theme-card p-6 rounded-2xl space-y-6 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                  <HeartPulse className="w-5 h-5 text-emerald-400" />
                  <span>4. Physical Screening & Biomechanical Baselines</span>
                </h3>
              </div>

              {!isEditing ? (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Nordic Hamstring Eccentric Strength (N)</span>
                      <span className="text-sm font-extrabold text-emerald-400">{formData.nordic_strength_score ? `${formData.nordic_strength_score} N` : 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Hamstring / Quad Flexibility (°)</span>
                      <span className="text-sm font-extrabold text-cyan-400">{formData.hamstring_flexibility ? `${formData.hamstring_flexibility}°` : 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Baseline LESS Score (0-17)</span>
                      <span className="text-sm font-extrabold text-amber-400">{formData.baseline_less_score ? formData.baseline_less_score : 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Quadriceps:Hamstring Ratio</span>
                      <span className="text-sm font-extrabold text-purple-400">{formData.quad_hamstring_ratio ? formData.quad_hamstring_ratio : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Functional Performance Benchmarks</span>
                    {[
                      { label: 'Flexibility Score', field: 'flexibility' },
                      { label: 'Strength Index', field: 'strength' },
                      { label: 'Dynamic Balance Score', field: 'balance' },
                      { label: 'Muscular / Cardio Endurance', field: 'endurance' },
                    ].map((item) => (
                      <div key={item.field} className="space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span className="theme-muted uppercase text-[10px] tracking-wider">{item.label}</span>
                          <span className="accent-text font-bold">{formData[item.field]} / 100</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, formData[item.field]))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Nordic Hamstring Eccentric Strength (N)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.nordic_strength_score}
                        onChange={(e) => setFormData({ ...formData, nordic_strength_score: e.target.value })}
                        placeholder="e.g. 380 N"
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Hamstring / Quad Flexibility (°)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.hamstring_flexibility}
                        onChange={(e) => setFormData({ ...formData, hamstring_flexibility: e.target.value })}
                        placeholder="e.g. 85°"
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Baseline LESS Score (0-17)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.baseline_less_score}
                        onChange={(e) => setFormData({ ...formData, baseline_less_score: e.target.value })}
                        placeholder="e.g. 4.5"
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Quadriceps:Hamstring Ratio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.quad_hamstring_ratio}
                        onChange={(e) => setFormData({ ...formData, quad_hamstring_ratio: e.target.value })}
                        placeholder="e.g. 0.65"
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Adjust Benchmark Sliders (0-100)</span>
                    {[
                      { label: 'Flexibility Score', field: 'flexibility' },
                      { label: 'Strength Index', field: 'strength' },
                      { label: 'Dynamic Balance Score', field: 'balance' },
                      { label: 'Muscular / Cardio Endurance', field: 'endurance' },
                    ].map((item) => (
                      <div key={item.field} className="space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span className="theme-muted uppercase text-[10px] tracking-wider">{item.label}</span>
                          <span className="accent-text font-bold">{formData[item.field]} / 100</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={formData[item.field]}
                          onChange={(e) => setFormData({ ...formData, [item.field]: parseFloat(e.target.value) })}
                          className="w-full accent-cyan-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Consent & Workload */}
          {activeTab === 'admin' && (
            <div className="theme-card p-6 rounded-2xl space-y-6 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>5. Consent, Clearance & Workload Management</span>
                </h3>
              </div>

              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Target Training Load Index (0-100)</span>
                      <span className="text-sm font-extrabold text-amber-400 font-mono">{formData.training_load}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Medical Clearance Status</span>
                      <span className="text-sm font-extrabold text-emerald-400">{formData.medical_clearance_status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Parent / Guardian Consent Status</span>
                      <span className="text-xs font-semibold theme-text">{formData.parental_consent}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Emergency Contact Details</span>
                      <span className="text-xs font-semibold theme-text">{formData.emergency_contact || 'Not Specified'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-muted block">Coach Assessment Notes</span>
                    <p className="theme-text leading-relaxed whitespace-pre-line italic">
                      "{formData.coach_notes || 'No assessment notes recorded yet.'}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Target Training Load Index (0-100)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.training_load}
                        onChange={(e) => setFormData({ ...formData, training_load: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-bold text-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Medical Clearance Status</label>
                      <select
                        value={formData.medical_clearance_status}
                        onChange={(e) => setFormData({ ...formData, medical_clearance_status: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none font-semibold"
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
                        value={formData.parental_consent}
                        onChange={(e) => setFormData({ ...formData, parental_consent: e.target.value })}
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
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
                        value={formData.emergency_contact}
                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                        placeholder="e.g. Jane Doe (Mother) - +1 555-0192"
                        className="w-full theme-input rounded-xl px-4 py-2.5 theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coach Assessment Notes</label>
                    <textarea
                      rows="2"
                      value={formData.coach_notes}
                      onChange={(e) => setFormData({ ...formData, coach_notes: e.target.value })}
                      placeholder="Enter coaching observations..."
                      className="w-full theme-input rounded-xl p-3 theme-text focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save / Action Bar in Edit Mode */}
          {isEditing && (
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="accent-btn font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50 text-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-5 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all text-xs flex items-center space-x-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Profile Overview & Quick Stats */}
        <div className="space-y-6">
          <div className="theme-card p-6 rounded-2xl space-y-4 border border-white/10 shadow-xl">
            <h3 className="text-base font-bold theme-text border-b border-white/10 pb-3 font-display flex items-center justify-between">
              <span>Athlete Summary</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {formData.current_injury_status || 'Fully Cleared'}
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Athlete Name:</span>
                <span className="font-bold theme-text">{formData.name || user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Sport & Position:</span>
                <span className="font-bold text-cyan-400">{formData.sport} ({formData.position})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Team / Jersey:</span>
                <span className="font-bold theme-text">{formData.team_name || 'N/A'} #{formData.jersey_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Height / Weight:</span>
                <span className="font-bold theme-text">{formData.height} cm / {formData.weight} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Dominant Side:</span>
                <span className="font-bold theme-text">{formData.dominant_side}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Competition Level:</span>
                <span className="font-bold text-emerald-400">{formData.competition_level}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Medical Clearance:</span>
                <span className="font-bold text-emerald-400">{formData.medical_clearance_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="theme-muted">Emergency Contact:</span>
                <span className="font-semibold theme-text text-[11px] truncate max-w-[140px]">{formData.emergency_contact || 'None'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="theme-muted">Weekly Load Index:</span>
                <span className="font-bold text-amber-400 font-mono">{formData.training_load} / 100</span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AthleteProfilePage;
