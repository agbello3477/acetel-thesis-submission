import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export const checkSchema = async () => {
    try {
        await query('ALTER TABLE submissions ADD COLUMN IF NOT EXISTS admin_feedback TEXT;');
        console.log('Schema verification: admin_feedback column ensured.');
    } catch (err) {
        console.error('Schema verification failed:', err);
    }
};

export default pool;
