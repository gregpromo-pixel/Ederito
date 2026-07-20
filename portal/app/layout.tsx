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
import './apple-footer.css';
import './apple-navigation.css';
import './cinematic-ai.css';
import './smart-client-workspace.css';
import './premium-polish.css';
import type { Metadata } from 'next';
import IntakeEnhancer from './IntakeEnhancer';
import PhoneCountryCodeEnhancer from './PhoneCountryCodeEnhancer';
import StartProjectTranslations from './StartProjectTranslations';
import ProjectJourneyPrefill from './ProjectJourneyPrefill';
import AuthContinuation from './AuthContinuation';
import AIPlannerShortcut from './AIPlannerShortcut';
import UnifiedExperience from './UnifiedExperience';
import AppleNavigationEnhancer from './AppleNavigationEnhancer';
import CinematicAIExperience from './CinematicAIExperience';
import SmartClientWorkspace from './SmartClientWorkspace';
import PremiumPolishExperience from './PremiumPolishExperience';

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
        <AppleNavigationEnhancer />
        <CinematicAIExperience />
        <SmartClientWorkspace />
        <PremiumPolishExperience />
        <IntakeEnhancer />
        <StartProjectTranslations />
        <ProjectJourneyPrefill />
        <AuthContinuation />
        <AIPlannerShortcut />
        <PhoneCountryCodeEnhancer />
      </body>
    </html>
  );
}
