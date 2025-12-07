import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getLocationById } from '../api/locations';
import { LocationData } from '../types/location';
import { theme } from '../theme';
import { GradientButton } from '../components/GradientButton';
import { TimelineItem } from '../components/TimelineItem';
import { LinearGradient } from 'expo-linear-gradient';

export const LocationDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { locationId } = route.params;
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { location, isNewDiscovery, pointsAwarded } = await getLocationById(locationId);
                setLocation(location);

                if (isNewDiscovery) {
                    Alert.alert(
                        "Odkryto zabytek!",
                        `Gratulacje! Odkryłeś nowe miejsce i otrzymujesz ${pointsAwarded} punktów.`
                    );
                }
            } catch (error) {
                console.error('Error fetching details', error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [locationId]);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
    }

    if (!location) {
        return <View style={styles.center}><Text style={styles.errorText}>Location not found</Text></View>;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: location.imageUrl || 'https://via.placeholder.com/400x200' }} style={styles.image} />
                <LinearGradient colors={['transparent', theme.colors.background]} style={styles.gradientOverlay} />

                <View style={styles.content}>
                    <Text style={theme.typography.h1}>{location.name}</Text>
                    <Text style={styles.category}>{location.category}</Text>

                    <Text style={styles.description}>{location.description}</Text>

                    <Text style={styles.sectionTitle}>Timeline</Text>
                    {location.timeline?.sort((a, b) => a.year - b.year).map((item, index) => (
                        <TimelineItem key={item.id} item={item} isLast={index === location.timeline!.length - 1} />
                    ))}

                    <GradientButton
                        title="Chat with Guide"
                        onPress={() => navigation.navigate('Chatbot', { locationId: location.id, locationName: location.name })}
                        style={styles.chatButton}
                        colors={[theme.colors.secondary, theme.colors.accent]}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    image: {
        width: '100%',
        height: 250,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 150,
        height: 100,
        width: '100%',
    },
    content: {
        padding: theme.spacing.m,
        marginTop: -theme.spacing.l,
    },
    category: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        marginBottom: theme.spacing.m,
    },
    description: {
        ...theme.typography.body,
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.m,
    },
    chatButton: {
        marginTop: theme.spacing.xl,
    },
    errorText: {
        color: theme.colors.error,
    }
});
