import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface GradientButtonProps {
    onPress: () => void;
    title: string;
    colors?: [string, string, ...string[]];
    style?: ViewStyle;
    textStyle?: TextStyle;
    isLoading?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    onPress,
    title,
    colors = [theme.colors.primary, theme.colors.secondary],
    style,
    textStyle,
    isLoading = false,
}) => {
    return (
        <TouchableOpacity onPress={onPress} disabled={isLoading} style={[styles.container, style]}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {isLoading ? (
                    <ActivityIndicator color={theme.colors.text} />
                ) : (
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        shadowColor: theme.shadows.glow.shadowColor,
        shadowOffset: theme.shadows.glow.shadowOffset,
        shadowOpacity: theme.shadows.glow.shadowOpacity,
        shadowRadius: theme.shadows.glow.shadowRadius,
        elevation: theme.shadows.glow.elevation,
    },
    gradient: {
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...theme.typography.button,
        color: '#FFFFFF', // Force white text on buttons
    },
});
