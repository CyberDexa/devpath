// ═══════════════════════════════════════
// DevPath — Notification Panel
// Real-time notifications dropdown with
// badge awards, level ups, follows,
// battle invites, and more
// ═══════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trophy,
  TrendingUp,
  UserPlus,
  Swords,
  Flame,
  Star,
  CheckCheck,
  X,
  Loader2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

interface NotificationPanelProps {
  userId?: string;
}

// ═══════════════════════════════════════
// Notification type config
// ═══════════════════════════════════════

const NOTIF_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  badge_earned: { icon: Trophy, color: 'text-amber', bg: 'bg-amber/10' },
  level_up: { icon: TrendingUp, color: 'text-teal', bg: 'bg-teal/10' },
  new_follower: { icon: UserPlus, color: 'text-violet', bg: 'bg-violet/10' },
  battle_invite: { icon: Swords, color: 'text-rose', bg: 'bg-rose/10' },
  battle_result: { icon: Swords, color: 'text-amber', bg: 'bg-amber/10' },
  streak_milestone: { icon: Flame, color: 'text-orange', bg: 'bg-orange/10' },
  challenge_reminder: { icon: Star, color: 'text-sky', bg: 'bg-sky/10' },
  achievement: { icon: Sparkles, color: 'text-amber', bg: 'bg-amber/10' },
  title_change: { icon: Star, color: 'text-violet', bg: 'bg-violet/10' },
  system: { icon: MessageSquare, color: 'text-dim', bg: 'bg-white/5' },
};

// ═══════════════════════════════════════
// Sample notifications (fallback)
// ═══════════════════════════════════════

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1', user_id: 'u1', type: 'badge_earned',
    title: 'Badge Earned!', message: 'You unlocked "First Steps" badge',
    data: { badge_name: 'First Steps' }, read: false,
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: '2', user_id: 'u1', type: 'level_up',
    title: 'Level Up!', message: 'You reached Level 5 — Apprentice Developer',
    data: { level: 5, title: 'Apprentice Developer' }, read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3', user_id: 'u1', type: 'streak_milestone',
    title: 'Streak Milestone!', message: '7-day streak! +50 bonus XP',
    data: { streak: 7, bonus_xp: 50 }, read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4', user_id: 'u1', type: 'new_follower',
    title: 'New Follower', message: 'Alex Chen started following you',
    data: { follower_name: 'Alex Chen' }, read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ═══════════════════════════════════════
// Time ago utility
// ═══════════════════════════════════════

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function NotificationPanel({ userId }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications(SAMPLE_NOTIFICATIONS);
      setUnreadCount(SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length);
      return;
    }
    setLoading(true);
    try {
      const { getNotifications, getUnreadCount } = await import('../../lib/gamification');
      const [notifs, count] = await Promise.all([
        getNotifications(userId, 20),
        getUnreadCount(userId),
      ]);
      setNotifications(notifs as Notification[]);
      setUnreadCount(count);
    } catch {
      setNotifications(SAMPLE_NOTIFICATIONS);
      setUnreadCount(SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    // Poll every 30s
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      const { markNotificationsRead } = await import('../../lib/gamification');
      if (userId) await markNotificationsRead(userId);
    } catch { /* offline */ }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-dim" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal text-abyss text-[9px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold text-text">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-teal hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={10} />
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-muted hover:text-dim">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="overflow-y-auto max-h-[320px]">
                {loading && notifications.length === 0 ? (
                  <div className="p-6 text-center text-dim">
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto text-muted mb-2" />
                    <p className="text-xs text-dim">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif, i) => {
                    const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex gap-3 px-4 py-3 border-b border-white/3 transition-colors ${
                          notif.read ? 'opacity-60' : 'bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={14} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text truncate">{notif.title}</p>
                          <p className="text-[10px] text-dim mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[9px] text-muted mt-1">{timeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-teal mt-1 flex-shrink-0" />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
