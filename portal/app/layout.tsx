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
import './portal-theme.css';
import './portal-theme-coverage.css';
import './stripe-payments.css';
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

const automaticThemeScript = `
(() => {
  try {
    localStorage.removeItem('ederito-portal-theme');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = media.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', theme === 'dark' ? '#050505' : '#f6f4ee');
    };
    apply();
    media.addEventListener?.('change', apply);
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: automaticThemeScript }} />
      </head>
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