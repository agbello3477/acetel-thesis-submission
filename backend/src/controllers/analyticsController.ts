import { Request, Response } from 'express';
import { query } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Submission Ratio calculation logic (MSc vs PhD)
        const ratioResult = await query(`
      SELECT u.program_type as name, COUNT(s.id) as value 
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      GROUP BY u.program_type
    `);

        // 2. Approval Rate Logic
        const statusResult = await query(`
      SELECT status, COUNT(*) as count 
      FROM submissions 
      GROUP BY status
    `);

        let total = 0;
        let approved = 0;
        statusResult.rows.forEach((row: any) => {
            total += parseInt(row.count, 10);
            if (row.status === 'Approved') approved += parseInt(row.count, 10);
        });
        const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

        // 3. Status Breakdown
        const statusBreakdown = statusResult.rows.map((row: any) => ({
            name: row.status,
            value: parseInt(row.count, 10)
        }));

        // 4. Monthly Trends
        const trendsResult = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM submissions
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);

        res.json({
            submissionRatio: ratioResult.rows,
            approvalRate: Number(approvalRate),
            totalSubmissions: total,
            statusBreakdown,
            monthlyTrends: trendsResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const logActivity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { action_type, target } = req.body;
        const user = (req as any).user;

        if (!action_type || !target) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        await query(
            `INSERT INTO activity_logs (user_id, action_type, target) VALUES ($1, $2, $3)`,
            [user?.id || null, action_type, target]
        );
        res.status(201).json({ message: 'Activity logged successfully' });
    } catch (error) {
        console.error('Activity logging failed:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await query(`
            SELECT a.*, u.full_name as user_name, u.role
            FROM activity_logs a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 100
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch Activity Log Error:', error);
        res.status(500).json({ error: 'Server error fetching logs' });
    }
};
