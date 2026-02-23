import type { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: '#00ff88',
    colorBackground: '#1c1c28',
    colorText: '#e2e2ea',
    colorTextOnPrimaryBackground: '#06060a',
    colorTextSecondary: '#9a9aaa',
    colorInputBackground: '#111118',
    colorInputText: '#e2e2ea',
    colorNeutral: '#ffffff',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    fontFamilyButtons: 'var(--font-geist-mono), monospace',
  },
  elements: {
    headerTitle: 'font-mono',
    formButtonPrimary: 'font-mono font-semibold',
    footerActionLink: 'text-[#00ff88] hover:text-[#00cc6a]',
    userButtonPopoverFooter: 'hidden',
  },
};
