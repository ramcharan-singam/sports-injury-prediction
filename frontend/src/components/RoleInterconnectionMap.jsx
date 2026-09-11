import React, { useState } from 'react';
import { Shield, User, Dumbbell, Stethoscope, Microscope, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RoleInterconnectionMap = ({ currentRole }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole || 'Athlete');

  const roleNodes = [
    {
      id: 'Admin',
      name: 'ADMIN',
      title: 'Manages all users, system oversight',
      icon: Shield,
      color: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
      badgeBg: 'bg-purple-500',
      connections: [
        { target: 'Athlete', label: 'Account Management & Access' },
        { target: 'Coach', label: 'Account Management & Access' },
        { target: 'Physiotherapist', label: 'Account Management & Access' },
        { target: 'Sports Scientist', label: 'Account Management & Access' },
      ]
    },
    {
      id: 'Athlete',
      name: 'ATHLETE',
      title: 'Uploads videos, owns profile + injury history',
      icon: User,
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      badgeBg: 'bg-amber-500',
      connections: [
        { target: 'Coach', label: 'Visible in squad roster' },
        { target: 'Sports Scientist', label: 'Video + pose data feeds model review' },
        { target: 'Physiotherapist', label: 'Flagged if high/critical risk' },
      ]
    },
    {
      id: 'Coach',
      name: 'COACH',
      title: 'Monitors squad, adjusts training load',
      icon: Dumbbell,
      color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
      badgeBg: 'bg-blue-500',
      connections: [
        { target: 'Athlete', label: 'Training load & coach notes adjustments' },
      ]
    },
    {
      id: 'Physiotherapist',
      name: 'PHYSIOTHERAPIST',
      title: 'Manages injury history, assigns rehab protocols',
      icon: Stethoscope,
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
      badgeBg: 'bg-emerald-500',
      connections: [
        { target: 'Athlete', label: 'Rehab protocol & clearance assigned' },
      ]
    },
    {
      id: 'Sports Scientist',
      name: 'SPORTS SCIENTIST',
      title: 'Reviews model outputs, biomechanical benchmarks',
      icon: Microscope,
      color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
      badgeBg: 'bg-cyan-500',
      connections: [
        { target: 'Physiotherapist', label: 'Model confidence / feature insights inform care' },
      ]
    }
  ];

  const activeNode = roleNodes.find(r => r.id === selectedRole) || roleNodes[1];

  return (
    <div className="theme-card p-6 sm:p-8 rounded-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold theme-text flex items-center space-x-2 font-display">
            <span className="w-2.5 h-2.5 rounded-full accent-bg animate-ping" />
            <span>Role Interconnection & Workflow Map</span>
          </h3>
          <p className="text-xs theme-muted">
            Interactive multi-role workflow connections — select a role to inspect active data pathways
          </p>
        </div>

        {/* Role Selector Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {roleNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedRole(node.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === node.id
                  ? `${node.badgeBg} text-black font-bold shadow-md`
                  : 'theme-card theme-muted hover:theme-text'
              }`}
            >
              {node.name}
            </button>
          ))}
        </div>
      </div>

      {/* Role Interconnection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {roleNodes.map((node) => {
          const Icon = node.icon;
          const isSelected = node.id === selectedRole;
          const isConnected = activeNode.connections.some(c => c.target === node.id);

          return (
            <div
              key={node.id}
              onClick={() => setSelectedRole(node.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 relative ${
                isSelected
                  ? `${node.color} ring-2 ring-white/20 shadow-lg scale-105`
                  : isConnected
                  ? 'border-white/30 theme-card opacity-100'
                  : 'theme-card opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-black/20">
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white">
                    Active
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-extrabold tracking-wide font-display">{node.name}</h4>
                <p className="text-[10px] leading-tight opacity-80 mt-1">{node.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Role Connection Pathways Detail */}
      <div className="p-4 rounded-xl theme-input space-y-3">
        <h4 className="text-xs font-bold theme-text flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 accent-text" />
          <span>Active Workflows for {activeNode.name}:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {activeNode.connections.map((conn, idx) => (
            <div key={idx} className="p-3 theme-card rounded-lg flex items-center space-x-3 border border-white/5">
              <div className="p-1.5 rounded-lg accent-badge">
                <ArrowRight className="w-3.5 h-3.5 accent-text" />
              </div>
              <div>
                <span className="font-bold theme-text block">{conn.label}</span>
                <span className="text-[10px] theme-muted">Target: <strong className="accent-text">{conn.target}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
