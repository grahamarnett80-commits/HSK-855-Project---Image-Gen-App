import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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