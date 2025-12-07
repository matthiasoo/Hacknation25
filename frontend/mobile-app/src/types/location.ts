export enum LocationCategory {
    MEMORIAL = 'MEMORIAL',
    BUILDING = 'BUILDING',
    MUSEUM = 'MUSEUM',
    PARK = 'PARK',
    OTHER = 'OTHER',
}

export interface LocationDescription {
    id: string;
    year: number;
    description: string;
    audioUrl?: string;
    imageUrl?: string;
}

export interface LocationData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    category: LocationCategory;
    imageUrl?: string;
    description?: string;
    timeline?: LocationDescription[];
}
