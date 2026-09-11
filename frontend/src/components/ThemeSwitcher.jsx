import React, { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext, ACCENT_COLORS } from '../context/ThemeContext';
import { Palette, Moon, Sun, Zap, Check } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, setTheme, accent, setAccent } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'White', icon: Sun },
    { id: 'high-contrast', label: 'High Contrast', icon: Zap },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors flex items-center space-x-1"
        title="Adjust Theme & Accent Color"
      >
        <Palette className="w-4 h-4 accent-text" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 p-4 rounded-xl theme-card shadow-2xl z-50 space-y-4 border theme-header">
          {/* Theme Selector */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider theme-muted">
              Select Theme
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {themes.map((t) => {
                const Icon = t.icon;
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      active
                        ? 'accent-badge font-bold shadow-sm'
                        : 'theme-muted hover:theme-text hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Selector */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="block text-[10px] font-bold uppercase tracking-wider theme-muted">
              Adjustable Accent Color
            </span>
            <div className="flex items-center justify-between">
              {Object.keys(ACCENT_COLORS).map((key) => {
                const col = ACCENT_COLORS[key];
                const active = accent === key;
                return (
                  <button
                    key={key}
                    onClick={() => setAccent(key)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                      active ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={col.name}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
