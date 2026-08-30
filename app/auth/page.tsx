"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/api_url';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectMessage = searchParams.get('message');
  const redirectTo = searchParams.get('redirectTo') || '/product';

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axiosInstance.post(ENDPOINTS.AUTH.SIGN_IN, {
          email,
          password,
        });

        const token = response.data?.token;

        if (token) {
          Cookies.set('token', token, { expires: 7 });
          localStorage.setItem('token', token);
          
          // Redirect to requested page (e.g. /product)
          router.push(redirectTo);
        } else {
          setError('Invalid login response. Missing token.');
        }
      } else {
        const response = await axiosInstance.post(ENDPOINTS.AUTH.SIGN_UP, {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        });

        if (response.data?.status === 200 || response.data?.token) {
          setIsLogin(true);
          setError('');
          alert('Account created successfully! Please sign in.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
      {/* Dynamic Warning Banner */}
      {redirectMessage && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-center flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
            🔒
          </div>
          <p className="text-sm font-medium">{redirectMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {isLogin ? 'Sign in to access protected features' : 'Join us to get started'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2.5 rounded-xl text-white outline-none text-sm transition-all"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2.5 rounded-xl text-white outline-none text-sm transition-all"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3.5 py-2.5 rounded-xl text-white outline-none text-sm transition-all"
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3.5 py-2.5 rounded-xl text-white outline-none text-sm transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      {/* Bottom Switcher */}
      <p className="text-center text-xs text-slate-400 mt-6">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="ml-1 text-blue-400 hover:underline font-semibold"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Suspense fallback={<div className="text-white text-center">Loading form...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}