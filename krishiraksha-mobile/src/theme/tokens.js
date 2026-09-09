// Unified Design Tokens for CultivAI Mobile (from Agritech System DESIGN.md)

export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#00652c',        // Deep Botanical Green
    primaryLight: '#15803d',   // Primary Container Green
    primaryDark: '#004c1f',    // Deep Forest Green
    primaryBg: '#eff7f1',      // Tinted Green Background
    secondary: '#904d00',      // Earth Amber
    secondaryContainer: '#fe932c', // Harvest Amber
    accent: '#fe932c',         // Harvest Amber
    tertiary: '#b20010',       // Outbreak Alert Red
    background: '#f8f9ff',     // Surface Soft Slate
    card: '#ffffff',
    surface: '#ffffff',
    surfaceContainerLow: '#eff4ff',
    surfaceContainer: '#e5eeff',
    surfaceContainerHigh: '#dce9ff',
    text: '#0b1c30',           // Deep Slate On-Surface
    textSecondary: '#3f493f',  // Medium On-Surface Variant
    textMuted: '#6f7a6e',      // Slate Outline
    border: '#becabc',         // Outline Variant
    borderLight: '#e2e8f0',    // Slate 100
    danger: '#b20010',         // Tertiary Alert Red
    dangerBg: '#ffdad6',       // Tertiary Fixed Container
    warning: '#fe932c',        // Harvest Amber Warning
    warningBg: '#fff3e0',
    success: '#00652c',        // Vitality Green
    successBg: '#e8f5e9',
    whatsapp: '#25D366',       // Official WhatsApp Green
    tabBarBg: '#ffffff',
    tabBarBorder: '#e2e8f0',
    tabBarActive: '#00652c',
    tabBarInactive: '#6f7a6e',
    statusBar: 'dark-content',
    glassBg: 'rgba(255, 255, 255, 0.88)',
    liveDot: '#00652c',
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
