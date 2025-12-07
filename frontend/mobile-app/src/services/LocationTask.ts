import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getLocations } from '../api/locations';
import { LocationData } from '../types/location';
import { getDistance } from 'geolib'; // Need to install geolib or implement haversine
import { Platform } from 'react-native';

export const LOCATION_TASK_NAME = 'background-location-task';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

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
            // ideally fetch from local storage to save battery/data
            const locations = await getLocations();

            for (const loc of locations) {
                const distance = getDistance(
                    { latitude: userLoc.coords.latitude, longitude: userLoc.coords.longitude },
                    { latitude: loc.latitude, longitude: loc.longitude }
                );

                // 100 meters threshold
                if (distance < 100) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "You are close!",
                            body: `Znajdujesz się obok ${loc.name}`,
                            data: { locationId: loc.id },
                        },
                        trigger: null, // show immediately
                    });
                    // TODO: Mark as notified to avoid spam
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
    if (backStatus !== 'granted') return;

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 50,
        foregroundService: {
            notificationTitle: "Visiting Bydgoszcz",
            notificationBody: "Tracking your location to find historical sites",
        }
    });
};
