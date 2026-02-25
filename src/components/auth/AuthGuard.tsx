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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
}