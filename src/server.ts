import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import projectsRoutes from './routes/projectRoutes';

// Load environment variables
dotenv.config();

// Connection to database
connectDB();

// Create an Express application
const app = express();

// Config to receive JSON data
app.use(express.json());

// Routes
app.use('/api/projects', projectsRoutes);

export default app;