import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas, #FBF7F1)',
        surface: {
          DEFAULT: 'var(--color-surface, #FFFFFF)',
          sunken: 'var(--color-surface-sunken, #F5EFE6)',
        },
        border: {
          DEFAULT: 'var(--color-border, #E8DDCF)',
        },
        ink: {
          DEFAULT: 'var(--color-ink, #14181F)',
          muted: 'var(--color-ink-muted, #4A5361)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #B84E00)',
          ink: 'var(--color-accent-ink, #FFFFFF)',
          soft: 'var(--color-accent-soft, #FFF3E0)',
        },
        highlight: 'var(--color-highlight, #F5A524)',
        risk: {
          high: {
            bg: 'var(--color-risk-high-bg, #FDECEA)',
            border: 'var(--color-risk-high-border, #B42318)',
            text: 'var(--color-risk-high-text, #7A1410)',
          },
          medium: {
            bg: 'var(--color-risk-med-bg, #FFF4DB)',
            border: 'var(--color-risk-med-border, #B54708)',
            text: 'var(--color-risk-med-text, #6B2E05)',
          },
          low: {
            bg: 'var(--color-risk-low-bg, #EEF2F7)',
            border: 'var(--color-risk-low-border, #475467)',
            text: 'var(--color-risk-low-text, #1D2939)',
          },
          unverified: {
            bg: 'var(--color-risk-unverified-bg, #F3F0FA)',
            border: 'var(--color-risk-unverified-border, #5B4B8A)',
            text: 'var(--color-risk-unverified-text, #2E2552)',
          },
        },
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 24, 31, 0.04), 0 8px 24px rgba(20, 24, 31, 0.06)',
        card: '0 2px 8px -2px rgba(20, 24, 31, 0.08), 0 1px 4px -1px rgba(20, 24, 31, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
