import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 mb-2">
              <img src="/logo.svg" alt="AI Image Studio logo" className="w-16 h-16" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI Image Studio
              </h1>
            </div>
<p className="text-slate-600 dark:text-slate-400">
            Generate stunning AI images from simple text prompts using your Flux credits.
          </p>
        </div>

        {showSignup ? (
            <>
              <SignupForm onSuccess={() => setShowSignup(false)} />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowSignup(false)}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          ) : (
            <>
              <LoginForm />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowSignup(true)}
                  className="text-green-600 hover:text-green-500 text-sm"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </>
          )}

<p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Your account is protected with industry-standard encryption
        </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}