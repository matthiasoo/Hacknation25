import client from './client';
import { LocationData } from '../types/location';

export const getMyProfile = async () => {
    const { data } = await client.get('/users/me');
    return data;
};

export const getVisitedLocations = async (userId: string): Promise<LocationData[]> => {
    const { data } = await client.get(`/users/${userId}/visited`);
    return data.data.visited;
};
