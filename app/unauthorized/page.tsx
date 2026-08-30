"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'At first login then you access product';
  const redirectTo = searchParams.get('redirectTo') || '/product';

  return (
    <div className="w-full max-w-lg">
      {/* Exact Lock Card from Image */}
      <div className="bg-[#2a2d34] border border-[#78541c] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl mb-6">
        <div className="w-14 h-14 rounded-full bg-[#523d1d] flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-[#fbbf24] text-lg font-medium tracking-wide">
          {message}
        </p>
      </div>

      {/* Action Button to Login Form */}
      <Link
        href={`/auth?redirectTo=${encodeURIComponent(redirectTo)}`}
        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl text-center shadow-lg transition-all duration-200"
      >
        Proceed to Login
      </Link>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#0f172a] p-4">
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <UnauthorizedContent />
      </Suspense>
    </div>
  );
}