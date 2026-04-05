-- 1. Insert an Admin User
INSERT INTO users (
        id,
        full_name,
        matric_number,
        email,
        role,
        program_type,
        staff_id,
        password_hash
    )
VALUES (
        uuid_generate_v4(),
        'Admin Super',
        'ADMIN001',
        'admin@acetel.edu.ng',
        'admin',
        NULL,
        'STAFF-ADM-001',
        '$2b$10$OWTMSqebDEn9J3RuB/Sb1uYIQt6UGWZ4VH3bmsuRBpgqzTxvzptLa'
    );
-- 2. Insert 10 Student Users (5 MSc, 5 PhD)
DO $$
DECLARE student_record users %ROWTYPE;
BEGIN FOR i IN 1..5 LOOP
INSERT INTO users (
        full_name,
        matric_number,
        email,
        role,
        program_type,
        phone_number,
        password_hash
    )
VALUES (
        'Student MSc ' || i,
        'MSC20230' || i,
        'student.msc' || i || '@stu.acetel.edu.ng',
        'student',
        'MSc',
        '+23480000000' || i,
        '$2b$10$OWTMSqebDEn9J3RuB/Sb1uYIQt6UGWZ4VH3bmsuRBpgqzTxvzptLa'
    )
RETURNING * INTO student_record;
INSERT INTO submissions (
        student_id,
        title,
        abstract,
        keywords,
        supervisor_name,
        file_path,
        file_size_mb,
        status,
        submission_year
    )
VALUES (
        student_record.id,
        'MSc Thesis Title ' || i,
        'Abstract for MSc ' || i,
        'AI, Machine Learning',
        'Dr. Smith',
        'bucket/msc_thesis_' || i || '.pdf',
        15.5,
        CASE
            WHEN i % 2 = 0 THEN 'Approved'
            ELSE 'Under Review'
        END,
        2023
    );
END LOOP;
FOR i IN 1..5 LOOP
INSERT INTO users (
        full_name, matric_number, email, role, program_type, phone_number, password_hash
    ) VALUES (
        'Student PhD ' || i,
        'PHD20230' || i,
        'student.phd' || i || '@stu.acetel.edu.ng',
        'student',
        'PhD',
        '+23480000100' || i,
        '$2b$10$OWTMSqebDEn9J3RuB/Sb1uYIQt6UGWZ4VH3bmsuRBpgqzTxvzptLa'
    ) RETURNING * INTO student_record;
INSERT INTO submissions (
        student_id,
        title,
        abstract,
        keywords,
        supervisor_name,
        file_path,
        file_size_mb,
        status,
        submission_year
    )
VALUES (
        student_record.id,
        'PhD Dissertation Title ' || i,
        'Abstract for PhD ' || i,
        'Data Science, Big Data',
        'Prof. Johnson',
        'bucket/phd_thesis_' || i || '.pdf',
        45.2,
        CASE
            WHEN i % 2 = 1 THEN 'Approved'
            WHEN i = 2 THEN 'Correction Required'
            ELSE 'Submitted'
        END,
        2023
    );
END LOOP;
END $$;