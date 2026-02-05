export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    '--color-brand-accent': string;
    '--color-bg-base': string;
    '--color-bg-surface': string;
    '--color-bg-muted': string;
    '--color-border': string;
    '--color-text-primary': string;
    '--color-text-secondary': string;
    '--color-text-accent': string;
  };
}

const defaultLightColors = {
  '--color-bg-base': '#f8fafc',
  '--color-bg-surface': '#ffffff',
  '--color-bg-muted': '#f1f5f9',
  '--color-border': '#e2e8f0',
  '--color-text-primary': '#0f172a',
  '--color-text-secondary': '#64748b',
};

const defaultDarkColors = {
  '--color-bg-base': '#0f172a', // Slate 900
  '--color-bg-surface': '#1e293b', // Slate 800
  '--color-bg-muted': '#334155', // Slate 700
  '--color-border': '#334155', // Slate 700
  '--color-text-primary': '#f8fafc', // Slate 50
  '--color-text-secondary': '#94a3b8', // Slate 400
};

export const themes: Theme[] = [
  // Light Themes
  {
    name: 'Violeta (Claro)',
    mode: 'light',
    colors: {
      ...defaultLightColors,
      '--color-brand-accent': '#8b5cf6',
      '--color-text-accent': '#ffffff',
    },
  },
  {
    name: 'Violeta (Escuro)',
    mode: 'dark',
    colors: {
      ...defaultDarkColors,
      '--color-brand-accent': '#a78bfa', // Lighter violet for dark mode
      '--color-text-accent': '#ffffff',
    },
  },
  {
    name: 'Ocean (Claro)',
    mode: 'light',
    colors: {
      ...defaultLightColors,
      '--color-brand-accent': '#0ea5e9',
      '--color-text-accent': '#ffffff',
    },
  },
  {
    name: 'Ocean (Escuro)',
    mode: 'dark',
    colors: {
      ...defaultDarkColors,
      '--color-brand-accent': '#38bdf8',
      '--color-text-accent': '#ffffff',
    },
  },
  {
    name: 'Midnight (Premium)',
    mode: 'dark',
    colors: {
      '--color-bg-base': '#000000',
      '--color-bg-surface': '#111111',
      '--color-bg-muted': '#222222',
      '--color-border': '#333333',
      '--color-text-primary': '#ffffff',
      '--color-text-secondary': '#a1a1aa',
      '--color-brand-accent': '#fbbf24', // Amber gold
      '--color-text-accent': '#000000',
    },
  },
  {
    name: 'Forest (Escuro)',
    mode: 'dark',
    colors: {
      ...defaultDarkColors,
      '--color-bg-base': '#052e16', // Dark green
      '--color-bg-surface': '#064e3b',
      '--color-bg-muted': '#065f46',
      '--color-border': '#047857',
      '--color-brand-accent': '#34d399',
      '--color-text-accent': '#064e3b',
    },
  },
];
