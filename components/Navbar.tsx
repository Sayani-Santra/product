"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/auth');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">
        <Link href="/">MyApp</Link>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link href="/product" className="hover:text-gray-300">
          Product
        </Link>
        <Link href="/profile" className="hover:text-gray-300">
          Profile
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}