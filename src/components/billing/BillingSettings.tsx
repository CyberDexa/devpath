import { useState, useEffect } from 'react';
import {
  CreditCard, Zap, Crown, Users, Check, ArrowRight, Receipt,
  ExternalLink, AlertTriangle, Calendar, RefreshCw, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  getUserSubscription, getUserPlan, getPaymentHistory, getCheckoutUrl,
  getCustomerPortalUrl, PLAN_LIMITS, PLAN_PRICES,
  type Plan, type BillingCycle, type Subscription, type Payment
} from '../../lib/analytics';

const PLAN_INFO: Record<Plan, {
  name: string;
  tagline: string;
  icon: typeof Zap;
  color: string;
  features: string[];
}> = {
  free: {
    name: 'Free',
    tagline: 'Perfect for getting started',
    icon: Zap,
    color: 'text-dim',
    features: [
      '3 roadmaps active at once',
      'Basic progress tracking',
      'Community access',
      '10 AI tutor questions / day',
      '5 coding projects',
      'Public profile & badges',
    ],
  },
  pro: {
    name: 'Pro',
    tagline: 'For serious learners',
    icon: Crown,
    color: 'text-teal',
    features: [
      'Unlimited roadmaps',
      'Unlimited AI tutor',
      'Full IDE code editor',
      'Unlimited coding projects',
      'AI-personalized learning paths',
      'Advanced progress analytics',
      'Priority support',
      'Career path recommendations',
    ],
  },
  teams: {
    name: 'Teams',
    tagline: 'For organizations & bootcamps',
    icon: Users,
    color: 'text-sky-400',
    features: [
      'Everything in Pro',
      'Team dashboard & analytics',
      'Custom roadmap builder',
      'SSO & admin controls',
      'Bulk seat management',
      'Dedicated account manager',
      'Custom integrations',
      'Invoice billing',
    ],
  },
};

export default function BillingSettings() {
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<Plan | null>(null);
  const [tab, setTab] = useState<'plans' | 'history'>('plans');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [plan, sub, history] = await Promise.all([
        getUserPlan(user.id),
        getUserSubscription(user.id),
        getPaymentHistory(user.id),
      ]);

      setCurrentPlan(plan);
      setSubscription(sub);
      setPayments(history);
      if (sub?.billing_cycle) setBillingCycle(sub.billing_cycle);
      setLoading(false);
    })();
  }, []);

  const handleUpgrade = async (plan: Plan) => {
    setUpgrading(plan);
    try {
      const url = getCheckoutUrl(plan, billingCycle);
      window.location.href = url;
    } catch {
      setUpgrading(null);
    }
  };

  const handleManageBilling = () => {
    window.location.href = getCustomerPortalUrl();
  };

  const formatPrice = (plan: Plan): string => {
    const price = PLAN_PRICES[plan][billingCycle];
    return `$${(price / 100).toFixed(0)}`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-2xl bg-[var(--color-surface)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Banner */}
      {subscription && subscription.status !== 'canceled' && (
        <div className="rounded-2xl border border-[var(--color-accent-teal)]/20 bg-[var(--color-accent-teal)]/5 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-teal)]/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[var(--color-accent-teal)]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[var(--color-bright)] text-lg">
                  {PLAN_INFO[currentPlan].name} Plan
                </h3>
                <p className="text-sm text-[var(--color-dim)]">
                  {subscription.billing_cycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  {subscription.current_period_end && (
                    <> &middot; Renews {formatDate(subscription.current_period_end)}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {subscription.cancel_at_period_end && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Cancels at period end
                </span>
              )}
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-[var(--color-text)] hover:bg-white/[0.04] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-white/[0.06] w-fit">
        {(['plans', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white/[0.08] text-[var(--color-bright)]'
                : 'text-[var(--color-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            {t === 'plans' ? 'Plans' : 'Payment History'}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-[var(--color-bright)]' : 'text-[var(--color-dim)]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                billingCycle === 'annual' ? 'bg-[var(--color-accent-teal)]' : 'bg-[var(--color-charcoal)]'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                  billingCycle === 'annual' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`text-sm flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-[var(--color-bright)]' : 'text-[var(--color-dim)]'}`}>
              Annual
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)]">
                SAVE 20%
              </span>
            </span>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['free', 'pro', 'teams'] as Plan[]).map(plan => {
              const info = PLAN_INFO[plan];
              const Icon = info.icon;
              const isCurrent = plan === currentPlan;
              const isUpgrade = plan !== 'free' && (
                currentPlan === 'free' || (currentPlan === 'pro' && plan === 'teams')
              );

              return (
                <div
                  key={plan}
                  className={`rounded-2xl border p-6 flex flex-col transition-all ${
                    plan === 'pro'
                      ? 'border-[var(--color-accent-teal)]/30 bg-[var(--color-surface)] shadow-[0_0_60px_-12px_rgba(0,229,160,0.12)]'
                      : 'border-white/[0.06] bg-[var(--color-surface)]'
                  } ${isCurrent ? 'ring-2 ring-[var(--color-accent-teal)]/30' : ''}`}
                >
                  {plan === 'pro' && (
                    <div className="text-center mb-4 -mt-10">
                      <span className="px-4 py-1 rounded-full bg-[var(--color-accent-teal)] text-[var(--color-void)] text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${
                      plan === 'pro' ? 'bg-[var(--color-accent-teal)]/10' :
                      plan === 'teams' ? 'bg-sky-500/10' : 'bg-white/[0.06]'
                    } flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <div>
                      <h3 className={`font-display font-bold text-lg ${info.color === 'text-dim' ? 'text-[var(--color-bright)]' : info.color}`}>
                        {info.name}
                      </h3>
                      <p className="text-xs text-[var(--color-dim)]">{info.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="font-display font-extrabold text-3xl text-[var(--color-bright)]">
                      {plan === 'free' ? '$0' : formatPrice(plan)}
                    </span>
                    <span className="text-[var(--color-dim)] text-sm">
                      {plan === 'free' ? ' / forever' : plan === 'teams' ? ' / seat / mo' : ' / month'}
                    </span>
                  </div>

                  {/* Action Button */}
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] border border-[var(--color-accent-teal)]/20 mb-6">
                      <Check className="w-4 h-4" />
                      Current Plan
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!!upgrading}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all mb-6 ${
                        plan === 'pro'
                          ? 'bg-[var(--color-accent-teal)] text-[var(--color-void)] hover:brightness-110 shadow-[0_0_20px_-5px_rgba(0,229,160,0.3)]'
                          : 'border border-white/10 text-[var(--color-text)] hover:bg-white/[0.04]'
                      } ${upgrading === plan ? 'opacity-75' : ''}`}
                    >
                      {upgrading === plan ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Upgrade to {info.name}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="py-3 mb-6" />
                  )}

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {info.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-dim)]">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan === 'pro' ? 'text-[var(--color-accent-teal)]' :
                          plan === 'teams' ? 'text-sky-400' : 'text-[var(--color-accent-teal)]'
                        }`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-dim)]">
            <Shield className="w-3.5 h-3.5" />
            Payments secured by Stripe. Cancel anytime.
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--color-bright)]">
            Payment History
          </h3>

          {payments.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-[var(--color-surface)]">
              <Receipt className="w-12 h-12 text-[var(--color-dim)] mx-auto mb-4 opacity-40" />
              <p className="text-[var(--color-dim)] text-sm">No payments yet</p>
              <p className="text-[var(--color-dim)] text-xs mt-1">
                Upgrade to Pro to see your payment history here
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-[var(--color-surface)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-6 py-3 text-[var(--color-dim)] font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-[var(--color-dim)] font-medium text-xs uppercase tracking-wider">Description</th>
                    <th className="text-left px-6 py-3 text-[var(--color-dim)] font-medium text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-[var(--color-dim)] font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-[var(--color-dim)] font-medium text-xs uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--color-dim)]" />
                          {formatDate(payment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">
                        {payment.description || 'SkillRoute subscription'}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-bright)] font-medium">
                        ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400' :
                          payment.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          payment.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-sky-500/10 text-sky-400'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment.receipt_url && (
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent-teal)] hover:underline text-xs flex items-center justify-end gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
