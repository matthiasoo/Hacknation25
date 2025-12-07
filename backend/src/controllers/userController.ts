import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // req.user is set by authentication middleware
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            totalPoints: true,
            createdAt: true,
        },
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

export const getVisitedLocations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id; // Or req.user.id depending on requirement. Spec says /users/{id}/visited

    const visited = await prisma.userLocations.findMany({
        where: { userId },
        include: {
            location: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
        status: 'success',
        results: visited.length,
        data: { visited },
    });
});
