import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', authenticate, authorizeRole(['admin']), getDashboardStats);

export default router;
