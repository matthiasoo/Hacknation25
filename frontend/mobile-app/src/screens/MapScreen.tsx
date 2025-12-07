import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Dimensions, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { getLocations, getLocationById } from '../api/locations';
import { getVisitedLocations } from '../api/users';
import { LocationData } from '../types/location';
import { useAuth } from '../context/AuthContext';
import { startLocationUpdates } from '../services/LocationTask';
import * as Notifications from 'expo-notifications';

// Simple Haversine for distance (meters)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Notification Handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const MapScreen = () => {
    const navigation = useNavigation<any>();
    const { user, refreshUser } = useAuth();
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

    console.log('Visited IDs:', [...visitedIds]);

    const [isReady, setIsReady] = useState(false);

    // 1. Get User Location Permission & Start Watcher
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Odmówiono dostępu do lokalizacji');
                return;
            }

            // Start watching position (Foreground for UI)
            await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 5
            }, (newLoc) => {
                setUserLocation(newLoc);
            });

            // Start Background Task
            startLocationUpdates().catch(e => console.error("Failed to start BG location", e));
        })();
    }, []);

    // 2. Fetch Data (Locations + Visited)
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch basic locations
                const allLocations = await getLocations();

                let initialVisited = new Set<string>();

                // Fetch visited if logged in
                if (user?.id) {
                    try {
                        const visitedList = await getVisitedLocations(user.id);
                        if (Array.isArray(visitedList)) {
                            // visitedList is Array of { locationId: string, ... } or LocationData depending on API fix
                            initialVisited = new Set(visitedList.map((v: any) => v.id || v.locationId));
                        }
                    } catch (e) {
                        console.error("Failed to fetch visited locations", e);
                    }
                }

                // Batch updates to avoid race conditions
                setLocations(allLocations);
                setVisitedIds(initialVisited);
                setIsReady(true);
            } catch (error) {
                console.error('Failed to fetch map data', error);
            }
        };
        loadData();
    }, [user]);

    // Proximity Check Logic (useEffect to prevent stale closures)
    useEffect(() => {
        if (!isReady || !userLocation || locations.length === 0) return;

        const checkMyProximity = async () => {
            locations.forEach(async (loc) => {
                // Skip if already visited
                if (visitedIds.has(loc.id)) return;

                const dist = getDistance(
                    userLocation.coords.latitude, userLocation.coords.longitude,
                    loc.latitude, loc.longitude
                );

                // Threshold: 50 meters
                if (dist < 50) {
                    console.log(`Discovered: ${loc.name}`);

                    // 1. Mark as visited locally immediately
                    setVisitedIds(prev => {
                        const next = new Set(prev);
                        next.add(loc.id);
                        return next;
                    });

                    // 2. Notification handled by background task now

                    // 3. Register visit on backend (Check-in)
                    try {
                        await getLocationById(loc.id);
                        if (refreshUser) await refreshUser(); // Refresh Global User State (points)
                        Alert.alert("Gratulacje!", `Odkryłeś nowe miejsce: ${loc.name}`);
                    } catch (e) {
                        console.error("Check-in failed", e);
                    }
                }
            });
        };

        checkMyProximity();
    }, [userLocation, locations, visitedIds]);

    const handleMarkerPress = (location: LocationData) => {
        navigation.navigate('LocationDetail', { locationId: location.id });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation
                showsMyLocationButton
                initialRegion={{
                    latitude: 53.1235, // Bydgoszcz
                    longitude: 18.0084,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {locations.map((loc) => {
                    const isVisited = visitedIds.has(loc.id);
                    return (
                        <Marker
                            key={`${loc.id}-${isVisited}`}
                            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                            title={loc.name}
                            description={loc.description}
                            onCalloutPress={() => handleMarkerPress(loc)}
                            pinColor={isVisited ? theme.colors.success : theme.colors.primary}
                        >
                            <Callout tooltip>
                                <View style={styles.callout}>
                                    <Text style={styles.calloutTitle}>
                                        {loc.name} {isVisited ? '✓' : ''}
                                    </Text>
                                    <Text style={styles.calloutDesc}>Kliknij, aby zobaczyć szczegóły</Text>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    callout: {
        backgroundColor: theme.colors.surface,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        width: 150,
    },
    calloutTitle: {
        color: theme.colors.text,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    calloutDesc: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
});
