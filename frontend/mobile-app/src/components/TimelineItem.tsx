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
                {/* Vertical Line */}
                <View style={[styles.line, isLast && styles.lineHidden]} />
                {/* Timeline Node */}
                <View style={styles.nodeContainer}>
                    <View style={styles.node} />
                </View>
            </View>

            <View style={styles.rightColumn}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.yearText}>{item.year}</Text>
                    </View>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    leftColumn: {
        width: 40,
        alignItems: 'center',
    },
    line: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: theme.colors.surface,
        left: 19, // Center of width 40 is 20, line width 2 -> 19
        zIndex: 0,
    },
    lineHidden: {
        bottom: '80%', // Hide the bottom part for the last item, or just set height. 
        // Better: let it run to the node and stop. 
        // If we want it to stop exactly at the node for the last item:
        height: 24, // Approx offset to node center
    },
    nodeContainer: {
        height: 48, // Match standard touch target/header height alignment
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    node: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    rightColumn: {
        flex: 1,
        paddingBottom: theme.spacing.l,
        paddingRight: theme.spacing.s,
    },
    card: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...theme.shadows.default,
    },
    header: {
        marginBottom: theme.spacing.s,
    },
    yearText: {
        ...theme.typography.h3,
        color: theme.colors.primary,
        fontSize: 18,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.text,
        lineHeight: 22,
    },
});
