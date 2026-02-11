import { useState, useEffect } from 'react';
import {
  Bell, Mail, Flame, Trophy, CreditCard, Users, Briefcase, Award,
  Clock, Sparkles, Save, Check, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { updateEmailPreferences, getUserEmailHistory, type EmailType } from '../../lib/analytics';

interface EmailPreferences {
  weekly_digest: boolean;
  streak_reminders: boolean;
  achievement_notifications: boolean;
  subscription_updates: boolean;
  new_followers: boolean;
  battle_challenges: boolean;
  job_matches: boolean;
  certificate_updates: boolean;
  product_updates: boolean;
  tips_and_tutorials: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  weekly_digest: true,
  streak_reminders: true,
  achievement_notifications: true,
  subscription_updates: true,
  new_followers: true,
  battle_challenges: true,
  job_matches: true,
  certificate_updates: true,
  product_updates: false,
  tips_and_tutorials: false,
};

interface NotificationCategory {
  title: string;
  description: string;
  icon: typeof Bell;
  color: string;
  items: { key: keyof EmailPreferences; label: string; description: string }[];
}

const CATEGORIES: NotificationCategory[] = [
  {
    title: 'Learning',
    description: 'Stay on track with your learning goals',
    icon: Sparkles,
    color: 'text-[var(--color-accent-teal)]',
    items: [
      { key: 'weekly_digest', label: 'Weekly Digest', description: 'Summary of your weekly learning progress, XP earned, and recommendations' },
      { key: 'streak_reminders', label: 'Streak Reminders', description: 'Get notified when your streak is about to break' },
      { key: 'tips_and_tutorials', label: 'Tips & Tutorials', description: 'Curated learning tips and new tutorial announcements' },
    ],
  },
  {
    title: 'Achievements',
    description: 'Celebrate your milestones',
    icon: Trophy,
    color: 'text-amber-400',
    items: [
      { key: 'achievement_notifications', label: 'Badge Unlocks', description: 'Get notified when you earn new badges and achievements' },
      { key: 'certificate_updates', label: 'Certificates', description: 'Notifications about certificate issuance and verification status' },
    ],
  },
  {
    title: 'Social',
    description: 'Stay connected with the community',
    icon: Users,
    color: 'text-sky-400',
    items: [
      { key: 'new_followers', label: 'New Followers', description: 'Someone started following your profile' },
      { key: 'battle_challenges', label: 'Battle Challenges', description: 'Notifications when someone challenges you to a code battle' },
    ],
  },
  {
    title: 'Career',
    description: 'Job opportunities and career updates',
    icon: Briefcase,
    color: 'text-violet-400',
    items: [
      { key: 'job_matches', label: 'Job Matches', description: 'New job listings matching your skills and preferences' },
    ],
  },
  {
    title: 'Billing',
    description: 'Subscription and payment notifications',
    icon: CreditCard,
    color: 'text-emerald-400',
    items: [
      { key: 'subscription_updates', label: 'Subscription Updates', description: 'Payment receipts, renewal reminders, and plan changes' },
    ],
  },
  {
    title: 'Marketing',
    description: 'Product news and announcements',
    icon: Mail,
    color: 'text-rose-400',
    items: [
      { key: 'product_updates', label: 'Product Updates', description: 'New features, platform updates, and SkillRoute news' },
    ],
  },
];

interface EmailHistoryItem {
  id: string;
  email_type: EmailType;
  subject: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<'preferences' | 'history'>('preferences');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // Load preferences from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_preferences')
        .eq('id', user.id)
        .single();

      if (profile?.email_preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...(profile.email_preferences as Partial<EmailPreferences>) });
      }

      // Load email history
      const history = await getUserEmailHistory(user.id);
      setEmailHistory(history as unknown as EmailHistoryItem[]);
      setLoading(false);
    })();
  }, []);

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    await updateEmailPreferences(userId, preferences);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEnableAll = () => {
    const all: EmailPreferences = { ...preferences };
    (Object.keys(all) as (keyof EmailPreferences)[]).forEach(k => all[k] = true);
    setPreferences(all);
    setSaved(false);
  };

  const handleDisableAll = () => {
    const all: EmailPreferences = { ...preferences };
    (Object.keys(all) as (keyof EmailPreferences)[]).forEach(k => all[k] = false);
    // Keep subscription updates on (required)
    all.subscription_updates = true;
    setPreferences(all);
    setSaved(false);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const statusColor = (status: string): string => {
    switch (status) {
      case 'delivered': case 'sent': return 'bg-emerald-500/10 text-emerald-400';
      case 'queued': return 'bg-amber-500/10 text-amber-400';
      case 'bounced': case 'failed': return 'bg-rose-500/10 text-rose-400';
      default: return 'bg-white/[0.06] text-[var(--color-dim)]';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--color-surface)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--color-bright)]">
            Email Notifications
          </h2>
          <p className="text-sm text-[var(--color-dim)] mt-1">
            Choose which emails you'd like to receive
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-white/[0.06]">
          {(['preferences', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-white/[0.08] text-[var(--color-bright)]'
                  : 'text-[var(--color-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              {t === 'preferences' ? 'Preferences' : 'Email History'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'preferences' && (
        <>
          {/* Bulk actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleEnableAll}
              className="text-xs text-[var(--color-accent-teal)] hover:underline"
            >
              Enable all
            </button>
            <span className="text-[var(--color-charcoal)]">|</span>
            <button
              onClick={handleDisableAll}
              className="text-xs text-[var(--color-dim)] hover:text-[var(--color-text)]"
            >
              Disable all (except required)
            </button>
          </div>

          {/* Notification Categories */}
          <div className="space-y-6">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className="rounded-2xl border border-white/[0.06] bg-[var(--color-surface)] overflow-hidden"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.04]">
                    <div className={`w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-[var(--color-bright)]">
                        {category.title}
                      </h3>
                      <p className="text-xs text-[var(--color-dim)]">{category.description}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-white/[0.04]">
                    {category.items.map(item => {
                      const isRequired = item.key === 'subscription_updates';
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex-1 mr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[var(--color-text)]">
                                {item.label}
                              </span>
                              {isRequired && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-[var(--color-dim)]">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--color-dim)] mt-0.5">{item.description}</p>
                          </div>

                          {/* Toggle switch */}
                          <button
                            onClick={() => !isRequired && handleToggle(item.key)}
                            disabled={isRequired}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                              preferences[item.key]
                                ? 'bg-[var(--color-accent-teal)]'
                                : 'bg-[var(--color-charcoal)]'
                            } ${isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                                preferences[item.key] ? 'translate-x-5' : ''
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[var(--color-accent-teal)] text-[var(--color-void)] hover:brightness-110 shadow-[0_0_20px_-5px_rgba(0,229,160,0.3)]'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {emailHistory.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-[var(--color-surface)]">
              <Mail className="w-12 h-12 text-[var(--color-dim)] mx-auto mb-4 opacity-40" />
              <p className="text-[var(--color-dim)] text-sm">No emails sent yet</p>
              <p className="text-[var(--color-dim)] text-xs mt-1">
                Your email notification history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map(email => (
                <div
                  key={email.id}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.06] bg-[var(--color-surface)] hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[var(--color-dim)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {email.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--color-dim)]">
                          {email.email_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[var(--color-charcoal)]">&middot;</span>
                        <span className="text-xs text-[var(--color-dim)]">
                          {formatDate(email.sent_at || email.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColor(email.status)}`}>
                    {email.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
