import './globals.css';
import './portal-upgrades.css';
import './project-intake.css';
import './intake-enhancer.css';
import './admin-intakes.css';
import './client-messages.css';
import './request-center.css';
import type { Metadata } from 'next';
import IntakeEnhancer from './IntakeEnhancer';
import RequestStatusShortcut from './RequestStatusShortcut';

export const metadata: Metadata = {
  title: 'Ederito Client Portal',
  description: 'Secure project, contract, invoice and maintenance portal for Ederito clients.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <IntakeEnhancer />
        <RequestStatusShortcut />
      </body>
    </html>
  );
}
