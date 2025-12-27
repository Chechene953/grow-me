export const colors = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    150: '#EEEEEE',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
    500: '#757575',
    600: '#616161',
    700: '#424242',
    800: '#303030',
    900: '#1A1A1A',
  },

  accent: {
    coral: '#FF6B6B',
    gold: '#FFB347',
    teal: '#4DB6AC',
    lavender: '#9575CD',
  },

  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  glass: {
    light: 'rgba(255, 255, 255, 0.85)',
    medium: 'rgba(255, 255, 255, 0.72)',
    dark: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
  circle: 9999,
};

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.25,
    lineHeight: 41,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 34,
  },
  title1: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title2: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  title3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.4,
    lineHeight: 23,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  callout: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  footnote: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  float: {
    shadowColor: colors.primary[800],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
    snappy: {
      damping: 15,
      stiffness: 200,
      mass: 0.8,
    },
    bouncy: {
      damping: 10,
      stiffness: 180,
      mass: 0.8,
    },
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
};
