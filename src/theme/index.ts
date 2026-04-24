export const palette = {
  light: {
    primary: '#170C79',
    background: '#EFE3CA',
    accent: '#56B6C6',
    default: '#8ACBD0',
    surface: '#ffffff',
    text: '#170C79',
    textSecondary: '#6B7280',
    border: '#d1d5db',
  },
  dark: {
    primary: '#8E05C2',
    background: '#000000',
    accent: '#700B97',
    default: '#3E065F',
    surface: '#3E065F',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    border: '#4b5563',
  },
};

export const theme = {
  colors: palette.light, // Default to light
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
