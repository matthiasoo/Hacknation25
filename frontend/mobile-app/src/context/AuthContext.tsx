import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';
import { User, AuthState } from '../types/auth';

interface AuthContextData extends AuthState {
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    restoreToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
    });

    const restoreToken = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const userString = await SecureStore.getItemAsync('user');

            if (token && userString) {
                // Optional: Validate token with backend here
                setState({
                    token,
                    user: JSON.parse(userString),
                    isLoading: false,
                });
            } else {
                setState({ token: null, user: null, isLoading: false });
            }
        } catch (e) {
            console.error('Restoring token failed', e);
            setState({ token: null, user: null, isLoading: false });
        }
    };

    const signIn = async (token: string, user: User) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        setState({ token, user, isLoading: false });
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        setState({ token: null, user: null, isLoading: false });
    };

    useEffect(() => {
        restoreToken();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, signIn, signOut, restoreToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
