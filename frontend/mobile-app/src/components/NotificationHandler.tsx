import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export const NotificationHandler = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            const { locationId } = data;

            if (locationId) {
                navigation.navigate('LocationDetail', { locationId });
            }
        });

        return () => subscription.remove();
    }, [navigation]);

    return null;
};
