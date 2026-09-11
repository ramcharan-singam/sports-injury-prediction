import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { HomePage } from './HomePage';
import { Activity, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff, Key, Search, UserCheck, X } from 'lucide-react';

export const ActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [inputLinkOrToken, setInputLinkOrToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation State
  const [validating, setValidating] = useState(false);
  const [validatedData, setValidatedData] = useState(null);
  const [validationError, setValidationError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) {
      validateLinkOrToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const extractToken = (str) => {
    let clean = (str || '').trim();
    if (clean.includes('token=')) {
      clean = clean.split('token=')[1].split('&')[0];
    }
    return clean;
  };

  const validateLinkOrToken = async (rawInput) => {
    const tokenToTest = extractToken(rawInput);
    if (!tokenToTest) {
      setValidationError('Please paste your activation link or token.');
      setValidatedData(null);
      return;
    }

    setValidating(true);
    setValidationError('');
    setValidatedData(null);

    try {
      const res = await api.get(`/api/auth/verify-token?token=${encodeURIComponent(tokenToTest)}`);
      setValidatedData(res.data);
    } catch (err) {
      setValidatedData(null);
      if (!err.response) {
        setValidationError('Cannot connect to backend server to validate link.');
      } else {
        setValidationError(err.response?.data?.detail || 'Invalid or Expired Activation Link — Access Denied.');
      }
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputLinkOrToken(val);
    setValidationError('');
    setValidatedData(null);
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const tokenToUse = validatedData?.extracted_token || extractToken(inputLinkOrToken);

    if (!tokenToUse) {
      setError('A valid activation link or token is required to proceed.');
      return;
    }

    if (!validatedData) {
      setError('Please validate your activation link before setting password. Access Denied.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/api/auth/activate', {
        token: tokenToUse,
        new_password: password
      });

      const activatedEmail = res.data?.email || validatedData.email;
      setSuccessMsg(res.data?.message || 'Account activated successfully!');

      if (activatedEmail) {
        try {
          await login(activatedEmail, password);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        } catch (loginErr) {
          console.warn("Auto-login post activation failed:", loginErr);
        }
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please verify FastAPI backend is online.');
      } else {
        setError(err.response?.data?.detail || 'Activation failed. Access Denied.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 1. Underlying Home Landing Page Design */}
      <HomePage />

      {/* 2. Centered Modal Backdrop for Account Activation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
        <div className="max-w-md w-full theme-card p-8 sm:p-10 space-y-6 shadow-2xl relative my-8 bg-white dark:bg-[#0d0d12] border border-[#EAE5DC] dark:border-white/10">
          
          {/* Close Button returning to Home Page */}
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 p-2 theme-muted hover:theme-text rounded-lg transition-colors cursor-pointer"
            title="Close to Home Page"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold theme-text font-display tracking-tight">Athlete Account Activation</h2>
            <p className="text-xs theme-muted">
              Enter your 6-digit Activation Code or paste your Coach link below to set your password.
            </p>
          </div>

          {/* Step 1: Paste Link / Token & Live Validation */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted">
              6-Digit Activation Code or Link *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputLinkOrToken}
                onChange={handleInputChange}
                placeholder="e.g. 482915 or paste full link..."
                className="w-full theme-input rounded-xl px-3 py-2.5 text-xs font-mono theme-text focus:outline-none"
              />
              <button
                type="button"
                onClick={() => validateLinkOrToken(inputLinkOrToken)}
                disabled={validating || !inputLinkOrToken.trim()}
                className="btn-golden font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1 shadow-md whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{validating ? 'Validating...' : 'Validate'}</span>
              </button>
            </div>

            {/* Validation Feedback Banners */}
            {validationError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-rose-500 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Access Denied:</strong>
                  <span>{validationError}</span>
                </div>
              </div>
            )}

            {validatedData && !validatedData.already_activated && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs space-y-1.5 shadow-md">
                <div className="flex items-center space-x-2 font-black text-emerald-400">
                  <UserCheck className="w-4.5 h-4.5" />
                  <span className="text-sm">Link Verified for: {validatedData.name}</span>
                </div>
                <p className="text-xs text-gray-200">
                  Email: <strong className="text-emerald-300 font-bold">{validatedData.email}</strong>
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold">✓ 48-Hour Activation Window Active — You may set your password below.</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-500 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {validatedData && validatedData.already_activated ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-semibold space-y-1.5">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                <h3 className="font-extrabold text-sm text-emerald-500">Account Already Activated!</h3>
                <p className="text-xs text-gray-200">
                  Password has already been set for <strong className="text-emerald-300">{validatedData.name}</strong> (<strong className="text-emerald-300">{validatedData.email}</strong>).
                </p>
                <span className="block text-[11px] theme-muted pt-1">
                  You can sign in directly using your existing credentials.
                </span>
              </div>
              <Link
                to="/login"
                className="w-full btn-golden text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : successMsg ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-semibold space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                <p>{successMsg}</p>
                <span className="block text-[11px] theme-muted pt-1">Logging into Athlete Portal...</span>
              </div>
              <Link
                to="/login"
                className="w-full btn-golden font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleActivateSubmit} className="space-y-4 pt-2 border-t border-[#EAE5DC] dark:border-white/10" autoComplete="off">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted">
                  Create New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 theme-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={!validatedData}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full theme-input rounded-xl pl-10 pr-10 py-2.5 text-xs theme-text focus:outline-none disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 theme-muted hover:theme-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 theme-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={!validatedData}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full theme-input rounded-xl pl-10 pr-10 py-2.5 text-xs theme-text focus:outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !validatedData}
                className="w-full mt-2 btn-golden text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 cursor-pointer"
              >
                <span>{submitting ? 'Setting Password...' : 'Create Password & Activate Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center text-xs theme-muted pt-2 border-t border-[#EAE5DC] dark:border-white/10">
            Already activated?{' '}
            <Link to="/login" className="text-amber-500 hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccountPage;
