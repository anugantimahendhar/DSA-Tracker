import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import { Code2, Mail, Lock, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register, googleLogin, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        const result = await register(email, password);
        if (result?.confirmationRequired) {
          setInfoMessage('Account created! Please check your email to confirm your address before signing in.');
          setIsLoading(false);
          return;
        }
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const errMsg = err.message || err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} size="sm">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-3">
          <Code2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">
          {authModalTab === 'login' ? 'Sign In to DSA Tracker' : 'Create an Account'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {authModalTab === 'login'
            ? 'Access your saved drafts, streaks, submissions, and personalized revision queue.'
            : 'Join to track problem mastery and execute multi-language sandboxed code.'}
        </p>
      </div>

      {/* Supabase status indicator */}
      {!isConfigured && (
        <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>Running in local development mode. Configure Supabase keys in <code>frontend/.env</code> for live cloud auth.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 mb-5">
        <button
          type="button"
          onClick={() => { setError(null); setInfoMessage(null); openAuthModal('login'); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            authModalTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setError(null); setInfoMessage(null); openAuthModal('register'); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            authModalTab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>{infoMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          {authModalTab === 'login' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-[#333] flex-1" /><span className="text-[11px] font-bold text-[#777]">OR</span><div className="h-px bg-[#333] flex-1" />
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full google-oauth-button"
        disabled={!isConfigured}
        onClick={async () => {
          setError(null);
          try { await googleLogin(); } catch (err: any) { setError(err.message || 'Google sign-in failed.'); }
        }}
      >
        <span className="google-mark">G</span> Continue with Google
      </Button>
      {!isConfigured && <p className="text-[10px] text-[#777] text-center mt-2">Add Supabase URL/anon key and enable Google provider to activate redirect login.</p>}
    </Modal>
  );
};