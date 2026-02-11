import { useState, useEffect } from 'react';
import {
  Users, DollarSign, TrendingUp, Activity, Shield, Settings, BarChart3,
  Search, ChevronDown, ChevronRight, Eye, Ban, RefreshCw, FileText, Flag, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  isAdmin, getPlatformOverview, getRevenueMetrics, getAllUsers,
  getTopPages, getEventBreakdown, getAuditLog, logAdminAction,
  type PlatformOverview
} from '../../lib/analytics';

type AdminTab = 'overview' | 'users' | 'revenue' | 'content' | 'flags' | 'audit';

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [revenue, setRevenue] = useState<{ mrr: number; totalRevenue: number; activeSubscriptions: number; churnRate: number } | null>(null);
  const [users, setUsers] = useState<{ users: Record<string, unknown>[]; total: number }>({ users: [], total: 0 });
  const [topPages, setTopPages] = useState<{ path: string; views: number; unique_users: number }[]>([]);
  const [events, setEvents] = useState<{ event_name: string; count: number; category: string }[]>([]);
  const [auditLog, setAuditLog] = useState<Record<string, unknown>[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, unknown>[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const admin = await isAdmin(user.id);
        setAuthorized(admin);
        if (admin) await loadData();
      }
      setLoading(false);
    })();
  }, []);

  async function loadData() {
    const [ov, rev, uList, tp, ev, al, ff] = await Promise.all([
      getPlatformOverview(),
      getRevenueMetrics(),
      getAllUsers(1, 50),
      getTopPages(7, 15),
      getEventBreakdown(7),
      getAuditLog(50),
      supabase.from('feature_flags').select('*').then(r => r.data || []),
    ]);
    setOverview(ov);
    setRevenue(rev);
    setUsers(uList);
    setTopPages(tp);
    setEvents(ev);
    setAuditLog(al);
    setFeatureFlags(ff);
  }

  async function searchUsers(query: string, page: number) {
    const result = await getAllUsers(page, 50, query || undefined);
    setUsers(result);
  }

  async function toggleFeatureFlag(flagId: string, currentEnabled: boolean) {
    await supabase.from('feature_flags').update({ enabled: !currentEnabled }).eq('id', flagId);
    const { data } = await supabase.from('feature_flags').select('*');
    setFeatureFlags(data || []);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="h-64 rounded-xl bg-[var(--color-surface)] border border-white/5 animate-pulse" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <Shield className="w-16 h-16 text-[var(--color-rose)] mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-[var(--color-bright)] mb-2">Access Denied</h2>
        <p className="text-[var(--color-dim)]">You need admin privileges to view this dashboard.</p>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'content', label: 'Content', icon: Activity },
    { id: 'flags', label: 'Feature Flags', icon: Flag },
    { id: 'audit', label: 'Audit Log', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-rose)]/10 border border-[var(--color-rose)]/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[var(--color-rose)]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--color-bright)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--color-dim)]">Platform management & analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[var(--color-surface)] rounded-lg p-1 border border-white/5 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-[var(--color-raised)] text-[var(--color-bright)]' : 'text-[var(--color-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && overview && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: overview.totalUsers.toLocaleString(), icon: Users, color: 'teal' },
              { label: 'Active Today', value: overview.activeToday.toLocaleString(), icon: Activity, color: 'sky' },
              { label: 'Pro Subscribers', value: overview.proSubscribers.toLocaleString(), icon: TrendingUp, color: 'violet' },
              { label: 'Teams', value: overview.teamsSubscribers.toLocaleString(), icon: Users, color: 'amber' },
              { label: 'Monthly Revenue', value: `$${(overview.monthlyRevenue / 100).toFixed(2)}`, icon: DollarSign, color: 'teal' },
              { label: 'Projects Submitted', value: overview.totalProjects.toLocaleString(), icon: BarChart3, color: 'sky' },
              { label: 'Badges Earned', value: overview.totalBadgesEarned.toLocaleString(), icon: Shield, color: 'amber' },
              { label: 'Avg Session', value: `${overview.avgSessionMinutes}m`, icon: Clock, color: 'violet' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 text-[var(--color-${stat.color})]`} />
                  </div>
                  <p className="font-display font-bold text-xl text-[var(--color-bright)]">{stat.value}</p>
                  <p className="text-xs text-[var(--color-dim)]">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Top Pages & Events side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
              <h3 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Top Pages (7d)</h3>
              <div className="space-y-2">
                {topPages.slice(0, 10).map((p) => (
                  <div key={p.path} className="flex items-center justify-between py-2 border-b border-white/3 last:border-0">
                    <span className="text-sm text-[var(--color-text)] font-mono truncate max-w-[60%]">{p.path}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--color-dim)]">{p.unique_users} users</span>
                      <span className="text-xs font-mono text-[var(--color-teal)]">{p.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
              <h3 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Event Breakdown (7d)</h3>
              <div className="space-y-2">
                {events.slice(0, 10).map((e) => (
                  <div key={e.event_name} className="flex items-center justify-between py-2 border-b border-white/3 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-abyss)] text-[var(--color-dim)]">{e.category}</span>
                      <span className="text-sm text-[var(--color-text)]">{e.event_name}</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-teal)]">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-dim)]" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers(userSearch, 1)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-white/8 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-teal)]/30"
              />
            </div>
            <button
              onClick={() => searchUsers(userSearch, 1)}
              className="px-4 py-2.5 rounded-lg bg-[var(--color-teal)] text-[var(--color-void)] text-sm font-semibold hover:brightness-110 transition-all"
            >
              Search
            </button>
            <span className="text-sm text-[var(--color-dim)]">{users.total} total users</span>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-[var(--color-dim)] font-medium">User</th>
                  <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">Level</th>
                  <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">XP</th>
                  <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">Plan</th>
                  <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">Joined</th>
                  <th className="text-right py-3 px-4 text-[var(--color-dim)] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.users.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-teal)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-teal)]">
                          {(u.display_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[var(--color-text)] font-medium">{u.display_name || u.username}</p>
                          <p className="text-[var(--color-dim)] text-xs">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-[var(--color-text)]">{u.level || 1}</td>
                    <td className="text-center py-3 px-4 font-mono text-[var(--color-teal)]">{(u.xp || 0).toLocaleString()}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.plan === 'pro' ? 'bg-[var(--color-teal)]/15 text-[var(--color-teal)]' :
                        u.plan === 'teams' ? 'bg-[var(--color-violet)]/15 text-[var(--color-violet)]' :
                        'bg-white/5 text-[var(--color-dim)]'
                      }`}>{(u.plan || 'free').toUpperCase()}</span>
                    </td>
                    <td className="text-center py-3 px-4 text-[var(--color-dim)] text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-md hover:bg-white/5 text-[var(--color-dim)] hover:text-[var(--color-text)] transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => { setUserPage(Math.max(1, userPage - 1)); searchUsers(userSearch, Math.max(1, userPage - 1)); }}
              disabled={userPage === 1}
              className="px-3 py-1.5 rounded-md bg-[var(--color-surface)] text-sm text-[var(--color-dim)] disabled:opacity-50 hover:text-[var(--color-text)] transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--color-dim)]">Page {userPage}</span>
            <button
              onClick={() => { setUserPage(userPage + 1); searchUsers(userSearch, userPage + 1); }}
              disabled={users.users.length < 50}
              className="px-3 py-1.5 rounded-md bg-[var(--color-surface)] text-sm text-[var(--color-dim)] disabled:opacity-50 hover:text-[var(--color-text)] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {tab === 'revenue' && revenue && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'MRR', value: `$${(revenue.mrr / 100).toFixed(0)}`, color: 'teal' },
              { label: 'Total Revenue', value: `$${(revenue.totalRevenue / 100).toFixed(0)}`, color: 'sky' },
              { label: 'Active Subs', value: revenue.activeSubscriptions.toString(), color: 'violet' },
              { label: 'Churn Rate', value: `${revenue.churnRate}%`, color: revenue.churnRate > 5 ? 'rose' : 'teal' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
                <p className="text-xs text-[var(--color-dim)] mb-2">{s.label}</p>
                <p className={`font-display font-bold text-3xl text-[var(--color-${s.color})]`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
            <h3 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Plan Distribution</h3>
            <div className="flex items-center gap-4">
              {[
                { plan: 'Free', pct: overview ? Math.max(0, overview.totalUsers - overview.proSubscribers - overview.teamsSubscribers) : 0, color: 'var(--color-dim)' },
                { plan: 'Pro', pct: overview?.proSubscribers || 0, color: 'var(--color-teal)' },
                { plan: 'Teams', pct: overview?.teamsSubscribers || 0, color: 'var(--color-violet)' },
              ].map((p) => (
                <div key={p.plan} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-[var(--color-text)]">{p.plan}: <strong>{p.pct}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
            <h3 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Top Pages (7d)</h3>
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3 py-2 border-b border-white/3 last:border-0">
                  <span className="text-xs font-mono text-[var(--color-muted)] w-5">{i + 1}</span>
                  <span className="text-sm text-[var(--color-text)] flex-1 truncate">{p.path}</span>
                  <span className="text-xs text-[var(--color-dim)]">{p.unique_users}u</span>
                  <span className="text-xs font-mono text-[var(--color-teal)]">{p.views}v</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
            <h3 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Events (7d)</h3>
            <div className="space-y-2">
              {events.map((e, i) => (
                <div key={e.event_name} className="flex items-center gap-3 py-2 border-b border-white/3 last:border-0">
                  <span className="text-xs font-mono text-[var(--color-muted)] w-5">{i + 1}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-abyss)] text-[var(--color-dim)]">{e.category}</span>
                  <span className="text-sm text-[var(--color-text)] flex-1 truncate">{e.event_name}</span>
                  <span className="text-xs font-mono text-[var(--color-teal)]">{e.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'flags' && (
        <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-[var(--color-dim)] font-medium">Flag</th>
                <th className="text-left py-3 px-4 text-[var(--color-dim)] font-medium">Description</th>
                <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">Rollout</th>
                <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">Plans</th>
                <th className="text-center py-3 px-4 text-[var(--color-dim)] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {featureFlags.map((f: any) => (
                <tr key={f.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4 font-mono text-[var(--color-text)]">{f.name}</td>
                  <td className="py-3 px-4 text-[var(--color-dim)] text-xs max-w-[200px] truncate">{f.description}</td>
                  <td className="text-center py-3 px-4 text-[var(--color-text)]">{f.rollout_percentage}%</td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {(f.allowed_plans || []).map((p: string) => (
                        <span key={p} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-[var(--color-dim)]">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => toggleFeatureFlag(f.id, f.enabled)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${f.enabled ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-muted)]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${f.enabled ? 'left-5.5 translate-x-0' : 'left-0.5'}`} style={{ left: f.enabled ? '22px' : '2px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-6">
          <h3 className="font-display font-bold text-lg text-[var(--color-bright)] mb-4">Recent Admin Actions</h3>
          {auditLog.length === 0 ? (
            <p className="text-sm text-[var(--color-dim)]">No admin actions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLog.map((entry: any) => (
                <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-white/3 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-rose)]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-[var(--color-rose)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)]">
                      <span className="font-medium">{entry.action}</span>
                      {entry.target_type && <span className="text-[var(--color-dim)]"> on {entry.target_type}</span>}
                      {entry.target_id && <span className="font-mono text-xs text-[var(--color-muted)]"> #{entry.target_id.slice(0, 8)}</span>}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
