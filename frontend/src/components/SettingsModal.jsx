import React, { useContext, useState } from 'react';
import { ThemeContext, ACCENT_COLORS } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { 
  Settings, Palette, Moon, Sun, Zap, Check, User, 
  Shield, Bell, Sliders, X
} from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, accent, setAccent } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('appearance');
  const [autoProcess, setAutoProcess] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);

  if (!isOpen) return null;

  const themes = [
    { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Obsidian dark theme' },
    { id: 'light', label: 'White Mode', icon: Sun, desc: 'Clean high-end light theme' },
    { id: 'high-contrast', label: 'High Contrast', icon: Zap, desc: 'Bold high accessibility' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-2xl w-full my-auto theme-card p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl accent-badge flex items-center justify-center">
              <Settings className="w-5 h-5 accent-text" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text font-display">Settings & Preferences</h2>
              <p className="text-xs theme-muted">
                {user ? 'Manage theme appearance, account details, and platform preferences' : 'Customize theme appearance and accent color preferences'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Navigation Tabs (Only show Account Details & Preferences if user is logged in) */}
        {user && (
          <div className="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'appearance' ? 'accent-badge font-bold' : 'theme-muted hover:theme-text'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme & Colors</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'account' ? 'accent-badge font-bold' : 'theme-muted hover:theme-text'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account Details</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'preferences' ? 'accent-badge font-bold' : 'theme-muted hover:theme-text'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
          </div>
        )}

        {/* Tab 1: Appearance & Theme */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 text-xs">
            {/* Theme Selector */}
            <div className="space-y-3">
              <span className="block font-bold uppercase tracking-wider theme-muted text-[10px]">
                Select Base Theme Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-4 rounded-xl border text-left space-y-2 transition-all ${
                        active
                          ? 'accent-badge font-bold shadow-md'
                          : 'theme-card hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-4 h-4" />
                        {active && <Check className="w-4 h-4 accent-text" />}
                      </div>
                      <div>
                        <span className="font-bold block theme-text">{t.label}</span>
                        <span className="text-[10px] theme-muted">{t.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adjustable Accent Colors */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="block font-bold uppercase tracking-wider theme-muted text-[10px]">
                Multi-Adjustable Accent Color
              </span>
              <div className="grid grid-cols-5 gap-3">
                {Object.keys(ACCENT_COLORS).map((key) => {
                  const col = ACCENT_COLORS[key];
                  const active = accent === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                        active ? 'accent-badge font-bold scale-105 shadow-md' : 'theme-card hover:border-white/20'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: col.hex }}
                        className="w-6 h-6 rounded-full flex items-center justify-center shadow"
                      >
                        {active && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                      </div>
                      <span className="text-[10px] font-semibold theme-text">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Account Details */}
        {activeTab === 'account' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl theme-card space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="theme-muted font-medium">Account Name:</span>
                <span className="font-bold theme-text">{user?.name}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="theme-muted font-medium">Email Address:</span>
                <span className="font-bold theme-text">{user?.email}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="theme-muted font-medium">Platform Role:</span>
                <span className="font-bold accent-text">{user?.role}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="theme-muted font-medium">Phone Number:</span>
                <span className="font-bold theme-text">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl theme-card flex items-center justify-between">
              <div>
                <span className="font-bold block theme-text">Auto-Process Uploaded Videos</span>
                <span className="text-[10px] theme-muted">Trigger video analysis stub immediately post-upload</span>
              </div>
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl theme-card flex items-center justify-between">
              <div>
                <span className="font-bold block theme-text">High-Risk Movement Notifications</span>
                <span className="text-[10px] theme-muted">Receive alerts on severe movement asymmetry</span>
              </div>
              <input
                type="checkbox"
                checked={riskAlerts}
                onChange={(e) => setRiskAlerts(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="accent-btn font-semibold text-xs py-2 px-5 rounded-lg shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
