import * as Minio from 'minio';
import dotenv from 'dotenv';
dotenv.config();

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Helper to ensure bucket exists
export const initMinio = async () => {
    const bucketName = process.env.MINIO_BUCKET_NAME || 'atss-theses';
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Bucket ${bucketName} created successfully.`);
        }
    } catch (error) {
        console.error('Error initializing MinIO bucket:', error);
    }
};
