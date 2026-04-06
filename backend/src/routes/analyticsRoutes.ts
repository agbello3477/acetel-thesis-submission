import express from 'express';
import { getDashboardStats, logActivity, getActivityLogs } from '../controllers/analyticsController';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', authenticate, authorizeRole(['admin']), getDashboardStats);
router.post('/activity', authenticate, logActivity);
router.get('/activity', authenticate, authorizeRole(['admin']), getActivityLogs);

export default router;
