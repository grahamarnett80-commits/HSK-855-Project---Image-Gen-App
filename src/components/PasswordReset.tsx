import { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../lib/authService';

interface PasswordResetProps {
  onSwitchToSignIn?: () => void;
}

export function PasswordReset({ onSwitchToSignIn }: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Check your email</h3>
        <p className="text-blue-700 text-sm mb-4">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <button
          onClick={onSwitchToSignIn}
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
            disabled={isLoading}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          We'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-5 h-5" />
            Send reset link
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onSwitchToSignIn}
        className="w-full text-blue-600 hover:text-blue-700 font-semibold py-2 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </button>
    </form>
  );
}
