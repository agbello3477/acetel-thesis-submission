import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwtLib from 'jsonwebtoken';
import { query } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_atss';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, matric_number, email, role, program_type, phone_number, staff_id, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await query(
            `INSERT INTO users (full_name, matric_number, email, role, program_type, phone_number, staff_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, email, role`,
            [full_name, matric_number, email, role || 'student', program_type, phone_number, staff_id, password_hash]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({ error: 'Matric number or email already exists' });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Server error' });
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

        const payload = {
            id: user.id,
            role: user.role,
            email: user.email
        };

        const token = jwtLib.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role, program_type: user.program_type } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
