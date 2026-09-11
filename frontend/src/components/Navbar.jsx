import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';
import { HelpSupportModal } from './HelpSupportModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { 
  Activity, User, Video, ShieldAlert, LogOut, LayoutDashboard, 
  Settings, ExternalLink, Users, FileText, Bell, HelpCircle, Info, ArrowRight 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showHoverMenu, setShowHoverMenu] = useState(false);

  // Dynamic Live Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/api/notifications').catch(() => ({ data: [] })),
        api.get('/api/notifications/unread-count').catch(() => ({ data: { unread_count: 0 } }))
      ]);
      setNotifications(notifsRes.data || []);
      setUnreadNotifCount(countRes.data?.unread_count ?? 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleClearAllNotifs = async () => {
    try {
      await api.delete('/api/notifications/clear-all');
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const handleNotificationClick = (notif) => {
    setIsNotifOpen(false);
    if (!notif) return;

    let tab = 'overview';
    const type = notif.notification_type || notif.type;
    const refId = notif.reference_id;

    if (type === 'PHYSIO_ASSESSMENT') tab = 'my_assessments';
    else if (type === 'OVERALL_INSIGHT') tab = 'physio_insights';
    else if (type === 'REHAB_PLAN') tab = 'rehab_plan';
    else if (type === 'RECOVERY_UPDATE') tab = 'recovery_progress';
    else if (type === 'FOLLOW_UP') tab = 'followup';

    const targetPath = refId
      ? `/athlete/dashboard?tab=${tab}&ref=${refId}`
      : `/athlete/dashboard?tab=${tab}`;

    navigate(targetPath);
  };

  const hoverTimeoutRef = useRef(null);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isProfilePage = location.pathname === '/athlete/profile' || location.pathname === '/profile';

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowHoverMenu(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverMenu(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowHoverMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 theme-header backdrop-blur-xl border-b border-[#EAE5DC] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo matching Template "Jane Doe" Bold Clean Header Style */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center transition-colors">
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xl font-extrabold tracking-tight theme-text font-display">
                InjurySense
              </span>
            </Link>

            {user ? (
              <>
                {/* Center Navigation Links matching Template Clean Top Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  <Link
                    to="/"
                    className={`text-xs font-semibold transition-all py-1 border-b-2 ${
                      isActive('/') 
                        ? 'border-amber-500 text-amber-500 font-bold' 
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    Dashboard
                  </Link>

                  {/* Athlete Role Specific Navigation */}
                  {user.role === 'Athlete' && (
                    <>
                      <Link
                        to="/upload"
                        className={`text-xs font-semibold transition-all py-1 border-b-2 ${
                          isActive('/upload') 
                            ? 'border-amber-500 text-amber-500 font-bold' 
                            : 'border-transparent theme-muted hover:theme-text'
                        }`}
                      >
                        Upload Video
                      </Link>

                      <Link
                        to="/athlete/analyses"
                        className={`text-xs font-semibold transition-all py-1 border-b-2 ${
                          isActive('/athlete/analyses') 
                            ? 'border-amber-500 text-amber-500 font-bold' 
                            : 'border-transparent theme-muted hover:theme-text'
                        }`}
                      >
                        My Analyses
                      </Link>

                      <Link
                        to="/athlete/profile"
                        className={`text-xs font-semibold transition-all py-1 border-b-2 ${
                          isActive('/athlete/profile') 
                            ? 'border-amber-500 text-amber-500 font-bold' 
                            : 'border-transparent theme-muted hover:theme-text'
                        }`}
                      >
                        My Profile
                      </Link>
                    </>
                  )}

                  {/* Staff Roles Specific Navigation */}
                  {(user.role === 'Coach' || user.role === 'Physiotherapist' || user.role === 'Sports Scientist') && (
                    <Link
                      to="/videos"
                      className={`text-xs font-semibold transition-all py-1 border-b-2 ${
                        isActive('/videos') 
                          ? 'border-amber-500 text-amber-500 font-bold' 
                          : 'border-transparent theme-muted hover:theme-text'
                      }`}
                    >
                      Squad Assessments
                    </Link>
                  )}

                  {/* Shared Reports Navigation */}
                  <Link
                    to="/reports"
                    className={`text-xs font-semibold transition-all py-1 border-b-2 ${
                      isActive('/reports') || location.pathname.startsWith('/reports')
                        ? 'border-amber-500 text-amber-500 font-bold' 
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    Reports
                  </Link>
                </nav>

                {/* Right Side Controls */}
                <div className="flex items-center space-x-3">
                  
                  {/* Notifications Icon Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors relative"
                      title={unreadNotifCount > 0 ? `${unreadNotifCount} unread notifications` : "Notifications & Alerts"}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-amber-500 text-black font-extrabold text-[10px] flex items-center justify-center shadow-md">
                          {unreadNotifCount}
                        </span>
                      )}
                    </button>

                    <NotificationsDrawer
                      isOpen={isNotifOpen}
                      onClose={() => setIsNotifOpen(false)}
                      notifications={notifications}
                      onMarkAllRead={handleMarkAllNotifsRead}
                      onMarkRead={handleMarkNotifRead}
                      onClearAll={handleClearAllNotifs}
                      onNotificationClick={handleNotificationClick}
                    />
                  </div>

                  {/* Help & Support Button */}
                  <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
                    title="Help & Support"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>

                  {/* Settings Gear Button */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
                    title="Settings & Preferences"
                  >
                    <Settings className="w-4 h-4 text-amber-500" />
                  </button>

                  {/* Profile Symbol Button with Hover Popover */}
                  <div className="relative" ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <button
                      onClick={() => {
                        if (!isProfilePage) {
                          setShowHoverMenu(false);
                          navigate('/athlete/profile');
                        }
                      }}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg theme-card transition-all cursor-pointer group"
                      title={isProfilePage ? `${user.name} (Current Page)` : `View ${user.name}'s Profile`}
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs uppercase group-hover:scale-105 transition-transform">
                        {user.name ? user.name[0] : 'U'}
                      </div>
                      <div className="text-left hidden sm:block">
                        <span className="block text-xs font-bold theme-text leading-tight">{user.name}</span>
                        <span className="block text-[10px] text-amber-500 font-semibold">{user.role}</span>
                      </div>
                    </button>

                    {/* Standard App Hover Popover Preview Menu */}
                    {showHoverMenu && (
                      <div className="absolute right-0 mt-2 w-60 p-4 theme-card shadow-2xl rounded-xl border z-50 space-y-3">
                        <div className="flex items-center space-x-3 border-b border-[#EAE5DC] dark:border-white/10 pb-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-sm uppercase">
                            {user.name ? user.name[0] : 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <span className="block text-xs font-bold theme-text truncate">{user.name}</span>
                            <span className="block text-[10px] theme-muted truncate">{user.email}</span>
                            <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">
                              {user.role}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {!isProfilePage && (
                            <button
                              onClick={() => {
                                setShowHoverMenu(false);
                                navigate('/athlete/profile');
                              }}
                              className="w-full btn-golden font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center space-x-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span>Open Profile</span>
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full theme-card hover:bg-rose-500/10 text-rose-500 font-semibold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 border border-rose-500/20 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold">
                  <Link
                    to="/"
                    onClick={() => {
                      if (location.pathname === '/') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`py-1 border-b-2 transition-all ${
                      location.pathname === '/' && (!location.hash || location.hash === '#home')
                        ? 'border-[#F97316] text-[#F97316] font-bold'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/#sports"
                    onClick={() => {
                      if (location.pathname === '/') {
                        const el = document.getElementById('sports');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`py-1 border-b-2 transition-all ${
                      location.hash === '#sports'
                        ? 'border-[#F97316] text-[#F97316] font-bold'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    Sports
                  </Link>
                  <Link
                    to="/#how-it-works"
                    onClick={() => {
                      if (location.pathname === '/') {
                        const el = document.getElementById('how-it-works');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`py-1 border-b-2 transition-all ${
                      location.hash === '#how-it-works'
                        ? 'border-[#F97316] text-[#F97316] font-bold'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    How it Works
                  </Link>
                  <Link
                    to="/#insights"
                    onClick={() => {
                      if (location.pathname === '/') {
                        const el = document.getElementById('insights');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`py-1 border-b-2 transition-all ${
                      location.hash === '#insights'
                        ? 'border-[#F97316] text-[#F97316] font-bold'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    Insights
                  </Link>
                  <Link
                    to="/#about"
                    onClick={() => {
                      if (location.pathname === '/') {
                        const el = document.getElementById('about');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`py-1 border-b-2 transition-all ${
                      location.hash === '#about'
                        ? 'border-[#F97316] text-[#F97316] font-bold'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    About
                  </Link>
                </nav>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-500" />
                  </button>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#111111] font-bold text-xs rounded-full transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs rounded-full transition-all shadow-md flex items-center space-x-1"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Full Page / Popup Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};
