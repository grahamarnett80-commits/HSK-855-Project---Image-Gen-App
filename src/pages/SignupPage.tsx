import React from 'react';
import { SignupForm } from '../components/auth/SignupForm';
import { Link } from 'react-router-dom';

export function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignupForm />
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}