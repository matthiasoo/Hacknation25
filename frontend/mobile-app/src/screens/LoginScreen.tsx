import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Input } from '../components/Input';
import { GradientButton } from '../components/GradientButton';
import { theme } from '../theme';

export const LoginScreen = () => {
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');

    const handleLogin = async () => {
        if (!username.trim()) {
            Alert.alert('Required', 'Please enter your name');
            return;
        }

        setLoading(true);
        // Hackathon Logic:
        // Generate an email/password from the username to satisfy backend requirements
        // without burdening the user.
        const normalizedName = username.trim().toLowerCase().replace(/\s+/g, '');
        const email = `${normalizedName}@hacknation.test`;
        const password = 'hackathon_default_pass';
        const firstName = username;
        const lastName = 'Guest';

        try {
            // 1. Try to Login first
            try {
                const { data } = await client.post('/auth/login', { email, password });
                // Note: Backend structure is { status, token, data: { user: {...} } }
                await signIn(data.token, data.data.user);
                return;
            } catch (loginErr: any) {
                // 2. If login fails (400/401), try to Register
                if (loginErr.response && (loginErr.response.status === 400 || loginErr.response.status === 401 || loginErr.response.status === 404)) {
                    const { data: regData } = await client.post('/auth/register', { email, password, firstName, lastName });
                    if (regData.token) {
                        await signIn(regData.token, regData.data.user);
                    } else {
                        // Fallback if register doesn't return token immediately
                        const { data: loginData } = await client.post('/auth/login', { email, password });
                        await signIn(loginData.token, loginData.data.user);
                    }
                } else {
                    throw loginErr;
                }
            }
        } catch (e: any) {
            console.error("Login failed:", e);
            if (e.response) {
                console.error("Response data:", e.response.data);
                Alert.alert('Error', `Server Error: ${e.response.status} - ${e.response.data.message || e.message}`);
            } else {
                Alert.alert('Error', 'Could not access the system. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPress = () => {
        Alert.alert('Registration', 'Registration is currently disabled. Please just log in with your name.');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={theme.typography.h1}>Bydgoszcz</Text>
                    <Text style={theme.typography.h2}>Ścieżki Pamięci</Text>
                    <Text style={styles.subtitle}>Discover History</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="What is your name?"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="e.g. Explorer Jan"
                        autoCapitalize="words"
                    />

                    <GradientButton
                        title="Start Exploring"
                        onPress={handleLogin}
                        isLoading={loading}
                        style={styles.button}
                    />

                    <GradientButton
                        title="Register"
                        onPress={handleRegisterPress}
                        style={[styles.button, styles.disabledButton]}
                        colors={['#E0E0E0', '#BDBDBD']}
                        textStyle={{ color: '#757575' }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing.l,
    },
    header: {
        marginBottom: theme.spacing.xxl,
        alignItems: 'center',
    },
    subtitle: {
        ...theme.typography.caption,
        fontSize: 16,
        marginTop: theme.spacing.s,
        color: theme.colors.primary,
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing.m,
    },
    disabledButton: {
        marginTop: theme.spacing.l,
        opacity: 0.8,
    },
});
