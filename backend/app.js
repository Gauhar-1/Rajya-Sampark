import express, { json } from 'express';
const app = express();
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dotenv from 'dotenv';
import cors from "cors"

dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(json());


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

export default app;
