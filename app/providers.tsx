// providers/StoreProvider.tsx
"use client";

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/redux/store'; // Adjust path to your store file

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}