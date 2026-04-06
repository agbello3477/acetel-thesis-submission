import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwtLib from 'jsonwebtoken';
import { query } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_atss';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, matric_number, email, role, program_type, phone_number, staff_id, password } = req.body;

        if (!email || !email.toLowerCase().endsWith('@noun.edu.ng')) {
            res.status(400).json({ error: 'Only @noun.edu.ng email domains are allowed' });
            return;
        }

        if (role !== 'admin' && (!matric_number || !matric_number.toUpperCase().startsWith('ACE'))) {
            res.status(400).json({ error: 'Matric number must start with ACE' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await query(
            `INSERT INTO users (full_name, matric_number, email, role, program_type, phone_number, staff_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, email, role`,
            [
                full_name ?? null, 
                matric_number ?? null, 
                email ?? null, 
                role || 'student', 
                program_type ?? null, 
                phone_number ?? null, 
                staff_id ?? null, 
                password_hash
            ]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({ error: 'Matric number or email already exists' });
            return;
        }
        console.error('Registration Error Details:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        if (user.is_blocked) {
            res.status(403).json({ error: 'Your account has been suspended by the administrator.' });
            return;
        }

        const payload = {
            id: user.id,
            role: user.role,
            email: user.email
        };

        const token = jwtLib.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role, program_type: user.program_type, matric_number: user.matric_number } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (user.email !== 'agbello@noun.edu.ng') {
            res.status(403).json({ error: 'Access denied. Super Admin strictly required.' });
            return;
        }

        const result = await query('SELECT id, full_name, email, role, phone_number, program_type, matric_number, is_blocked, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (user.email !== 'agbello@noun.edu.ng') {
            res.status(403).json({ error: 'Access denied. Super Admin strictly required.' });
            return;
        }
        const { id } = req.params;
        const { is_blocked } = req.body; // true or false
        
        await query('UPDATE users SET is_blocked = $1 WHERE id = $2', [is_blocked, id]);
        res.json({ message: `User mathematically ${is_blocked ? 'blocked' : 'unblocked'}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error modifying user block status' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (user.email !== 'agbello@noun.edu.ng') {
            res.status(403).json({ error: 'Access denied. Super Admin strictly required.' });
            return;
        }
        const { id } = req.params;
        
        await query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User completely removed from system' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting user' });
    }
};
