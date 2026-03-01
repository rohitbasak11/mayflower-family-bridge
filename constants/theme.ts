export const theme = {
    colors: {
        primary: '#4F46E5',      // Indigo
        secondary: '#EEF2FF',    // Light Indigo
        accent: '#FCD34D',       // Amber
        success: '#10B981',      // Emerald
        warning: '#F59E0B',      // Amber
        error: '#EF4444',        // Rose
        info: '#3B82F6',         // Blue
        background: '#FFFFFF',   // White
        surface: '#F9FAFB',      // Lightest gray
        card: '#FFFFFF',
        border: '#E5E7EB',
        text: {
            primary: '#111827',  // Slate 900
            secondary: '#4B5563',// Slate 600
            tertiary: '#9CA3AF', // Slate 400
            inverse: '#FFFFFF',
        }
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },
    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '700' as const,
            lineHeight: 40,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700' as const,
            lineHeight: 32,
            letterSpacing: -0.5,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600' as const,
            lineHeight: 28,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
            lineHeight: 24,
        },
        bodyMedium: {
            fontSize: 16,
            fontWeight: '500' as const,
            lineHeight: 24,
        },
        bodySemiBold: {
            fontSize: 16,
            fontWeight: '600' as const,
            lineHeight: 24,
        },
        bodySmall: {
            fontSize: 14,
            fontWeight: '400' as const,
            lineHeight: 20,
        },
        bodySmallSemiBold: {
            fontSize: 14,
            fontWeight: '600' as const,
            lineHeight: 20,
        },
        caption: {
            fontSize: 12,
            fontWeight: '500' as const,
            lineHeight: 16,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
        },
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 5,
        },
    }
};

export type Theme = typeof theme;
