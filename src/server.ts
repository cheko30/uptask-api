import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import projectsRoutes from './routes/projectRoutes';
import { corsConfig } from './config/cors';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Connection to database
connectDB();

// Create an Express application
const app = express();

//CORS
app.use(cors(corsConfig))

// Logging
app.use(morgan('dev'))

// Config to receive JSON data
app.use(express.json());

// Routes
app.use('/api/projects', projectsRoutes);

export default app;