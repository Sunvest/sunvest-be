import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { catchAsync } from '../utils/error.utils';
import { AppError } from '../utils/error.utils';

/**
 * Get the authenticated user's profile data
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // req.user should be set by the auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not found', 404));
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
); 