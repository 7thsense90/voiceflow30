import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles, CheckCircle2, Gift, Globe2, AlertCircle } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { validateRealEmail } from '../utils/emailValidation';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onClose?: () => void;
  onSuccess?: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
  onSuccess,
  customTitle,
  customSubtitle,
}) => {
  const { login, register, resetPassword } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Check URL query parameters for referral code (e.g. ?ref=VF-JOHN2026)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setReferralCode(refParam.toUpperCase());
        setMode('register');
      }
    } catch {
      // ignore in environments where window.location is sandboxed
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setIsLoading(true);
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Login failed.');
      } else {
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      }
    } else if (mode === 'register') {
      if (!firstName.trim()) {
        setError('Please provide your first name.');
        return;
      }
      if (!lastName.trim()) {
        setError('Please provide your last name.');
        return;
      }

      // Email validation check
      const emailValidation = validateRealEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || 'Please provide a valid, authentic email address.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('You must agree to the Terms of Service.');
        return;
      }

      setIsLoading(true);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await register(fullName, email, password, country, referralCode, firstName.trim(), lastName.trim());
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
      } else {
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please provide your account email.');
        return;
      }
      const sent = resetPassword(email);
      if (sent) {
        setResetSent(true);
      }
    }
  };



  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
      <SEOHead
        title={mode === 'register' ? 'Create Free Earning Account' : 'Sign In to Your Account'}
        description="Sign in or create an account on Voice Flow 360 to earn coins by sharing your opinion on top brands. Start with a 50 coin sign-up bonus!"
        canonicalPath={mode === 'register' ? '/register' : '/login'}
      />
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mb-3 shadow-inner">
          <Sparkles className="w-6 h-6 text-amber-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {customTitle
            ? customTitle
            : mode === 'login'
            ? 'Welcome Back'
            : mode === 'register'
            ? 'Create Your Account'
            : 'Reset Password'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {customSubtitle
            ? customSubtitle
            : mode === 'login'
            ? 'Sign in to access your feedback chats & coin balance.'
            : mode === 'register'
            ? 'Join today and receive 50 bonus coins automatically!'
            : "Enter your email and we'll send recovery instructions."}
        </p>
      </div>

      {/* Quick Sign In / Sign Up Mode Switcher Tabs */}
      {mode !== 'forgot' && (
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            id="auth-tab-signin"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-tab-signup"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up (+50 Coins)
          </button>
        </div>
      )}

      

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {resetSent && mode === 'forgot' ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Reset Email Dispatched!</h3>
          <p className="text-xs text-slate-600 mt-1 mb-6">
            We sent instructions to <strong>{email}</strong>. Check your inbox to set a new password.
          </p>
          <button
            type="button"
            onClick={() => {
              setResetSent(false);
              setMode('login');
            }}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-firstname-input"
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-lastname-input"
                      type="text"
                      required
                      placeholder="Foster"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Country Selection Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Country of Residence</label>
                  <span className="text-[10px] text-slate-400">Optional / Undisclosed</span>
                </div>
                <div className="relative">
                  <Globe2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="reg-country-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer text-slate-900"
                  >
                    <option value="">Not Disclosed / Prefer not to say</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              {mode === 'register' && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Real Email Required
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder={mode === 'register' ? 'jane.foster@gmail.com' : 'name@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            {mode === 'register' && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                Must be an active personal email (example &amp; disposable inboxes like Yopmail are rejected).
              </p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-confirm-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    +50 extra bonus coins!
                  </span>
                </div>
                <div className="relative">
                  <Gift className="w-4 h-4 text-amber-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-referral-code-input"
                    type="text"
                    placeholder="e.g. VF-JOHN2026"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono tracking-wider transition-all uppercase"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter your friend&apos;s referral code to give them 300 coins &amp; earn extra bonus coins for yourself!
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-start gap-2">
                  <input
                    id="reg-terms-checkbox"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="reg-terms-checkbox" className="text-xs text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 underline font-semibold hover:text-purple-800"
                    >
                      Participant Terms
                    </a>
                    ,{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 underline font-semibold hover:text-purple-800"
                    >
                      Privacy Policy
                    </a>
                    , and{' '}
                    <a
                      href="/rewards-and-withdrawals"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 underline font-semibold hover:text-purple-800"
                    >
                      Rewards &amp; Withdrawals Policy
                    </a>
                    .
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 pl-6 leading-relaxed font-medium">
                  Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction. Study availability and compensation vary based on eligibility criteria. No reward is guaranteed without accepted responses.
                </p>
              </div>
            </>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>
              {mode === 'login' && 'Sign In to Account'}
              {mode === 'register' && 'Complete Registration (+50 Coins)'}
              {mode === 'forgot' && 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Footer Mode Switchers */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        {mode === 'login' ? (
          <p>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => setMode('register')}
              className="font-bold text-amber-700 hover:text-amber-800 hover:underline"
            >
              Sign up here
            </button>
          </p>
        ) : mode === 'register' ? (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="font-bold text-slate-900 hover:underline"
            >
              Sign in
            </button>
          </p>
        ) : (
          <p>
            Remembered your password?{' '}
            <button
              onClick={() => setMode('login')}
              className="font-bold text-slate-900 hover:underline"
            >
              Back to login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
