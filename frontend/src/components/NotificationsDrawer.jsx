import React from 'react';
import { Bell, CheckCircle2, AlertCircle, X, Check, Trash2, ArrowRight } from 'lucide-react';

export const NotificationsDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onMarkRead,
  onClearAll,
  onNotificationClick
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 theme-card shadow-2xl rounded-2xl border border-amber-500/30 z-50 space-y-3 bg-[#121216]/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="text-xs font-extrabold theme-text uppercase tracking-wider font-display">
            Notifications & Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 theme-muted hover:theme-text rounded-lg cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between text-[11px] px-1 pb-1">
          {unreadCount > 0 ? (
            <button
              onClick={onMarkAllRead}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          ) : (
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All notifications read</span>
            </span>
          )}

          <button
            onClick={onClearAll}
            className="theme-muted hover:text-rose-400 font-medium flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <Bell className="w-8 h-8 theme-muted mx-auto opacity-40" />
            <p className="text-xs theme-muted font-medium">No notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.is_read && !n.read;
            const notifId = n.notification_id || n.id;
            return (
              <div
                key={notifId}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(n);
                  if (onMarkRead && isUnread) onMarkRead(notifId);
                }}
                className={`p-3 rounded-xl space-y-1.5 text-xs transition-all border cursor-pointer ${
                  isUnread 
                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 shadow-md' 
                    : 'theme-input border-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-ping" />
                    )}
                    <span className="font-extrabold theme-text">{n.title}</span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-[9px] theme-muted font-mono">{formatTime(n.created_at || n.time)}</span>
                    {isUnread && onMarkRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notifId);
                        }}
                        className="p-0.5 text-amber-400 hover:text-emerald-400 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] theme-muted leading-relaxed pl-3.5">
                  {n.message || n.desc}
                </p>

                <div className="flex justify-end pt-1">
                  <span className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1">
                    <span>View Detail</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
