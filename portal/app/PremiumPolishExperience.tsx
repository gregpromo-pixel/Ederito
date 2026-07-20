'use client';

import { useEffect } from 'react';

const supportedLanguages = ['en', 'fr', 'es'] as const;
type Language = (typeof supportedLanguages)[number];

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function normalizeLanguage(value: string | null): Language | null {
  return supportedLanguages.includes(value as Language) ? (value as Language) : null;
}

export default function PremiumPolishExperience() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const media