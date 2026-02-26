import { useState } from 'react';
import { SignUp } from '../components/SignUp';
import { SignIn } from '../components/SignIn';
import { PasswordReset } from '../components/PasswordReset';

type AuthView = 'signin' | 'signup' | 'reset';

interface AuthPageProps {
  onSuccess?: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [view, setView] = useState<AuthView>('signin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <img
              src="/logo.svg"
              alt="AI Image Studio logo"
              className="w-16 h-16"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Image Studio
            </h1>
          </div>
          <p className="text-slate-600">
            Sign in to generate stunning AI images from simple text prompts using your Flux credits.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {view === 'signin' && (
            <SignIn
              onSuccess={onSuccess}
              onSwitchToSignUp={() => setView('signup')}
              onSwitchToReset={() => setView('reset')}
            />
          )}

          {view === 'signup' && (
            <SignUp
              onSuccess={onSuccess}
              onSwitchToSignIn={() => setView('signin')}
            />
          )}

          {view === 'reset' && (
            <PasswordReset
              onSwitchToSignIn={() => setView('signin')}
            />
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Your account is protected with industry-standard encryption
        </p>
      </div>
    </div>
  );
}
