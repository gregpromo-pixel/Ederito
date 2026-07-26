'use client';

import { useEffect } from 'react';

const errorPattern = /(unable|error|failed|invalid|denied|missing|not authorized|not allowed|could not|cannot|upload)/i;

export default function PortalNoticeEnhancer() {
  useEffect(() => {
    const timers = new WeakMap<Element, number>();

    const enhance = (node: Element) => {
      if (!(node instanceof HTMLElement)) return;
      if (!node.matches('.client-command-center .notice, .admin-success, .admin-error')) return;
      if (node.classList.contains('portal-toast')) return;

      const isError = node.classList.contains('admin-error') || errorPattern.test(node.textContent || '');
      node.classList.add('portal-toast', isError ? 'portal-toast-error' : 'portal-toast-success');
      node.setAttribute('role', isError ? 'alert' : 'status');
      node.setAttribute('aria-live', 'polite');

      if (!node.querySelector('.portal-toast-icon')) {
        const icon = document.createElement('span');
        icon.className = 'portal-toast-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = isError ? '!' : '✓';
        node.prepend(icon);
      }

      if (!node.querySelector('.portal-toast-close')) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'portal-toast-close';
        close.setAttribute('aria-label', 'Close notification');
        close.textContent = '×';
        close.addEventListener('click', () => node.remove());
        node.append(close);
      }

      if (!node.querySelector('.portal-toast-progress')) {
        const progress = document.createElement('i');
        progress.className = 'portal-toast-progress';
        progress.setAttribute('aria-hidden', 'true');
        node.append(progress);
      }

      const existing = timers.get(node);
      if (existing) window.clearTimeout(existing);
      const timer = window.setTimeout(() => {
        node.classList.add('portal-toast-leaving');
        window.setTimeout(() => node.remove(), 260);
      }, 4600);
      timers.set(node, timer);
    };

    const scan = () => document.querySelectorAll('.client-command-center .notice, .admin-success, .admin-error').forEach(enhance);
    scan();

    const observer = new MutationObserver(() => scan());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
