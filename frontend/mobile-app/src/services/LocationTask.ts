// Actually fix imports
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { getLocations, getLocationById } from '../api/locations';
import client from '../api/client';
import { getDistance } from 'geolib';
import { Platform } from 'react-native';

export const LOCATION_TASK_NAME = 'background-location-task';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

// Create a channel for high priority notifications (Android)
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('proximity-alert', {
        name: 'Proximity Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
    });
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        const { locations: userLocations } = data;
        const userLoc = userLocations[0]; // Most recent location

        if (!userLoc) return;

        try {
            // Get Token
            const token = await SecureStore.getItemAsync('token');
            const userString = await SecureStore.getItemAsync('user');

            // If no token, maybe we shouldn't track or just show generic info?
            // Continuing for now.

            const locations = await getLocations();
            let visitedIds = new Set<string>();

            if (userString) {
                const user = JSON.parse(userString);
                // Optimally we'd fetch visited locations here, but that might be expensive on every BG update
                // For MVP, we can try to fetch, or rely on local storage if we synced it.
                // Let's invoke the API to be safe and accurate
                try {
                    const { data: visitedData } = await client.get(`/users/${user.id}/visited`);
                    if (visitedData?.data?.visited) {
                        visitedData.data.visited.forEach((v: any) => visitedIds.add(v.locationId || v.id));
                    }
                } catch (e) {
                    console.log("BG: Failed to fetch visited");
                }
            }

            for (const loc of locations) {
                if (visitedIds.has(loc.id)) continue;

                const distance = getDistance(
                    { latitude: userLoc.coords.latitude, longitude: userLoc.coords.longitude },
                    { latitude: loc.latitude, longitude: loc.longitude }
                );

                // 50 meters threshold
                if (distance < 50) {
                    // Check-in
                    if (token) {
                        try {
                            await getLocationById(loc.id);
                            console.log(`BG: Checked in to ${loc.name}`);
                        } catch (e) {
                            console.error("BG: Check-in failed", e);
                        }
                    }

                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Jesteś blisko!",
                            body: `Odkryłeś: ${loc.name}`,
                            data: { locationId: loc.id },
                            sound: 'default', // iOS
                            categoryIdentifier: 'default',
                        },
                        trigger: { // Use channelId for Android
                            channelId: 'proximity-alert',
                            seconds: 1 // Trigger essentially immediately but satisfying type requirement if needed, or use null
                        } as any, // casting because trigger: null is valid but sometimes types complain with channelId context
                    });
                }
            }
        } catch (err) {
            console.error("Background task error", err);
        }
    }
});

export const startLocationUpdates = async () => {
    const { status: foreStatus } = await Location.requestForegroundPermissionsAsync();
    if (foreStatus !== 'granted') return;

    const { status: backStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backStatus !== 'granted') {
        console.log("Background permission denied");
        return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 20000, // 20 seconds
        distanceInterval: 10, // 10 meters
        foregroundService: {
            notificationTitle: "Bydgoszcz - Ścieżki Pamięci",
            notificationBody: "Śledzenie lokalizacji w celu odkrywania miejsc...",
        },
        showsBackgroundLocationIndicator: true // iOS
    });
};
