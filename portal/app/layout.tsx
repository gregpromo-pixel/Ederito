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
import './ai-planner.css';
import './unified-experience.css';
import type { Metadata } from 'next';
import IntakeEnhancer from './IntakeEnhancer';
import RequestStatusShortcut from './RequestStatusShortcut';
import SalesWorkflowShortcut from './SalesWorkflowShortcut';
import PhoneCountryCodeEnhancer from './PhoneCountryCodeEnhancer';
import StartProjectTranslations from './StartProjectTranslations';
import ProjectJourneyPrefill from './ProjectJourneyPrefill';
import AuthContinuation from './AuthContinuation';
import AIPlannerShortcut from './AIPlannerShortcut';
import UnifiedExperience from './UnifiedExperience';

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
        <UnifiedExperience />
        <IntakeEnhancer />
        <StartProjectTranslations />
        <ProjectJourneyPrefill />
        <AuthContinuation />
        <AIPlannerShortcut />
        <RequestStatusShortcut />
        <SalesWorkflowShortcut />
        <PhoneCountryCodeEnhancer />
      </body>
    </html>
  );
}
