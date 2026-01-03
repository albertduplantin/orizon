export type Theme = {
  name: string;
  displayName: string;
  colors: {
    // Base colors
    background: string;
    foreground: string;

    // Card/Surface colors
    card: string;
    cardForeground: string;

    // Primary brand colors
    primary: string;
    primaryForeground: string;

    // Secondary colors
    secondary: string;
    secondaryForeground: string;

    // Muted/subtle colors
    muted: string;
    mutedForeground: string;

    // Accent colors
    accent: string;
    accentForeground: string;

    // Destructive/error colors
    destructive: string;
    destructiveForeground: string;

    // Border and input colors
    border: string;
    input: string;
    ring: string;
  };

  // Glass effect properties
  glass: {
    blur: string;
    saturation: string;
    opacity: string;
    borderOpacity: string;
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

export const themes: Record<string, Theme> = {
  'liquid-glass': {
    name: 'liquid-glass',
    displayName: 'Liquid Glass',
    colors: {
      background: 'oklch(98% 0.01 250)',
      foreground: 'oklch(20% 0 0)',

      card: 'oklch(98% 0.01 250 / 0.7)',
      cardForeground: 'oklch(20% 0 0)',

      primary: 'oklch(65% 0.25 250)',
      primaryForeground: 'oklch(100% 0 0)',

      secondary: 'oklch(75% 0.20 300)',
      secondaryForeground: 'oklch(20% 0 0)',

      muted: 'oklch(92% 0.01 250)',
      mutedForeground: 'oklch(50% 0 0)',

      accent: 'oklch(85% 0.15 280)',
      accentForeground: 'oklch(20% 0 0)',

      destructive: 'oklch(60% 0.25 30)',
      destructiveForeground: 'oklch(100% 0 0)',

      border: 'oklch(90% 0.02 250 / 0.3)',
      input: 'oklch(90% 0.02 250 / 0.5)',
      ring: 'oklch(65% 0.25 250)',
    },
    glass: {
      blur: '20px',
      saturation: '180%',
      opacity: '0.7',
      borderOpacity: '0.3',
    },
    shadows: {
      sm: '0 2px 8px oklch(20% 0 0 / 0.05)',
      md: '0 4px 16px oklch(20% 0 0 / 0.08)',
      lg: '0 8px 32px oklch(20% 0 0 / 0.1)',
      xl: '0 12px 48px oklch(20% 0 0 / 0.12)',
    },
  },

  'dark-glass': {
    name: 'dark-glass',
    displayName: 'Dark Glass',
    colors: {
      background: 'oklch(15% 0.02 250)',
      foreground: 'oklch(95% 0 0)',

      card: 'oklch(20% 0.02 250 / 0.5)',
      cardForeground: 'oklch(95% 0 0)',

      primary: 'oklch(75% 0.25 250)',
      primaryForeground: 'oklch(10% 0 0)',

      secondary: 'oklch(70% 0.20 300)',
      secondaryForeground: 'oklch(95% 0 0)',

      muted: 'oklch(25% 0.02 250)',
      mutedForeground: 'oklch(70% 0 0)',

      accent: 'oklch(70% 0.20 280)',
      accentForeground: 'oklch(10% 0 0)',

      destructive: 'oklch(65% 0.25 30)',
      destructiveForeground: 'oklch(100% 0 0)',

      border: 'oklch(30% 0.02 250 / 0.4)',
      input: 'oklch(30% 0.02 250 / 0.6)',
      ring: 'oklch(75% 0.25 250)',
    },
    glass: {
      blur: '24px',
      saturation: '200%',
      opacity: '0.5',
      borderOpacity: '0.4',
    },
    shadows: {
      sm: '0 2px 8px oklch(0% 0 0 / 0.2)',
      md: '0 4px 16px oklch(0% 0 0 / 0.3)',
      lg: '0 8px 32px oklch(0% 0 0 / 0.4)',
      xl: '0 12px 48px oklch(0% 0 0 / 0.5)',
    },
  },
};

export const defaultTheme = 'liquid-glass';
