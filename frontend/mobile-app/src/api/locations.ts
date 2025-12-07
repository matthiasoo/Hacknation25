import client from './client';
import { LocationData } from '../types/location';

export const getLocations = async (): Promise<LocationData[]> => {
    const { data } = await client.get('/locations');
    return data.data.locations;
};

export const getLocationById = async (id: string): Promise<{ location: LocationData; isNewDiscovery: boolean; pointsAwarded: number }> => {
    const { data } = await client.get(`/locations/${id}`);
    return {
        location: data.data.location,
        isNewDiscovery: data.isNewDiscovery,
        pointsAwarded: data.pointsAwarded
    };
};
