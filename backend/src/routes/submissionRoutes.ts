import express from 'express';
import { submitThesis, getSubmissions, getSubmissionById, updateSubmissionStatus, downloadThesis } from '../controllers/submissionController';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Student routes
router.post('/', authenticate, authorizeRole(['student']), upload.single('thesis'), submitThesis);
router.get('/my-submissions', authenticate, authorizeRole(['student']), getSubmissions);

// Admin routes
router.get('/', authenticate, authorizeRole(['admin']), getSubmissions);
router.get('/:id', authenticate, getSubmissionById);
router.get('/:id/download', authenticate, downloadThesis);
router.put('/:id/status', authenticate, authorizeRole(['admin']), updateSubmissionStatus);

export default router;
