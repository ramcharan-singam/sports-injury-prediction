import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Activity, Heart, ShieldAlert, Plus, CheckCircle2, 
  Save, AlertCircle, Calendar, FileText, Users, Award, X, Lock, Key, BadgeCheck, Building, Shield,
  Edit3, RotateCcw
} from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);

  const role = user?.role;
  const isAthlete = role === 'Athlete';
  const isCoach = role === 'Coach';
  const isPhysio = role === 'Physiotherapist';
  const isScientist = role === 'Sports Scientist';
  const isAdmin = role === 'Admin';

  // State to toggle between View Details Mode (default) and Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // Coach Dedicated Profile State
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
  const [coachSaving, setCoachSaving] = useState(false);

  // Athlete Profile & Roster State
  const [allAthletes, setAllAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State for Athlete Profile
  const [formData, setFormData] = useState({
    sport: 'Football',
    position: 'Forward',
    age: 20,
    height: 175.0,
    weight: 70.0,
    training_load: 0.0,
    flexibility: 0.0,
    strength: 0.0,
    balance: 0.0,
    endurance: 0.0,
    coach_notes: '',
  });

  // Injury History State
  const [injuries, setInjuries] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setMessage({ type: '', text: '' });
      if (isCoach) {
        fetchCoachProfile();
      } else if (!isAthlete) {
        // Physio, Scientist, Admin viewing roster athlete profiles
        fetchAthleteRoster();
      } else {
        loadMyProfile();
      }
    }
  }, [isOpen, user]);

  const fetchCoachProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/coach/profile');
      setCoachProfile(res.data);
      setCoachFormData({
        full_name: res.data.full_name || '',
        profile_image: res.data.profile_image || '',
        dob: res.data.dob || '',
        national_identity_number: res.data.national_identity_number || '',
        coach_license_number: res.data.coach_license_number || '',
        certification_level: res.data.certification_level || '',
        issuing_authority: res.data.issuing_authority || '',
        license_expiry_date: res.data.license_expiry_date || '',
        assigned_team_id: res.data.assigned_team_id || '',
        current_designation: res.data.current_designation || '',
        qualification: res.data.qualification || '',
        coaching_specialization: res.data.coaching_specialization || '',
        years_coaching_experience: res.data.years_coaching_experience ?? 10,
        primary_sport: res.data.primary_sport || '',
        club_academy: res.data.club_academy || '',
        coaching_level: res.data.coaching_level || 'Elite',
        certifications_licenses: res.data.certifications_licenses || '',
        sports_worked_with: res.data.sports_worked_with || '',
        achievements: res.data.achievements || '',
        areas_of_expertise: res.data.areas_of_expertise || '',
        location: res.data.location || '',
        languages: res.data.languages || '',
        bio: res.data.bio || '',
        verification_status: res.data.verification_status || 'Verified ✅',
        teams_athletes_coached: res.data.teams_athletes_coached || ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load Coach professional profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoachProfile = async (e) => {
    e.preventDefault();
    setError('');
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

    setCoachSaving(true);
    try {
      const res = await api.put('/api/coach/profile', coachFormData);
      setCoachProfile(res.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Coach professional profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update Coach profile.' });
    } finally {
      setCoachSaving(false);
    }
  };

  const cancelCoachEdit = () => {
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

  const fetchAthleteRoster = () => {
    api.get('/api/athletes')
      .then((res) => {
        setAllAthletes(res.data);
        if (res.data.length > 0) {
          loadSpecificAthlete(res.data[0]);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setMessage({ type: 'error', text: 'Forbidden: Your role does not have access to view roster.' });
        }
        setLoading(false);
      });
  };

  const loadMyProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/athletes/me');
      loadSpecificAthlete(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
        setIsEditing(true); // Default to edit mode if profile doesn't exist yet
      } else {
        setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to load athlete profile.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificAthlete = (athleteData) => {
    setProfile(athleteData);
    setSelectedAthleteId(athleteData.athlete_id);
    setFormData({
      sport: athleteData.sport || 'Football',
      position: athleteData.position || 'Forward',
      age: athleteData.age || 24,
      height: athleteData.height || 180,
      weight: athleteData.weight || 75,
      training_load: athleteData.training_load || 70,
      flexibility: athleteData.flexibility || 80,
      strength: athleteData.strength || 80,
      balance: athleteData.balance || 80,
      endurance: athleteData.endurance || 80,
      coach_notes: athleteData.coach_notes || '',
    });
    setInjuries(athleteData.injuries || []);
    setLoading(false);
  };

  const handleAthleteSelect = async (athleteId) => {
    setSelectedAthleteId(athleteId);
    setIsEditing(false);
    setLoading(true);
    try {
      const res = await api.get(`/api/athletes/${athleteId}`);
      loadSpecificAthlete(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to load selected athlete.' });
      setLoading(false);
    }
  };

  const cancelAthleteEdit = () => {
    if (profile) {
      setFormData({
        sport: profile.sport || 'Football',
        position: profile.position || 'Forward',
        age: profile.age || 24,
        height: profile.height || 180,
        weight: profile.weight || 75,
        training_load: profile.training_load || 70,
        flexibility: profile.flexibility || 80,
        strength: profile.strength || 80,
        balance: profile.balance || 80,
        endurance: profile.endurance || 80,
        coach_notes: profile.coach_notes || '',
      });
    }
    setIsEditing(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let payload = { ...formData };

      if (profile) {
        const res = await api.put(`/api/athletes/${profile.athlete_id}`, payload);
        setProfile(res.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Athlete profile updated successfully!' });
      } else if (isAthlete) {
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

  const canEditAthlete = isAthlete || isCoach || isAdmin;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-5xl w-full my-auto theme-card p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-white/10 custom-scrollbar">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl accent-badge flex items-center justify-center">
              <User className="w-5 h-5 accent-text" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text font-display">
                {isCoach ? `Coach ${coachFormData.full_name || user?.name}'s Profile` : (!isAthlete && profile?.user ? `${profile.user.name}'s Profile` : `${user?.name}'s Profile`)}
              </h2>
              <p className="text-xs theme-muted flex items-center space-x-1.5 mt-0.5">
                <span>System Role: <strong className="accent-text">{role}</strong></span>
                {isCoach && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">{coachFormData.verification_status || 'Verified ✅'}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isCoach && !isAthlete && allAthletes.length > 0 && (
              <div className="flex items-center space-x-2 theme-input px-3 py-1.5 rounded-lg text-xs">
                <Users className="w-3.5 h-3.5 accent-text" />
                <select
                  value={selectedAthleteId || ''}
                  onChange={(e) => handleAthleteSelect(e.target.value)}
                  className="bg-transparent theme-text text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {allAthletes.map((ath) => (
                    <option key={ath.athlete_id} value={ath.athlete_id}>
                      {ath.user ? ath.user.name : `Athlete ${ath.athlete_id.slice(0, 8)}`} — {ath.sport}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Top Edit / Done Button for Header */}
            {!loading && (
              isCoach ? (
                !isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="accent-btn text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Coach Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelCoachEdit}
                    className="theme-card theme-muted hover:theme-text text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors border border-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                )
              ) : (
                canEditAthlete && (!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="accent-btn text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelAthleteEdit}
                    className="theme-card theme-muted hover:theme-text text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors border border-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                ))
              )
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

        {loading ? (
          <div className="py-12 text-center theme-muted text-xs">Loading profile details...</div>
        ) : isCoach && coachProfile ? (
          
          /* DEDICATED COACH PROFESSIONAL PROFILE VIEW & EDITOR (ALL 19 ATTRIBUTES ENHANCED UI) */
          <form onSubmit={handleSaveCoachProfile} className="space-y-6">
            
            {/* HERO CARD: Profile Photo, Name, ID, Designation & Badges */}
            <div className="p-6 rounded-2xl theme-card border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-purple-500/5 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 shadow-xl">
              <div className="relative group">
                {coachFormData.profile_image ? (
                  <img 
                    src={coachFormData.profile_image} 
                    alt={coachFormData.full_name}
                    className="w-28 h-28 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl" 
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                    {(coachFormData.full_name || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase shadow-lg">
                  {coachFormData.coaching_level || 'Elite'}
                </span>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h3 className="text-2xl font-extrabold theme-text font-display tracking-tight">
                    {coachFormData.full_name || 'Coach Profile'}
                  </h3>
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm flex items-center space-x-1">
                    <span>{coachFormData.verification_status || 'Verified ✅'}</span>
                  </span>
                </div>

                <p className="text-xs theme-muted font-medium">
                  <strong className="text-emerald-400 font-bold">{coachFormData.current_designation || 'Head Performance Coach'}</strong>
                  {coachFormData.club_academy && <span className="theme-text"> • {coachFormData.club_academy}</span>}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs theme-muted pt-1">
                  <span className="font-mono bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 font-bold text-emerald-400">
                    ID: {coachProfile.unique_coach_id}
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                    🏆 {coachFormData.years_coaching_experience || 10}+ Yrs Experience
                  </span>
                  <span className="bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-bold">
                    ⚽ {coachFormData.primary_sport || 'Soccer'}
                  </span>
                  {coachFormData.location && (
                    <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 font-bold">
                      📍 {coachFormData.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 1: Core Profile & Identity (1 to 6) */}
            <div className="p-5 rounded-xl theme-card space-y-4 border border-emerald-500/20">
              <h3 className="text-sm font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Core Profile & Identity Details</span>
              </h3>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Full Name</span>
                    <span className="text-sm font-extrabold theme-text">{coachFormData.full_name}</span>
                  </div>

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Coach ID</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-400">{coachProfile.unique_coach_id}</span>
                  </div>

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Qualification</span>
                    <span className="text-xs font-bold text-amber-400">{coachFormData.qualification || 'Not Specified'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-2">
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

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
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
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Full Name *</label>
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
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Qualification</label>
                      <input
                        type="text"
                        placeholder="e.g. M.Sc. Sports Science & Biomechanics, CSCS"
                        value={coachFormData.qualification}
                        onChange={(e) => setCoachFormData({ ...coachFormData, qualification: e.target.value })}
                        className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Coaching Specialization</label>
                      <input
                        type="text"
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

            {/* SECTION 2: Sport & Organization Assignment (7 to 10) */}
            <div className="p-5 rounded-xl theme-card space-y-4 border border-cyan-500/20">
              <h3 className="text-sm font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Sport & Team Assignment</span>
              </h3>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Primary Sport</span>
                    <span className="text-xs font-bold text-cyan-400">{coachFormData.primary_sport || 'Not Specified'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Team / Club / Academy</span>
                    <span className="text-xs font-semibold theme-text">{coachFormData.club_academy || 'Not Specified'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Coaching Level</span>
                    <span className="text-xs font-extrabold text-emerald-400">{coachFormData.coaching_level || 'Elite'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                    <span className="block text-[10px] font-bold uppercase theme-muted">Current Team / Position</span>
                    <span className="text-xs font-semibold theme-text">{coachFormData.current_designation || 'Not Specified'}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Primary Sport</label>
                    <input
                      type="text"
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
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold border transition-all ${
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
                    <label className="block text-[10px] font-bold uppercase theme-muted mb-1">Current Team / Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Head Performance & Fitness Coach"
                      value={coachFormData.current_designation}
                      onChange={(e) => setCoachFormData({ ...coachFormData, current_designation: e.target.value })}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Certifications, Experience & Achievements (11 to 14 & 19) */}
            <div className="p-5 rounded-xl theme-card space-y-4 border border-amber-500/20">
              <h3 className="text-sm font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Certifications, Experience & Achievements</span>
              </h3>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

                  <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

                  <div className="md:col-span-2 p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

            {/* SECTION 4: Location, Languages & Bio (15 to 18) */}
            <div className="p-5 rounded-xl theme-card space-y-4 border border-purple-500/20">
              <h3 className="text-sm font-bold theme-text flex items-center space-x-2 border-b border-white/10 pb-3 font-display">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Location, Languages & Bio</span>
              </h3>

              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Location</span>
                      <span className="text-xs font-extrabold text-purple-400">📍 {coachFormData.location || 'London, UK'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
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

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Verification Status</span>
                      <span className="text-xs font-extrabold text-emerald-400">{coachFormData.verification_status || 'Verified ✅'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl theme-card border border-white/5 space-y-1.5">
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

            {/* Coach Edit Save / Cancel Bar */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={cancelCoachEdit}
                  className="theme-card theme-muted hover:theme-text font-semibold text-xs py-2.5 px-5 rounded-xl border border-white/10 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={coachSaving}
                  className="accent-btn font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{coachSaving ? 'Saving Coach Profile...' : 'Save Coach Profile'}</span>
                </button>
              </div>
            )}

          </form>

        ) : (

          /* ATHLETE PROFILE VIEW FOR ATHLETES AND STAFF */
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Physical Attributes & Biomechanical Ratings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Sport & Demographics */}
              <div className="p-5 rounded-xl theme-card space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
                    <Activity className="w-4 h-4 accent-text" />
                    <span>Sport & Physical Demographics</span>
                  </h3>
                  {isEditing && (
                    <span className="text-[10px] px-2 py-0.5 rounded accent-badge font-semibold">
                      Editing Mode
                    </span>
                  )}
                </div>

                {!isEditing ? (
                  /* READ ONLY DETAILS VIEW */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Sport</span>
                      <span className="text-sm font-semibold theme-text">{formData.sport || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Position</span>
                      <span className="text-sm font-semibold theme-text">{formData.position || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Age (Years)</span>
                      <span className="text-sm font-semibold theme-text">{formData.age} yrs</span>
                    </div>

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Height (cm)</span>
                      <span className="text-sm font-semibold theme-text">{formData.height} cm</span>
                    </div>

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Weight (kg)</span>
                      <span className="text-sm font-semibold theme-text">{formData.weight} kg</span>
                    </div>

                    <div className="p-3.5 rounded-xl theme-card border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold uppercase theme-muted">Training Load (0-100)</span>
                      <span className="text-sm font-bold accent-text">{formData.training_load} / 100</span>
                    </div>
                  </div>
                ) : (
                  /* EDITABLE FORM INPUTS */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Sport *</label>
                      <input
                        type="text"
                        required
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        className="w-full theme-input rounded-lg px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Position *</label>
                      <input
                        type="text"
                        required
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full theme-input rounded-lg px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Age (Years) *</label>
                      <input
                        type="number"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                        className="w-full theme-input rounded-lg px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Height (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-lg px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Weight (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-lg px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">
                        Training Load (0-100) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.training_load}
                        onChange={(e) => setFormData({ ...formData, training_load: parseFloat(e.target.value) || 0 })}
                        className="w-full theme-input rounded-lg px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Biomechanical Ratings */}
              <div className="p-5 rounded-xl theme-card space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
                    <Heart className="w-4 h-4 accent-text" />
                    <span>Biomechanical Capability Ratings</span>
                  </h3>
                </div>

                {!isEditing ? (
                  /* READ ONLY RATINGS DISPLAY */
                  <div className="space-y-3.5">
                    {[
                      { label: 'Flexibility Score', field: 'flexibility' },
                      { label: 'Strength Index', field: 'strength' },
                      { label: 'Dynamic Balance Score', field: 'balance' },
                      { label: 'Muscular / Cardio Endurance', field: 'endurance' },
                    ].map((item) => (
                      <div key={item.field} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="theme-muted">{item.label}</span>
                          <span className="accent-text font-bold">{formData[item.field]} / 100</span>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="accent-badge h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, formData[item.field]))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* EDITABLE SLIDERS */
                  <div className="space-y-3">
                    {[
                      { label: 'Flexibility Score', field: 'flexibility' },
                      { label: 'Strength Index', field: 'strength' },
                      { label: 'Dynamic Balance Score', field: 'balance' },
                      { label: 'Muscular / Cardio Endurance', field: 'endurance' },
                    ].map((item) => (
                      <div key={item.field} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="theme-muted">{item.label}</span>
                          <span className="accent-text">{formData[item.field]} / 100</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={formData[item.field]}
                          onChange={(e) => setFormData({ ...formData, [item.field]: parseFloat(e.target.value) })}
                          className="w-full h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coach Assessment Notes */}
              <div className="p-5 rounded-xl theme-card space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
                    <FileText className="w-4 h-4 theme-muted" />
                    <span>Coach & Performance Notes</span>
                  </h3>
                </div>

                {!isEditing ? (
                  <div className="p-3.5 rounded-xl theme-card border border-white/5 text-xs theme-text min-h-[50px] leading-relaxed">
                    {formData.coach_notes ? (
                      formData.coach_notes
                    ) : (
                      <span className="theme-muted italic">No performance notes recorded yet.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows="3"
                    value={formData.coach_notes}
                    onChange={(e) => setFormData({ ...formData, coach_notes: e.target.value })}
                    placeholder="Observations on movement quality..."
                    className="w-full theme-input rounded-lg p-3 text-xs"
                  />
                )}

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={cancelAthleteEdit}
                      className="theme-card theme-muted hover:theme-text font-semibold text-xs py-2 px-4 rounded-lg border border-white/10 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="accent-btn font-extrabold text-xs py-2 px-5 rounded-lg flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Injury History Section */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl theme-card space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold theme-text flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Injury History</span>
                  </h3>
                  {isPhysio ? (
                    <button
                      type="button"
                      onClick={() => setShowInjuryModal(true)}
                      className="text-[10px] bg-rose-500/20 text-rose-300 font-semibold px-2.5 py-1 rounded border border-rose-500/30 flex items-center space-x-1 hover:bg-rose-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Record</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Physio Only Write</span>
                    </span>
                  )}
                </div>

                {injuries.length === 0 ? (
                  <div className="text-center py-6 theme-muted text-xs">
                    No injury records logged yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {injuries.map((inj) => (
                      <div key={inj.injury_id} className="p-3 theme-input rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold theme-text">{inj.injury_type}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                            {inj.severity}
                          </span>
                        </div>
                        <div className="theme-muted text-[11px]">
                          <strong>Body Part:</strong> {inj.body_part} ({inj.injury_date})
                        </div>
                        
                        {(isPhysio || isAthlete) && inj.remarks && (
                          <p className="text-[11px] theme-muted italic pt-1 border-t border-white/5">
                            "{inj.remarks}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
