'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { logout } from '@/app/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // State to handle client hydration safely
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Access user data from auth state
  const user = useAppSelector((state) => state.auth?.user);

  const handleLogout = () => {
    // 💡 FIXED: Match exact cookie key 'token' used in axiosInstance
    Cookies.remove('token', { path: '/' });
    localStorage.removeItem('token');

    dispatch(logout());
    router.push('/signin');
  };

  // Build dynamic profile image URL
  const profilePicUrl = user?.profile_pic
    ? `/uploads/user/profile_pic/${user.profile_pic}`
    : 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNzIy75oYnMCm4V_hg6S0qpO0dIK-StLuxOSenTTt8_77sb48E3SEwQOwWwL4TVecaMT2_Tq1kN0BODFEmK-YPj6vme9MrBR-lmATUsJ-pCzvd6yfVVLRUuVaHN1dzyqZySiP3PCU1ASkWrGqdmgWg3mTBXDM4Ta0Hvr262Xjbrc63AFhhlMJUCJowcQ3w/w640-h640/Cute%20Instagram%20Profile%20Picture%20For%20Girls%20Cartoon.jpg';

  const displayName = user?.first_name ? user.first_name : 'Sayani';

  // Prevent hydration errors during SSR
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="flex h-16 items-center justify-between bg-white px-6 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <h1 className="text-xl font-bold text-indigo-600">MY APP</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Hello, {displayName} 👋
          </span>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="flex items-center justify-center focus:outline-none"
          >
            <img
              src={profilePicUrl}
              alt="Profile Avatar"
              className="h-10 w-10 rounded-full border-2 border-indigo-500 object-cover shadow-sm transition hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/150';
              }}
            />
          </button>
        </div>
      </nav>

      {/* Main Profile Content */}
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md text-center">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Profile Details</h1>

          <div className="mb-6 flex justify-center">
            <img
              src={profilePicUrl}
              alt="Profile Picture"
              className="h-28 w-28 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>

          {user ? (
            <div className="mb-6 space-y-2 text-left text-gray-600">
              <p><strong>First Name:</strong> {user.first_name || 'N/A'}</p>
              <p><strong>Last Name:</strong> {user.last_name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            </div>
          ) : (
            <p className="mb-6 text-gray-500 text-sm">No profile data found in state.</p>
          )}

          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-red-600 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}