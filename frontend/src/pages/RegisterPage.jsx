import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HomePage } from './HomePage';
import { User, Mail, Lock, Phone, Award, ArrowRight, AlertCircle, Sparkles, CheckCircle2, Shield, X } from 'lucide-react';

const ROLES = [
  { value: 'Coach', label: 'Coach / Performance Trainer', desc: 'Owns & manages athlete profiles, training loads & access permissions' },
  { value: 'Physiotherapist', label: 'Physiotherapist / Medical Specialist', desc: 'Logs injury records & monitors rehabilitation progress' },
  { value: 'Sports Scientist', label: 'Sports Scientist / Biomechanist', desc: 'Analyzes squad motion statistics & biomechanical trends' },
  { value: 'Admin', label: 'Platform Administrator', desc: 'Full platform management & system overrides' }
];

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Coach');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, register, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
  }, []);

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword || !role) {
      setError('Please fill in all required fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (user) {
        logout();
      }

      await register(name.trim(), email.trim(), password, role, phone.trim());
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure FastAPI server is online.');
      } else if (err.response?.status === 409 || err.response?.data?.detail?.includes('exists')) {
        setError('An account with this email address already exists. Please sign in or use a different email.');
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please check your information.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 1. Underlying Home Landing Page Design */}
      <HomePage />

      {/* 2. Centered High-Contrast Modal Backdrop for Register */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div className="max-w-xl w-full p-8 sm:p-10 space-y-6 shadow-2xl rounded-2xl border relative my-8 bg-[#121216] border-white/15 text-white">
          
          {/* Close Button returning to Home Page */}
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close to Home Page"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2 pt-2">
            <div className="inline-flex p-3 bg-[#F97316]/15 rounded-2xl border border-[#F97316]/30 mb-1">
              <Sparkles className="w-6 h-6 text-[#F97316]" />
            </div>
            <h2 className="text-3xl font-black text-white font-display tracking-tight">Create Staff Account</h2>
            <p className="text-xs text-gray-300">
              Register your Coach, Physiotherapist, Sports Scientist, or Admin account on InjurySense
            </p>
          </div>

          {/* Notice Banner for Athlete Accounts */}
          <div className="p-3.5 bg-[#F97316]/15 border border-[#F97316]/40 rounded-xl text-xs flex items-start space-x-2.5">
            <Shield className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-white text-xs">Athlete Account Notice:</strong>
              <span className="text-gray-300 text-[11px] leading-relaxed block pt-0.5">
                Athletes cannot self-register here. Athletes are registered directly by their Coach and activated via a 6-digit activation code.
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center space-x-3 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            
            {/* Role Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300">
                Select Platform Role *
              </label>
              <div className="relative">
                <Award className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#1A1A22] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#F97316] cursor-pointer font-semibold"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-[#121216] text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] text-gray-400 italic block pt-0.5">
                {ROLES.find(r => r.value === role)?.desc}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-[#1A1A22] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  className="w-full bg-[#1A1A22] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1A1A22] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1A1A22] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-gray-600 text-[#F97316] focus:ring-0 cursor-pointer"
                />
                <span>Show password</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 accent-btn text-black font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 group disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Creating Staff Account...' : `Register as ${role}`}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/10">
            Already registered?{' '}
            <Link to="/login" className="text-[#F97316] hover:underline font-bold">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
