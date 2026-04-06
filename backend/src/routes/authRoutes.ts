import express from 'express';
import { login, register, getUsers, blockUser, deleteUser } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Super Admin routes
router.get('/users', authenticate, getUsers);
router.put('/users/:id/block', authenticate, blockUser);
router.delete('/users/:id', authenticate, deleteUser);

export default router;
