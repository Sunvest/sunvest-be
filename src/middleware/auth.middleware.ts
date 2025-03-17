import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error.utils';
import User from '../models/user.model';
import { verifyToken } from '../utils/auth.utils';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from headers or cookies
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // 2) Check if token exists
    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access.', 401)
      );
    }

    // 3) Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(
        new AppError('Invalid token or token has expired. Please log in again.', 401)
      );
    }

    // 4) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 5) Set user in request for future use
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed. Please log in again.', 401));
  }
};

/**
 * Middleware to check if user email is verified
 */
export const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user.isEmailVerified) {
    return next(
      new AppError('Please verify your email address to continue.', 403)
    );
  }
  next();
}; 