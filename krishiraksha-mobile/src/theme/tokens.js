// Unified Design Tokens for KrishiRaksha Mobile

export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#059669',        // Emerald 600
    primaryLight: '#10b981',   // Emerald 500
    primaryDark: '#047857',    // Emerald 700
    primaryBg: '#ecfdf5',      // Emerald 50
    secondary: '#0284c7',      // Sky 600
    accent: '#d97706',         // Amber 600
    background: '#f8fafc',     // Slate 50
    card: '#ffffff',
    surface: '#ffffff',
    text: '#0f172a',           // Slate 900
    textSecondary: '#475569',  // Slate 600
    textMuted: '#94a3b8',      // Slate 400
    border: '#e2e8f0',         // Slate 200
    borderLight: '#f1f5f9',    // Slate 100
    danger: '#dc2626',         // Red 600
    dangerBg: '#fef2f2',
    warning: '#d97706',        // Amber 600
    warningBg: '#fffbeb',
    success: '#16a34a',        // Green 600
    successBg: '#f0fdf4',
    tabBarBg: '#ffffff',
    tabBarBorder: '#e2e8f0',
    tabBarActive: '#059669',
    tabBarInactive: '#94a3b8',
    statusBar: 'dark-content',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    liveDot: '#22c55e',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
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
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#10b981',        // Emerald 500
    primaryLight: '#34d399',   // Emerald 400
    primaryDark: '#059669',    // Emerald 600
    primaryBg: '#064e3b',      // Emerald 900
    secondary: '#38bdf8',      // Sky 400
    accent: '#fbbf24',         // Amber 400
    background: '#090d16',     // Deep slate dark
    card: '#131b2e',
    surface: '#182238',
    text: '#f8fafc',           // Slate 50
    textSecondary: '#cbd5e1',  // Slate 300
    textMuted: '#64748b',      // Slate 500
    border: '#23304a',
    borderLight: '#1b263b',
    danger: '#ef4444',
    dangerBg: '#450a0a',
    warning: '#f59e0b',
    warningBg: '#451a03',
    success: '#22c55e',
    successBg: '#052e16',
    tabBarBg: '#101726',
    tabBarBorder: '#1e293b',
    tabBarActive: '#10b981',
    tabBarInactive: '#64748b',
    statusBar: 'light-content',
    glassBg: 'rgba(19, 27, 46, 0.85)',
    liveDot: '#4ade80',
  },
  spacing: lightTheme.spacing,
  radii: lightTheme.radii,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};
