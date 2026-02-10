import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Shield,
  Code,
  Zap,
  ChevronRight,
  Camera,
  Save,
  Trash2,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Globe,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Toggle } from '../ui/Toggle';
import { Select } from '../ui/Select';
import Button from '../ui/Button';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'privacy' | 'editor' | 'account';

interface SettingsTabDef {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: SettingsTabDef[] = [
  { id: 'profile', label: 'Profile', icon: <User size={18} />, description: 'Personal info & public profile' },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, description: 'Email & push preferences' },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={18} />, description: 'Theme, fonts & display' },
  { id: 'privacy', label: 'Privacy', icon: <Shield size={18} />, description: 'Visibility & data controls' },
  { id: 'editor', label: 'Code Editor', icon: <Code size={18} />, description: 'Editor preferences & keybinds' },
  { id: 'account', label: 'Account', icon: <Zap size={18} />, description: 'Plan, billing & danger zone' },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-[var(--color-steel)] mt-1">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-[var(--color-steel)] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ProfileSettings() {
  const [displayName, setDisplayName] = useState('Jane Developer');
  const [username, setUsername] = useState('janedev');
  const [bio, setBio] = useState('Full stack developer passionate about React, TypeScript, and building great developer tools.');
  const [location, setLocation] = useState('San Francisco, CA');
  const [website, setWebsite] = useState('https://janedev.com');
  const [github, setGithub] = useState('janedev');
  const [twitter, setTwitter] = useState('janedev');

  return (
    <div className="space-y-6">
      <SectionCard title="Avatar" description="Your profile picture visible across DevPath">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-[var(--color-charcoal)] flex items-center justify-center overflow-hidden">
              <User size={32} className="text-[var(--color-steel)]" />
            </div>
            <button className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div className="space-y-2">
            <Button variant="secondary" size="sm">Upload Photo</Button>
            <p className="text-xs text-[var(--color-steel)]">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Information" description="This information will be displayed on your public profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            hint="devpath.dev/@username"
          />
        </div>
        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
          hint={`${bio.length}/280 characters`}
        />
        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          icon={<Globe size={16} />}
        />
      </SectionCard>

      <SectionCard title="Social Links" description="Connect your other profiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            icon={<Globe size={16} />}
          />
          <Input
            label="GitHub"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="username"
          />
          <Input
            label="Twitter / X"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="username"
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button>
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [emailNewBadge, setEmailNewBadge] = useState(true);
  const [emailStreak, setEmailStreak] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [pushProgress, setPushProgress] = useState(true);
  const [pushSocial, setPushSocial] = useState(true);
  const [pushReminder, setPushReminder] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState('weekly');

  return (
    <div className="space-y-6">
      <SectionCard title="Email Notifications" description="Choose what emails you'd like to receive">
        <SettingRow label="Weekly Digest" description="Summary of your learning progress each week">
          <Toggle checked={emailDigest} onChange={setEmailDigest} />
        </SettingRow>
        <SettingRow label="Badge Earned" description="When you unlock a new achievement badge">
          <Toggle checked={emailNewBadge} onChange={setEmailNewBadge} />
        </SettingRow>
        <SettingRow label="Streak Reminders" description="Don't break your streak! Get reminded to learn">
          <Toggle checked={emailStreak} onChange={setEmailStreak} />
        </SettingRow>
        <SettingRow label="Newsletter" description="Product updates, new roadmaps, and tips">
          <Toggle checked={emailNewsletter} onChange={setEmailNewsletter} />
        </SettingRow>
        <Select
          label="Digest Frequency"
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          value={digestFrequency}
          onChange={setDigestFrequency}
        />
      </SectionCard>

      <SectionCard title="Push Notifications" description="In-app and browser notifications">
        <SettingRow label="Progress Updates" description="When you complete a topic or project">
          <Toggle checked={pushProgress} onChange={setPushProgress} />
        </SettingRow>
        <SettingRow label="Social Activity" description="When someone follows you or likes your progress">
          <Toggle checked={pushSocial} onChange={setPushSocial} />
        </SettingRow>
        <SettingRow label="Learning Reminders" description="Daily reminder to continue learning">
          <Toggle checked={pushReminder} onChange={setPushReminder} />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState('teal');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [codeFont, setCodeFont] = useState('jetbrains-mono');

  const accentColors = [
    { value: 'teal', label: 'Electric Teal', color: '#00e5a0' },
    { value: 'blue', label: 'Cobalt Blue', color: '#3b82f6' },
    { value: 'purple', label: 'Neon Purple', color: '#a855f7' },
    { value: 'rose', label: 'Soft Rose', color: '#f43f5e' },
    { value: 'amber', label: 'Warm Amber', color: '#f59e0b' },
    { value: 'cyan', label: 'Icy Cyan', color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="Theme" description="Choose your preferred color scheme">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'dark', label: 'Dark', icon: <Moon size={20} /> },
            { value: 'light', label: 'Light', icon: <Sun size={20} /> },
            { value: 'system', label: 'System', icon: <Monitor size={20} /> },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value as typeof theme)}
              className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                theme === t.value
                  ? 'border-[var(--color-accent-teal)] bg-[var(--color-accent-teal)]/5 text-[var(--color-accent-teal)]'
                  : 'border-[var(--color-charcoal)] text-[var(--color-steel)] hover:border-[var(--color-steel)] hover:text-white'
              )}
            >
              {t.icon}
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Accent Color" description="Personalize your highlight color">
        <div className="flex flex-wrap gap-3">
          {accentColors.map((c) => (
            <button
              key={c.value}
              onClick={() => setAccentColor(c.value)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                accentColor === c.value
                  ? 'border-white/20 bg-white/[0.06]'
                  : 'border-[var(--color-charcoal)] hover:border-[var(--color-steel)]'
              )}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-sm text-white">{c.label}</span>
              {accentColor === c.value && (
                <svg className="w-4 h-4 text-[var(--color-accent-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Display Preferences">
        <SettingRow label="Animations" description="Enable smooth transitions and animations">
          <Toggle checked={animationsEnabled} onChange={setAnimationsEnabled} />
        </SettingRow>
        <SettingRow label="Compact Mode" description="Reduce spacing for a denser UI layout">
          <Toggle checked={compactMode} onChange={setCompactMode} />
        </SettingRow>
        <Select
          label="Code Font"
          options={[
            { value: 'jetbrains-mono', label: 'JetBrains Mono' },
            { value: 'fira-code', label: 'Fira Code' },
            { value: 'source-code-pro', label: 'Source Code Pro' },
            { value: 'cascadia-code', label: 'Cascadia Code' },
            { value: 'ibm-plex-mono', label: 'IBM Plex Mono' },
          ]}
          value={codeFont}
          onChange={setCodeFont}
        />
      </SectionCard>
    </div>
  );
}

function PrivacySettings() {
  const [profilePublic, setProfilePublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [allowIndexing, setAllowIndexing] = useState(false);

  return (
    <div className="space-y-6">
      <SectionCard title="Profile Visibility" description="Control who can see your profile information">
        <SettingRow label="Public Profile" description="Allow anyone to view your profile page">
          <Toggle checked={profilePublic} onChange={setProfilePublic} />
        </SettingRow>
        <SettingRow label="Learning Activity" description="Show your learning heatmap and activity feed">
          <Toggle checked={showActivity} onChange={setShowActivity} />
        </SettingRow>
        <SettingRow label="Roadmap Progress" description="Show your completion progress on roadmaps">
          <Toggle checked={showProgress} onChange={setShowProgress} />
        </SettingRow>
        <SettingRow label="Streak Count" description="Display your current learning streak">
          <Toggle checked={showStreak} onChange={setShowStreak} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Discoverability" description="How others can find you on DevPath">
        <SettingRow label="Leaderboard" description="Appear on the public leaderboard">
          <Toggle checked={showOnLeaderboard} onChange={setShowOnLeaderboard} />
        </SettingRow>
        <SettingRow label="Search Engine Indexing" description="Allow your profile to be indexed by search engines">
          <Toggle checked={allowIndexing} onChange={setAllowIndexing} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Data & Export">
        <div className="space-y-3">
          <Button variant="secondary" size="sm">
            Download My Data
          </Button>
          <p className="text-xs text-[var(--color-steel)]">
            Export all your data including progress, badges, and activity history in JSON format.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

function EditorSettings() {
  const [fontSize, setFontSize] = useState('14');
  const [tabSize, setTabSize] = useState('2');
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [bracketPairs, setBracketPairs] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [vimMode, setVimMode] = useState(false);
  const [editorTheme, setEditorTheme] = useState('devpath-dark');

  return (
    <div className="space-y-6">
      <SectionCard title="Editor Configuration" description="Customize the integrated code editor">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Font Size"
            options={[
              { value: '12', label: '12px' },
              { value: '13', label: '13px' },
              { value: '14', label: '14px' },
              { value: '15', label: '15px' },
              { value: '16', label: '16px' },
              { value: '18', label: '18px' },
            ]}
            value={fontSize}
            onChange={setFontSize}
          />
          <Select
            label="Tab Size"
            options={[
              { value: '2', label: '2 spaces' },
              { value: '4', label: '4 spaces' },
            ]}
            value={tabSize}
            onChange={setTabSize}
          />
        </div>
        <Select
          label="Editor Theme"
          options={[
            { value: 'devpath-dark', label: 'DevPath Dark', description: 'Our custom dark theme' },
            { value: 'github-dark', label: 'GitHub Dark' },
            { value: 'one-dark-pro', label: 'One Dark Pro' },
            { value: 'dracula', label: 'Dracula' },
            { value: 'monokai', label: 'Monokai' },
            { value: 'nord', label: 'Nord' },
          ]}
          value={editorTheme}
          onChange={setEditorTheme}
          searchable
        />
      </SectionCard>

      <SectionCard title="Editor Behavior">
        <SettingRow label="Word Wrap" description="Wrap long lines instead of horizontal scrolling">
          <Toggle checked={wordWrap} onChange={setWordWrap} />
        </SettingRow>
        <SettingRow label="Minimap" description="Show a minimap overview on the right side">
          <Toggle checked={minimap} onChange={setMinimap} />
        </SettingRow>
        <SettingRow label="Line Numbers" description="Display line numbers in the gutter">
          <Toggle checked={lineNumbers} onChange={setLineNumbers} />
        </SettingRow>
        <SettingRow label="Bracket Pair Colorization" description="Colorize matching brackets for readability">
          <Toggle checked={bracketPairs} onChange={setBracketPairs} />
        </SettingRow>
        <SettingRow label="Auto Save" description="Automatically save code changes as you type">
          <Toggle checked={autoSave} onChange={setAutoSave} />
        </SettingRow>
        <SettingRow label="Vim Mode" description="Enable Vim keybindings in the editor">
          <Toggle checked={vimMode} onChange={setVimMode} />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

function AccountSettings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  return (
    <div className="space-y-6">
      <SectionCard title="Current Plan" description="Manage your subscription">
        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-accent-teal)]/20 bg-[var(--color-accent-teal)]/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">Free Plan</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-charcoal)] text-[var(--color-steel)]">Current</span>
            </div>
            <p className="text-sm text-[var(--color-steel)] mt-1">Basic access to roadmaps and community features</p>
          </div>
          <Button size="sm">Upgrade to Pro</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { label: 'Roadmaps', free: '3', pro: 'Unlimited' },
            { label: 'AI Tutor', free: '10/day', pro: 'Unlimited' },
            { label: 'Projects', free: '5', pro: 'Unlimited' },
            { label: 'Code Editor', free: 'Basic', pro: 'Full IDE' },
          ].map((feature) => (
            <div key={feature.label} className="p-3 rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)]">
              <p className="text-xs text-[var(--color-steel)]">{feature.label}</p>
              <p className="text-sm font-medium text-white mt-1">{feature.free}</p>
              <p className="text-xs text-[var(--color-accent-teal)] mt-0.5">Pro: {feature.pro}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Connected Accounts">
        <div className="space-y-3">
          {[
            { name: 'GitHub', connected: true, icon: '🔗' },
            { name: 'Google', connected: true, icon: '🔗' },
            { name: 'LinkedIn', connected: false, icon: '🔗' },
          ].map((account) => (
            <div key={account.name} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-charcoal)]">
              <div className="flex items-center gap-3">
                <span>{account.icon}</span>
                <span className="text-sm font-medium text-white">{account.name}</span>
              </div>
              {account.connected ? (
                <Button variant="ghost" size="sm">Disconnect</Button>
              ) : (
                <Button variant="secondary" size="sm">Connect</Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Change Password">
        <div className="space-y-4 max-w-md">
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-[38px] text-[var(--color-steel)] hover:text-white transition-colors"
            >
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              hint="Minimum 8 characters with at least one number"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-[38px] text-[var(--color-steel)] hover:text-white transition-colors"
            >
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            error={confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match' : undefined}
          />
          <Button size="sm" disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
            Update Password
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <div className="rounded-lg border border-[var(--color-rose)]/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-rose)] flex items-center gap-2">
                <AlertTriangle size={16} />
                Delete Account
              </h4>
              <p className="text-xs text-[var(--color-steel)] mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="p-4 rounded-lg bg-[var(--color-rose)]/5 border border-[var(--color-rose)]/20">
                  <p className="text-sm text-[var(--color-rose)] mb-3">
                    Are you absolutely sure? Type <strong>DELETE</strong> to confirm.
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-[var(--color-abyss)] border border-[var(--color-rose)]/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--color-steel)] outline-none focus:border-[var(--color-rose)]"
                      placeholder="Type DELETE to confirm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" size="sm">
                      Confirm Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-charcoal)]">
          <div className="flex items-center gap-3">
            <LogOut size={18} className="text-[var(--color-steel)]" />
            <div>
              <p className="text-sm font-medium text-white">Sign Out</p>
              <p className="text-xs text-[var(--color-steel)]">Log out of your DevPath account</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Sign Out</Button>
        </div>
      </SectionCard>
    </div>
  );
}

const contentMap: Record<SettingsTab, React.FC> = {
  profile: ProfileSettings,
  notifications: NotificationSettings,
  appearance: AppearanceSettings,
  privacy: PrivacySettings,
  editor: EditorSettings,
  account: AccountSettings,
};

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const Content = contentMap[activeTab];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-[var(--color-steel)] mt-1">Manage your account, preferences, and privacy</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <nav className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                  activeTab === tab.id
                    ? 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] border border-[var(--color-accent-teal)]/20'
                    : 'text-[var(--color-silver)] hover:text-white hover:bg-white/[0.03] border border-transparent'
                )}
              >
                <span className={clsx(
                  'shrink-0',
                  activeTab === tab.id ? 'text-[var(--color-accent-teal)]' : 'text-[var(--color-steel)]'
                )}>
                  {tab.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{tab.label}</p>
                  <p className="text-xs text-[var(--color-steel)] truncate hidden lg:block">{tab.description}</p>
                </div>
                <ChevronRight size={14} className="ml-auto shrink-0 text-[var(--color-steel)] hidden lg:block" />
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Content />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
