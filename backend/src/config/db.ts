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
        
        // Backfill existing feedback from logs into the new column if it's currently NULL
        await query(`
            UPDATE submissions s
            SET admin_feedback = (
                SELECT comments 
                FROM submission_logs l 
                WHERE l.submission_id = s.id 
                AND l.comments IS NOT NULL 
                AND l.comments NOT LIKE 'Status updated to %'
                AND l.comments != 'Initial submission uploaded'
                ORDER BY l.timestamp DESC 
                LIMIT 1
            )
            WHERE admin_feedback IS NULL;
        `);
        
        console.log('Schema verification: admin_feedback column ensured and backfilled.');
    } catch (err) {
        console.error('Schema verification failed:', err);
    }
};

export default pool;
