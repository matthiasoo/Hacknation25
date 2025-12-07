import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { LocationDescription } from '../types/location';

interface TimelineItemProps {
    item: LocationDescription;
    isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLast }) => {
    return (
        <View style={styles.container}>
            <View style={styles.leftColumn}>
                <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{item.year}</Text>
                </View>
                {!isLast && <View style={styles.line} />}
            </View>
            <View style={styles.rightColumn}>
                <View style={styles.card}>
                    <Text style={styles.description}>{item.description}</Text>
                    {/* Image or Audio player could go here */}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    leftColumn: {
        alignItems: 'center',
        width: 60,
    },
    yearBadge: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    yearText: {
        ...theme.typography.button,
        color: theme.colors.background,
        fontSize: 12,
    },
    line: {
        flex: 1,
        width: 2,
        backgroundColor: theme.colors.surface,
        marginVertical: 4,
    },
    rightColumn: {
        flex: 1,
        paddingBottom: theme.spacing.l,
        paddingLeft: theme.spacing.s,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
});
