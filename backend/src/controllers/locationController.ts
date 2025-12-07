import { Request, Response, NextFunction } from 'express';
import { LocationCategory } from '@prisma/client';
import prisma from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { haversineDistance } from '../utils/haversine';

export const getAllLocations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;
    const filter: any = {};

    if (category && Object.values(LocationCategory).includes(category as LocationCategory)) {
        filter.category = category;
    }

    const locations = await prisma.location.findMany({
        where: filter,
        select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            category: true,
            imageUrl: true,
        },
    });

    res.status(200).json({
        status: 'success',
        results: locations.length,
        data: { locations },
    });
});

export const getLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user; // From protect middleware if available

    const location = await prisma.location.findUnique({
        where: { id },
    });

    if (!location) {
        return next(new AppError('Location not found', 404));
    }

    let isNewDiscovery = false;
    let pointsAwarded = 0;

    // Check-in logic: if user is logged in
    if (user) {
        const existingVisit = await prisma.userLocations.findUnique({
            where: {
                userId_locationId: {
                    userId: user.id,
                    locationId: id,
                },
            },
        });

        if (!existingVisit) {
            // First visit! Award points.
            isNewDiscovery = true;
            pointsAwarded = 1; // 1 point per visit

            // Transaction to ensure data integrity
            await prisma.$transaction([
                prisma.userLocations.create({
                    data: {
                        userId: user.id,
                        locationId: id,
                    },
                }),
                prisma.user.update({
                    where: { id: user.id },
                    data: {
                        totalPoints: {
                            increment: pointsAwarded,
                        },
                    },
                }),
            ]);
        }
    }

    res.status(200).json({
        status: 'success',
        isNewDiscovery,
        pointsAwarded,
        data: { location },
    });
});

export const createLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, latitude, longitude, category, imageUrl, description } = req.body;

    const newLocation = await prisma.location.create({
        data: {
            name,
            latitude,
            longitude,
            category,
            imageUrl,
            description,
        },
    });

    res.status(201).json({
        status: 'success',
        data: { location: newLocation },
    });
});

export const getNearestUnvisited = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('Authentication required', 401));
    }

    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
        return next(new AppError('Please provide valid lat and lon query parameters', 400));
    }

    // 1. Get IDs of visited locations
    const visited = await prisma.userLocations.findMany({
        where: { userId: req.user.id },
        select: { locationId: true },
    });
    const visitedIds = visited.map((v) => v.locationId);

    // 2. Get all unvisited locations
    const unvisitedLocations = await prisma.location.findMany({
        where: {
            id: { notIn: visitedIds },
        },
    });

    if (unvisitedLocations.length === 0) {
        return res.status(200).json({
            status: 'success',
            message: 'All locations visited!',
            data: null,
        });
    }

    // 3. Calculate distances and find nearest
    let nearestLoc = null;
    let minDistance = Infinity;

    unvisitedLocations.forEach((loc) => {
        const dist = haversineDistance(lat, lon, loc.latitude, loc.longitude);
        if (dist < minDistance) {
            minDistance = dist;
            nearestLoc = loc;
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            location: nearestLoc,
            distance: minDistance, // in meters
        },
    });
});

export const getLocationTimeline = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const timeline = await prisma.locationDescription.findMany({
        where: { locationId: id },
        orderBy: { year: 'asc' },
    });

    res.status(200).json({
        status: 'success',
        results: timeline.length,
        data: { timeline },
    });
});

export const addTimelineEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { year, description, audioUrl, imageUrl } = req.body;

    const event = await prisma.locationDescription.create({
        data: {
            locationId: id,
            year,
            description,
            audioUrl,
            imageUrl,
        },
    });

    res.status(201).json({
        status: 'success',
        data: { event },
    });
});

export const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categories = Object.values(LocationCategory);
    res.status(200).json({
        status: 'success',
        data: { categories },
    });
});
