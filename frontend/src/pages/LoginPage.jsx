import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HomePage } from './HomePage';
import { Activity, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Key, ShieldCheck, X } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure FastAPI server is running on port 8000.');
      } else if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your email and password.');
      } else if (err.response?.status === 403 && err.response?.data?.detail?.includes('activated')) {
        setError('Account not yet activated! Click "Activate Account via Coach Link" below to set your password.');
      } else {
        setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 1. Underlying Home Landing Page Design */}
      <HomePage />

      {/* 2. Centered High-Contrast Modal Backdrop for Sign In */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl shadow-2xl space-y-6 relative my-8 bg-[#121216] border border-white/15 text-white">
          
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
            <div className="w-12 h-12 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Activity className="w-6 h-6 text-[#F97316]" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight font-display">Sign In to InjurySense</h2>
            <p className="text-xs text-gray-300">
              Access athlete profiles, movement assessments & video motion analytics
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center space-x-2.5 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300">
                Email Address
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setError('Password reset instructions have been sent if account exists.')}
                  className="text-[11px] text-[#F97316] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A22] border border-white/20 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-600 text-[#F97316] focus:ring-0 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 accent-btn text-black font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 group disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Dedicated Athlete Activation Option Card */}
          <div className="p-4 rounded-xl bg-[#F97316]/15 border border-[#F97316]/40 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-white font-extrabold">
              <Key className="w-4 h-4 text-[#F97316] flex-shrink-0" />
              <span>Received an Activation Code from your Coach?</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              If your Coach created your Athlete account, activate your account & set your password here:
            </p>
            <Link
              to="/activate"
              className="inline-flex items-center space-x-1.5 accent-btn text-black text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Activate Account via Activation Code</span>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/10">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#F97316] hover:underline font-bold">
              Register Staff Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
