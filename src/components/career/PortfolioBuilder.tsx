// ═══════════════════════════════════════
// DevPath — Portfolio Builder Component
// Build a shareable developer portfolio
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Eye,
  EyeOff,
  Save,
  Palette,
  User,
  Link2,
  Layout,
  Award,
  Code2,
  CheckCircle2,
  Loader2,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import {
  getPortfolioSite,
  createPortfolioSite,
  updatePortfolioSite,
  PORTFOLIO_THEMES,
  type PortfolioTheme,
} from '../../lib/career';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  userId: string;
}

type Tab = 'profile' | 'theme' | 'content' | 'seo' | 'preview';

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function PortfolioBuilder({ userId }: Props) {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Form state
  const [form, setForm] = useState({
    slug: '',
    title: '',
    tagline: '',
    bio: '',
    theme: 'midnight' as PortfolioTheme,
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
    showStats: true,
    showActivity: true,
    showBadges: true,
    isPublished: false,
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    loadPortfolio();
  }, [userId]);

  async function loadPortfolio() {
    setLoading(true);
    const data = await getPortfolioSite(userId);
    if (data) {
      setPortfolio(data);
      setForm({
        slug: data.slug || '',
        title: data.title || '',
        tagline: data.tagline || '',
        bio: data.bio || '',
        theme: data.theme || 'midnight',
        github: data.social_links?.github || '',
        linkedin: data.social_links?.linkedin || '',
        twitter: data.social_links?.twitter || '',
        website: data.social_links?.website || '',
        showStats: data.show_stats ?? true,
        showActivity: data.show_activity ?? true,
        showBadges: data.show_badges ?? true,
        isPublished: data.is_published ?? false,
        seoTitle: data.seo_title || '',
        seoDescription: data.seo_description || '',
      });
    } else {
      setIsNew(true);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        const created = await createPortfolioSite(userId, form.slug, {
          title: form.title,
          tagline: form.tagline,
          bio: form.bio,
          theme: form.theme,
          socialLinks: {
            github: form.github,
            linkedin: form.linkedin,
            twitter: form.twitter,
            website: form.website,
          },
        });
        setPortfolio(created);
        setIsNew(false);
      } else {
        const updated = await updatePortfolioSite(userId, {
          title: form.title,
          tagline: form.tagline,
          bio: form.bio,
          theme: form.theme,
          social_links: {
            github: form.github,
            linkedin: form.linkedin,
            twitter: form.twitter,
            website: form.website,
          },
          show_stats: form.showStats,
          show_activity: form.showActivity,
          show_badges: form.showBadges,
          is_published: form.isPublished,
          seo_title: form.seoTitle,
          seo_description: form.seoDescription,
        });
        setPortfolio(updated);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const TABS: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'content', label: 'Content', icon: Layout },
    { id: 'seo', label: 'SEO', icon: BarChart3 },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-7 h-7 text-teal" />
            Portfolio Builder
          </h2>
          <p className="text-gray-400 mt-1">Create your professional developer portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          {portfolio?.is_published && (
            <a
              href={`/portfolio/${portfolio.slug}`}
              target="_blank"
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" /> View Live
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving || (!form.slug && isNew)}
            className="px-5 py-2 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-teal text-[#0a0a0f]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Basic Info</h3>

              {isNew && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1.5">Portfolio URL Slug *</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">devpath-phi.vercel.app/portfolio/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="your-name"
                      className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Display Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="John Doe — Full Stack Developer"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="Building beautiful, performant web experiences"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell the world about yourself..."
                  rows={4}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50"
                />
              </div>

              <h3 className="text-lg font-semibold text-white pt-4">Social Links</h3>
              {[
                { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
                { key: 'website', label: 'Website', placeholder: 'https://your-site.com' },
              ].map((link) => (
                <div key={link.key}>
                  <label className="text-sm text-gray-400 block mb-1.5">{link.label}</label>
                  <input
                    type="url"
                    value={(form as any)[link.key]}
                    onChange={(e) => updateField(link.key, e.target.value)}
                    placeholder={link.placeholder}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Choose a Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.entries(PORTFOLIO_THEMES) as [PortfolioTheme, typeof PORTFOLIO_THEMES['midnight']][]).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => updateField('theme', key)}
                    className={`p-4 rounded-xl border transition-all ${
                      form.theme === key
                        ? 'ring-2 ring-teal/60 border-teal/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`h-20 rounded-lg bg-gradient-to-br ${theme.bg} mb-3`} />
                    <p className="text-white font-medium text-sm">{theme.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Content Sections</h3>
              <p className="text-gray-400 text-sm">Choose what to display on your portfolio</p>

              {[
                {
                  key: 'showStats',
                  label: 'DevPath Stats',
                  desc: 'Show your level, XP, streak, and progress',
                  icon: BarChart3,
                },
                {
                  key: 'showActivity',
                  label: 'Recent Activity',
                  desc: 'Display your latest learning activities',
                  icon: Layout,
                },
                {
                  key: 'showBadges',
                  label: 'Badges & Achievements',
                  desc: 'Showcase your earned badges',
                  icon: Award,
                },
              ].map((section) => (
                <div
                  key={section.key}
                  className="flex items-center justify-between p-4 bg-white/3 border border-white/10 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium text-sm">{section.label}</p>
                      <p className="text-gray-500 text-xs">{section.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateField(section.key, !(form as any)[section.key])}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      (form as any)[section.key] ? 'bg-teal' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        (form as any)[section.key] ? 'translate-x-6.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}

              {/* Publish Toggle */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between p-4 bg-teal/5 border border-teal/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    {form.isPublished ? (
                      <Eye className="w-5 h-5 text-teal" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-white font-medium text-sm">
                        {form.isPublished ? 'Published' : 'Unpublished'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {form.isPublished
                          ? 'Your portfolio is live and publicly accessible'
                          : 'Your portfolio is hidden from the public'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateField('isPublished', !form.isPublished)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      form.isPublished ? 'bg-teal' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        form.isPublished ? 'translate-x-6.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">SEO Settings</h3>
              <p className="text-gray-400 text-sm">Optimize how your portfolio appears in search engines</p>

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">SEO Title</label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => updateField('seoTitle', e.target.value)}
                  placeholder={form.title || 'Your Name — Developer Portfolio'}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
                />
                <p className="text-gray-600 text-xs mt-1">{(form.seoTitle || form.title || '').length}/60 characters</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">SEO Description</label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => updateField('seoDescription', e.target.value)}
                  placeholder="A brief description of your portfolio for search engines..."
                  rows={3}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50"
                />
                <p className="text-gray-600 text-xs mt-1">{(form.seoDescription || '').length}/160 characters</p>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-white/3 border border-white/10 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Search Engine Preview</p>
                <p className="text-blue-400 text-base font-medium truncate">
                  {form.seoTitle || form.title || 'Portfolio Title'}
                </p>
                <p className="text-green-400 text-xs font-mono truncate">
                  devpath-phi.vercel.app/portfolio/{form.slug || 'your-slug'}
                </p>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {form.seoDescription || form.tagline || 'Your portfolio description will appear here...'}
                </p>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Portfolio Preview</h3>
              {(() => {
                const theme = PORTFOLIO_THEMES[form.theme];
                return (
                  <div className={`rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br ${theme.bg} p-8`}>
                    {/* Simulated portfolio */}
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                      <h1 className={`text-2xl font-bold ${theme.text}`}>{form.title || 'Your Name'}</h1>
                      <p className="text-gray-400 mt-1">{form.tagline || 'Your tagline here'}</p>

                      {/* Social links */}
                      <div className="flex justify-center gap-3 mt-4">
                        {form.github && (
                          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Code2 className="w-4 h-4 text-gray-400" />
                          </span>
                        )}
                        {form.linkedin && (
                          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Link2 className="w-4 h-4 text-gray-400" />
                          </span>
                        )}
                      </div>

                      {form.bio && (
                        <p className="text-gray-300 text-sm mt-6 max-w-md mx-auto">{form.bio}</p>
                      )}
                    </div>

                    {/* Stats preview */}
                    {form.showStats && (
                      <div className="grid grid-cols-3 gap-4 mt-8">
                        {['Level', 'XP', 'Streak'].map((stat) => (
                          <div key={stat} className={`${theme.card} rounded-xl p-4 text-center border`}>
                            <p className="text-gray-500 text-xs">{stat}</p>
                            <p className={`text-xl font-bold ${theme.accent} mt-1`}>—</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Badges preview */}
                    {form.showBadges && (
                      <div className={`${theme.card} rounded-xl p-5 mt-4 border`}>
                        <p className={`${theme.text} font-semibold text-sm mb-3`}>Badges</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                              <Award className="w-5 h-5 text-gray-600" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
