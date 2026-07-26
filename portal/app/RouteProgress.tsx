'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const internalRoutes = ['/dashboard', '/dashboard/sales', '/ai-planner', '/start-project', '/admin/intakes'];

export default function RouteProgress() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    internalRoutes.forEach((route) => router.prefetch(route));
  }, [router]);

  useEffect(() => {
    document.body.classList.remove('portal-route-loading');
    document.body.classList.add('portal-route-ready');
    const timer = window.setTimeout(() => document.body.classList.remove('portal-route-ready'), 240);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      document.body.classList.add('portal-route-loading');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
