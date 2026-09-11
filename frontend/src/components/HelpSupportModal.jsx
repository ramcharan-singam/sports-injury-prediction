import React, { useState } from 'react';
import { HelpCircle, X, BookOpen, MessageSquare, Shield, Mail, CheckCircle2, ChevronRight } from 'lucide-react';

export const HelpSupportModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('faq');

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does Video Quality Assessment work?',
      a: 'The platform uses OpenCV to decode uploaded movement video clips, checking resolution (1080p target), framerate (30 FPS target), duration, and readability score.'
    },
    {
      q: 'What formats and file sizes are supported for video upload?',
      a: 'Supported formats include MP4, MOV, AVI, and WEBM, up to a maximum file size limit of 100 MB.'
    },
    {
      q: 'How are user role permissions enforced?',
      a: 'Permissions are strictly enforced on the FastAPI backend using JWT claims. Coach can only modify training_load and coach_notes. Physiotherapist owns injury history CRUD. Sports Scientist has read-only analytics access. Admin manages user accounts.'
    },
    {
      q: 'How do I export or print an Analysis Report?',
      a: 'Navigate to the Reports page or click "View / Export Analysis Report" on any completed video results page, then click the "Print / Export PDF Report" button.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-3xl w-full my-auto theme-card p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl accent-badge flex items-center justify-center">
              <HelpCircle className="w-5 h-5 accent-text" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text font-display">KINEMA AI Help & Support Center</h2>
              <p className="text-xs theme-muted">User documentation, role workflow guides, and platform support</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-2 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'faq' ? 'border-amber-400 accent-text' : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-2 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'workflows' ? 'border-amber-400 accent-text' : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            Role Workflow Reference
          </button>
        </div>

        {/* FAQ Tab Content */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 theme-input rounded-xl space-y-1.5 text-xs">
                <h4 className="font-bold theme-text flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="theme-muted text-[11px] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Role Workflow Reference Tab Content */}
        {activeTab === 'workflows' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 theme-card rounded-xl space-y-1 border border-amber-500/20">
              <span className="font-bold text-amber-400 block">🏃 Athlete Workflow</span>
              <p className="theme-muted text-[11px]">Register $\rightarrow$ Complete Profile $\rightarrow$ Upload Video $\rightarrow$ Quality & Biomechanics Review $\rightarrow$ Export Report.</p>
            </div>
            <div className="p-3.5 theme-card rounded-xl space-y-1 border border-blue-500/20">
              <span className="font-bold text-blue-400 block">🧢 Coach Workflow</span>
              <p className="theme-muted text-[11px]">View Squad Roster $\rightarrow$ Compare Athletes $\rightarrow$ Adjust Training Load & Notes $\rightarrow$ Review Team Analytics.</p>
            </div>
            <div className="p-3.5 theme-card rounded-xl space-y-1 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block">🩺 Physiotherapist Workflow</span>
              <p className="theme-muted text-[11px]">View Squad Roster $\rightarrow$ Full Injury History CRUD $\rightarrow$ Assign Rehab Remarks $\rightarrow$ Track Recovery Clearance.</p>
            </div>
            <div className="p-3.5 theme-card rounded-xl space-y-1 border border-cyan-500/20">
              <span className="font-bold text-cyan-400 block">🔬 Sports Scientist Workflow</span>
              <p className="theme-muted text-[11px]">Research Dashboard $\rightarrow$ Squad Flexibility/Strength Benchmarks $\rightarrow$ Pose Landmark Quality Review.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
