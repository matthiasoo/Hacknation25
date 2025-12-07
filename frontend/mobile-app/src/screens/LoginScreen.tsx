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
            Alert.alert('Wymagane', 'Proszę podać imię');
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
        const lastName = 'GG';

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
                Alert.alert('Błąd', `Błąd serwera: ${e.response.status} - ${e.response.data.message || e.message}`);
            } else {
                Alert.alert('Błąd', 'Nie można uzyskać dostępu do systemu. Spróbuj ponownie.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPress = () => {
        Alert.alert('Rejestracja', 'Rejestracja jest obecnie wyłączona. Zaloguj się podając imię.');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={theme.typography.h1}>BydgoszczGo!</Text>
                    <Text style={styles.subtitle}>Odkrywaj historię</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Podaj imie"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="np. Jan"
                        autoCapitalize="words"
                    />

                    <GradientButton
                        title="Start"
                        onPress={handleLogin}
                        isLoading={loading}
                        style={styles.button}
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
        marginBottom: 60,
        alignItems: 'center',
    },
    subtitle: {
        ...theme.typography.caption,
        fontSize: 22,
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
