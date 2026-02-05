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

const lightBase = {
  '--color-bg-base': '#ffffff', // Pure White
  '--color-bg-surface': '#f8fafc', // Slate 50
  '--color-bg-muted': '#f1f5f9', // Slate 100
  '--color-border': '#e2e8f0', // Slate 200
  '--color-text-primary': '#0f172a', // Slate 900
  '--color-text-secondary': '#64748b', // Slate 500
  '--color-text-accent': '#ffffff',
};

const trueDarkBase = {
  '--color-bg-base': '#111111', // Matte Black
  '--color-bg-surface': '#1c1c1c', // Off-Black
  '--color-bg-muted': '#2a2a2a', // Dark Grey
  '--color-border': '#2a2a2a', // Subtle Grey
  '--color-text-primary': '#ffffff', // White
  '--color-text-secondary': '#a1a1aa', // Zinc 400
  '--color-text-accent': '#ffffff',
};

export const themes: Theme[] = [
  // --- Dark Modes (Default) ---
  {
    name: 'Asylab Blue (Dark)',
    mode: 'dark',
    colors: { ...trueDarkBase, '--color-brand-accent': '#0065ff' },
  },
  {
    name: 'Asylab Purple (Dark)',
    mode: 'dark',
    colors: { ...trueDarkBase, '--color-brand-accent': '#8b5cf6' },
  },
  {
    name: 'Asylab Pink (Dark)',
    mode: 'dark',
    colors: { ...trueDarkBase, '--color-brand-accent': '#f43f5e' },
  },
  {
    name: 'Asylab Orange (Dark)',
    mode: 'dark',
    colors: { ...trueDarkBase, '--color-brand-accent': '#f97316' },
  },
  {
    name: 'Asylab Yellow (Dark)',
    mode: 'dark',
    colors: { ...trueDarkBase, '--color-brand-accent': '#eab308' },
  },

  // --- Light Modes ---
  {
    name: 'Asylab Blue (Light)',
    mode: 'light',
    colors: { ...lightBase, '--color-brand-accent': '#0065ff' },
  },
  {
    name: 'Asylab Purple (Light)',
    mode: 'light',
    colors: { ...lightBase, '--color-brand-accent': '#8b5cf6' },
  },
  {
    name: 'Asylab Pink (Light)',
    mode: 'light',
    colors: { ...lightBase, '--color-brand-accent': '#f43f5e' },
  },
  {
    name: 'Asylab Orange (Light)',
    mode: 'light',
    colors: { ...lightBase, '--color-brand-accent': '#f97316' },
  },
  {
    name: 'Asylab Yellow (Light)',
    mode: 'light',
    colors: { ...lightBase, '--color-brand-accent': '#eab308' },
  },
];
