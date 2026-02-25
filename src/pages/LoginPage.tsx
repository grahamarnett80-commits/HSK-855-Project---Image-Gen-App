import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-4 text-center">
          <Link
            to="/signup"
            className="text-green-600 hover:text-green-500 text-sm"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}