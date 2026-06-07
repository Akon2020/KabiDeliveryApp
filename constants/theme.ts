export const theme = {
  primary: "#0A8F7B",
  primaryLight: "#E6F5F2",
  primaryDark: "#076B5C",
  accent: "#FF7A1A",
  accentLight: "#FFF0E6",
  bg: "#F7FAF9",
  surface: "#FFFFFF",
  text: "#0B1728",
  textSecondary: "#6B7A8D",
  textLight: "#9BA8B7",
  success: "#22C55E",
  successLight: "#DCFCE7",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  border: "#E8EEF2",
  divider: "#F1F5F8",
} as const;

export const Colors = {
  light: {
    text: theme.text,
    background: theme.bg,
    tint: theme.primary,
    tabIconDefault: theme.textLight,
    tabIconSelected: theme.primary,
    icon: theme.textSecondary,
  },
  dark: {
    text: '#F1F5F8',
    background: '#0B1728',
    tint: theme.primary,
    tabIconDefault: '#6B7A8D',
    tabIconSelected: theme.primary,
    icon: '#9BA8B7',
  },
} as const;
