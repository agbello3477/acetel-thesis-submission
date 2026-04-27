import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initMinio } from './config/minio';
import authRoutes from './routes/authRoutes';
import submissionRoutes from './routes/submissionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { checkSchema } from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize MinIO bucket
initMinio();
// Ensure database schema is up to date
checkSchema();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'ATSS Backend is running' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
