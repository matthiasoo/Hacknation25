import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { getVisitedLocations } from '../api/users';
import { LocationData } from '../types/location';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = () => {
    const { signOut, user } = useAuth();
    const [visited, setVisited] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            setLoading(true);
            getVisitedLocations(user.id)
                .then(setVisited)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const renderItem = ({ item }: { item: LocationData }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/50' }} style={styles.thumbnail} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
                </View>
                <Text style={theme.typography.h2}>{user?.firstName} {user?.lastName}</Text>
                <Text style={theme.typography.caption}>Points: {user?.totalPoints || 0}</Text>
            </View>

            <Text style={styles.sectionTitle}>Visited Locations</Text>

            {loading ? (
                <ActivityIndicator color={theme.colors.primary} />
            ) : (
                <FlatList
                    data={visited}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No locations visited yet.</Text>}
                />
            )}

            <GradientButton title="Logout" onPress={signOut} style={styles.logoutButton} colors={[theme.colors.error, theme.colors.error]} />
        </View>
    );
};
import { Image } from 'react-native'; // Added missing import

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    avatarText: {
        ...theme.typography.h1,
        color: theme.colors.primary,
    },
    sectionTitle: {
        ...theme.typography.h3,
        marginBottom: theme.spacing.m,
    },
    list: {
        paddingBottom: 80,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
        alignItems: 'center',
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: theme.spacing.m,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        ...theme.typography.body,
        fontWeight: '600',
    },
    itemCategory: {
        ...theme.typography.caption,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.l,
    },
    logoutButton: {
        marginTop: theme.spacing.l,
    },
});
