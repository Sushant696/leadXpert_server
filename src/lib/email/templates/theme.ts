export const emailTheme = {
  colors: {
    primary: {
      main: '#1E40AF',
      light: '#3B82F6',
      dark: '#1E3A8A',
    },
    accent: {
      main: '#FF6B6B',
      light: '#FF8E8E',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    status: {
      new: '#8B5CF6',
      inProgress: '#F59E0B',
      converted: '#10B981',
      lost: '#F87171',
    },
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    background: {
      main: '#FFFFFF',
      subtle: '#F8FAFC',
      muted: '#F1F5F9',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    }
  },

  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.8',
    }
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  containerWidth: {
    sm: '480px',
    md: '600px',
    lg: '720px',
  }
} as const;

export type EmailTheme = typeof emailTheme;

export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = emailTheme.colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || '#000000';
};

export const getSpacing = (size: keyof typeof emailTheme.spacing) => {
  return emailTheme.spacing[size];
};

export const getFontSize = (size: keyof typeof emailTheme.typography.fontSize) => {
  return emailTheme.typography.fontSize[size];
};
