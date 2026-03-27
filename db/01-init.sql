-- Extension for UUIDs to ensure unique submission tracking
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. Users Table (RBAC: Student vs Admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    matric_number VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'admin')),
    program_type VARCHAR(10) CHECK (program_type IN ('MSc', 'PhD')),
    department VARCHAR(100),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. Thesis Submissions Table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    abstract TEXT,
    keywords TEXT,
    -- Comma-separated
    supervisor_name VARCHAR(255),
    file_path TEXT,
    -- Link to secure storage
    file_size_mb DECIMAL(10, 2),
    status VARCHAR(30) DEFAULT 'Submitted' CHECK (
        status IN (
            'Submitted',
            'Under Review',
            'Approved',
            'Rejected',
            'Correction Required'
        )
    ),
    submission_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 3. Audit Logs (For transparency and tracking)
CREATE TABLE submission_logs (
    id SERIAL PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id),
    action_by UUID REFERENCES users(id),
    action_taken VARCHAR(50),
    comments TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);