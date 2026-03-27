import multer from 'multer';

// Storage configuration - memory storage to pipe directly to MinIO
const storage = multer.memoryStorage();

// File filter - PDF only
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB chunked upload handling limit
    },
    fileFilter,
});

export default upload;
