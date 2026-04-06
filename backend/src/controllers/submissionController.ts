import { Request, Response } from 'express';
import { query } from '../config/db';
import { minioClient } from '../config/minio';
import { sendEmail } from '../config/mail';

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'atss-theses';

export const submitThesis = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, abstract, keywords, supervisor_name, submission_year } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'Thesis PDF file is required' });
            return;
        }

        // Validation
        if (!title || title.trim().length < 10) {
            res.status(400).json({ error: 'Title must be at least 10 characters long' });
            return;
        }
        if (!abstract || abstract.trim().length < 50) {
            res.status(400).json({ error: 'Abstract must be at least 50 characters long' });
            return;
        }
        if (!keywords || keywords.split(',').filter((k: string) => k.trim()).length < 2) {
            res.status(400).json({ error: 'At least 2 keywords are required' });
            return;
        }
        if (!supervisor_name || supervisor_name.trim().length < 3) {
            res.status(400).json({ error: 'Please provide valid supervisor name(s)' });
            return;
        }

        const currentYear = new Date().getFullYear();
        const year = parseInt(submission_year);
        if (isNaN(year) || year < 2000 || year > currentYear + 1) {
            res.status(400).json({ error: 'Invalid submission year' });
            return;
        }

        const user = (req as any).user;

        // Upload to MinIO
        const filePath = `${user.id}/${Date.now()}-${file.originalname}`;
        await minioClient.putObject(BUCKET_NAME, filePath, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        const file_size_mb = (file.size / (1024 * 1024)).toFixed(2);

        const result = await query(
            `INSERT INTO submissions (student_id, title, abstract, keywords, supervisor_name, file_path, file_size_mb, submission_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [user.id, title, abstract, keywords, supervisor_name, filePath, file_size_mb, year]
        );

        // Add log
        await query(
            `INSERT INTO submission_logs (submission_id, action_by, action_taken, comments) VALUES ($1, $2, $3, $4)`,
            [result.rows[0].id, user.id, 'Submitted', 'Initial submission uploaded']
        );

        res.status(201).json({ message: 'Thesis submitted successfully', submission: result.rows[0] });
    } catch (error: any) {
        console.error('Submission Error Details:', error);
        res.status(500).json({ error: error.message || 'Internal server error during submission' });
    }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        let result;

        if (user.role === 'admin') {
            result = await query(`
        SELECT s.*, u.full_name, u.matric_number, u.program_type, u.phone_number, u.staff_id
        FROM submissions s 
        JOIN users u ON s.student_id = u.id 
        ORDER BY s.created_at DESC
      `);
        } else {
            result = await query(`
                SELECT s.*, 
                       (SELECT comments FROM submission_logs l WHERE l.submission_id = s.id ORDER BY l.timestamp DESC LIMIT 1) as admin_comment
                FROM submissions s 
                WHERE student_id = $1 
                ORDER BY created_at DESC
            `, [user.id]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = (req as any).user;

        const result = await query(`
      SELECT s.*, u.full_name, u.matric_number, u.program_type 
      FROM submissions s 
      JOIN users u ON s.student_id = u.id 
      WHERE s.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        const submission = result.rows[0];

        // Access control
        if (user.role !== 'admin' && submission.student_id !== user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        // Get logs
        const logsResult = await query(`
        SELECT l.*, u.full_name as action_by_name 
        FROM submission_logs l 
        LEFT JOIN users u ON l.action_by = u.id 
        WHERE l.submission_id = $1 ORDER BY l.timestamp DESC`,
            [id]);

        submission.logs = logsResult.rows;

        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;
        const user = (req as any).user;

        const validStatuses = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Correction Required'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        if ((status === 'Rejected' || status === 'Correction Required') && (!comments || comments.trim().length < 5)) {
            res.status(400).json({ error: `Comments are required when status is ${status}` });
            return;
        }

        const result = await query(
            `UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        // Add log
        await query(
            `INSERT INTO submission_logs (submission_id, action_by, action_taken, comments) VALUES ($1, $2, $3, $4)`,
            [id, user.id, status, comments || `Status updated to ${status} by admin`]
        );

        // Fetch user details for notification
        const userResult = await query(`SELECT email, full_name FROM users WHERE id = (SELECT student_id FROM submissions WHERE id = $1)`, [id]);
        if (userResult.rows.length > 0) {
            const student = userResult.rows[0];
            try {
                await sendEmail(
                    student.email,
                    `ATSS: Thesis Submission Update - ${status}`,
                    `Dear ${student.full_name},\n\nYour thesis submission status has been updated to: ${status}.\n\nComments: ${comments || 'None'}\n\nRegards,\nATSS Admin`
                );
            } catch (mailError) {
                console.error('Email notification failed:', mailError);
                // We don't fail the request if email fails, but we log it
            }
        }

        res.json({ message: 'Submission status updated', submission: result.rows[0] });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Internal server error during status update' });
    }
};

export const downloadThesis = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = (req as any).user;

        const result = await query(`SELECT file_path, student_id FROM submissions WHERE id = $1`, [id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        const submission = result.rows[0];

        // Access control: admins and the owning student can download
        if (user.role !== 'admin' && submission.student_id !== user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        if (!submission.file_path) {
            res.status(404).json({ error: 'File path not found for this submission' });
            return;
        }

        const url = await minioClient.presignedGetObject(BUCKET_NAME, submission.file_path, 60 * 60); // 1 hour expiry
        
        res.json({ downloadUrl: url });
    } catch (error: any) {
        console.error('Download error:', error);
        res.status(500).json({ error: error.message || 'Internal server error generating download link' });
    }
};
