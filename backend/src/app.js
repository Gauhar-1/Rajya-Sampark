import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorConverter, errorHandler } from './middlewares/errorHandler.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse urlencoded bodies
app.use(compression()); // Gzip compression

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// CORS
const allowedOrigins = [
    'http://localhost:9002',
    'https://rajya-sampark.vercel.app',
];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

// Rate Limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/post', postRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling
app.use(errorConverter);
app.use(errorHandler);

export default app;
