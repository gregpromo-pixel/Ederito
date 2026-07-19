import './globals.css';
import './portal-upgrades.css';
import './project-intake.css';
import './intake-enhancer.css';
import './admin-intakes.css';
import './client-messages.css';
import './request-center.css';
import './sales-workflow.css';
import './phone-country-code.css';
import './crm.css';
import type { Metadata } from 'next';
import IntakeEnhancer from './IntakeEnhancer';
import RequestStatusShortcut from './RequestStatusShortcut';
import SalesWorkflowShortcut from './SalesWorkflowShortcut';
import PhoneCountryCodeEnhancer from './PhoneCountryCodeEnhancer';
import PortalTranslator from './PortalTranslator';

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
        <SalesWorkflowShortcut />
        <PhoneCountryCodeEnhancer />
        <PortalTranslator />
      </body>
    </html>
  );
}
