import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';

// Import utilities and services
import { AppError, errorHandler } from './utils/error.utils';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse cookies
app.use(cookieParser());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Implement CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/v1/auth', authRoutes);

// Serve the HTML UI for undefined API routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle undefined API routes
app.all('/api/*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solar-investment';

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Try to verify email connection if available
    try {
      const emailUtils = require('./utils/email.utils');
      if (typeof emailUtils.verifyConnection === 'function') {
        emailUtils.verifyConnection().catch((err: Error) => {
          console.warn('Email verification failed:', err.message);
          console.warn('Email sending might not work properly. Check your SMTP settings.');
        });
      }
    } catch (err: unknown) {
      console.warn('Email verification not available');
    }

    // Start server
    const port = process.env.PORT || 5000;
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API available at http://localhost:${port}/api/v1`);
      console.log(`UI available at http://localhost:${port}`);
    });
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
