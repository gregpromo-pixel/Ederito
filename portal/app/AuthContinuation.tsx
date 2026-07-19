'use client';

import { useEffect } from 'react';

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export default function AuthContinuation() {
  useEffect(() => {
    if (window.location.pathname !== '/dashboard') return;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = safeNext(params.get('next'));
    const fromStorage = safeNext(localStorage.getItem('ederito-pending-project-path'));
    const destination = fromUrl || fromStorage;

    if (!destination || destination === '/dashboard') return;
    localStorage.removeItem('ederito-pending-project-path');
    window.location.replace(destination);
  }, []);

  return null;
}
