export const theme = {
    colors: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#2196F3', // Friendly Blue
        secondary: '#FF9800', // Warm Orange
        accent: '#4CAF50', // Nature Green
        text: '#212121',
        textSecondary: '#757575',
        error: '#D32F2F',
        success: '#388E3C',
        overlay: 'rgba(255, 255, 255, 0.8)',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 20,
        xl: 30,
    },
    typography: {
        h1: { fontSize: 28, fontWeight: '700' as const, color: '#212121' },
        h2: { fontSize: 22, fontWeight: '700' as const, color: '#212121' },
        h3: { fontSize: 18, fontWeight: '600' as const, color: '#212121' },
        body: { fontSize: 16, fontWeight: '400' as const, color: '#424242' },
        caption: { fontSize: 12, fontWeight: '400' as const, color: '#757575' },
        button: { fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF' },
    },
    shadows: {
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        glow: {
            shadowColor: '#2196F3',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
        },
    },
};

export type Theme = typeof theme;
