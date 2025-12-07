import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your actual backend URL here. For Android Emulator use 10.0.2.2.
// For physical device, use your machine's LAN IP or the deployed URL.
// Use your actual backend URL here. For Android Emulator use 10.0.2.2.
// For physical device, use your machine's LAN IP or the deployed URL.
const BASE_URL = 'http://10.0.2.2:3000'; // Localhost for Android Emulator

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
