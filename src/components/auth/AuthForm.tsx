import { useState } from 'react';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { Mail, Lock, Eye, EyeOff, Github, AlertCircle, CheckCircle } from 'lucide-react';
import { signUp, signIn, signInWithOAuth } from '../../lib/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Must be at least 8 characters';
    if (mode === 'signup' && !name) errs.name = 'Name is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setGlobalError('');
    setSuccessMessage('');
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUp(email, password, name);
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSuccessMessage('Account created! Check your email to confirm your account.');
        } else {
          window.location.href = '/profile';
        }
      } else {
        await signIn(email, password);
        window.location.href = '/roadmaps';
      }
    } catch (err: any) {
      const message = err?.message || 'Something went wrong. Please try again.';
      // Map Supabase errors to friendly messages
      if (message.includes('Invalid login credentials')) {
        setGlobalError('Invalid email or password. Please try again.');
      } else if (message.includes('User already registered')) {
        setGlobalError('An account with this email already exists. Try logging in.');
      } else if (message.includes('Email not confirmed')) {
        setGlobalError('Please confirm your email before logging in.');
      } else if (message.includes('rate limit')) {
        setGlobalError('Too many attempts. Please wait a moment and try again.');
      } else {
        setGlobalError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setOauthLoading(provider);
    setGlobalError('');
    try {
      await signInWithOAuth(provider);
      // Supabase redirects to the provider — this line won't be reached
    } catch (err: any) {
      setGlobalError(err?.message || `Failed to connect with ${provider}. Please try again.`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <a href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
            SkillRoute
          </span>
        </a>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-[var(--color-steel)] mt-2">
          {mode === 'login'
            ? 'Log in to continue your developer journey'
            : 'Start learning with adaptive AI roadmaps'}
        </p>
      </div>

      {/* Error/Success messages */}
      {globalError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 mb-6">
          <AlertCircle size={16} className="text-[var(--color-accent-rose)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-accent-rose)]">{globalError}</p>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 mb-6">
          <CheckCircle size={16} className="text-[var(--color-accent-teal)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-accent-teal)]">{successMessage}</p>
        </div>
      )}

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleOAuth('github')}
          disabled={!!oauthLoading || loading}
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading === 'github' ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Github size={18} />
          )}
          Continue with GitHub
        </button>
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading || loading}
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading === 'google' ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-charcoal)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--color-void)] px-3 text-[var(--color-steel)]">or continue with email</span>
        </div>
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'signup' && (
          <Input
            label="Full Name"
            type="text"
            placeholder="Jane Developer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail size={16} />}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={mode === 'signup' ? 'At least 8 characters' : undefined}
            icon={<Lock size={16} />}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-[var(--color-steel)] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {mode === 'login' && (
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-xs text-[var(--color-accent-teal)] hover:underline"
            >
              Forgot password?
            </a>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-2"
          disabled={loading || !!oauthLoading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {mode === 'login' ? 'Logging in...' : 'Creating account...'}
            </span>
          ) : mode === 'login' ? (
            'Log in'
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-steel)] mt-6">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <a href="/signup" className="text-[var(--color-accent-teal)] hover:underline font-medium">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a href="/login" className="text-[var(--color-accent-teal)] hover:underline font-medium">
              Log in
            </a>
          </>
        )}
      </p>

      {mode === 'signup' && (
        <p className="text-center text-xs text-[var(--color-steel)] mt-4">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-[var(--color-accent-teal)] hover:underline">Terms</a> and{' '}
          <a href="/privacy" className="text-[var(--color-accent-teal)] hover:underline">Privacy Policy</a>
        </p>
      )}
    </div>
  );
}
