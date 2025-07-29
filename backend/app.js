import express, { json } from 'express';
const app = express();
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import dotenv from 'dotenv';
import cors from "cors"

dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(json());


// ✅ More secure CORS
const allowedOrigins = [
  'http://localhost:9002',
  'https://civic-connect-omega.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (e.g., Postman) or allowed domains
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
// app.use('/api/cart', cartRoutes);

export default app;
