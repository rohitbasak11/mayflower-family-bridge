import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
}: ButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary' && styles.primaryButton,
                variant === 'secondary' && styles.secondaryButton,
                variant === 'outline' && styles.outlineButton,
                variant === 'ghost' && styles.ghostButton,
                variant === 'link' && styles.linkButton,
                (disabled || loading) && styles.disabledButton,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' || variant === 'link' ? theme.colors.primary : theme.colors.text.inverse} />
            ) : (
                <Text
                    style={[
                        styles.buttonText,
                        variant === 'primary' && styles.primaryButtonText,
                        variant === 'secondary' && styles.secondaryButtonText,
                        variant === 'outline' && styles.outlineButtonText,
                        variant === 'ghost' && styles.ghostButtonText,
                        variant === 'link' && styles.linkButtonText,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    secondaryButton: {
        backgroundColor: theme.colors.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    linkButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
        minHeight: 0,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        ...theme.typography.bodySemiBold,
    },
    primaryButtonText: {
        color: theme.colors.text.inverse,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
    },
    outlineButtonText: {
        color: theme.colors.primary,
    },
    ghostButtonText: {
        color: theme.colors.text.secondary,
    },
    linkButtonText: {
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
});
