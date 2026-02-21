const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Configure Multer Storage for Cloudinary
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'thecollabify/avatars',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Helper to upload a buffer/stream directly to Cloudinary (optional)
 */
const uploadFromBuffer = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }).end(buffer);
    });
};

module.exports = {
    upload,
    cloudinary,
    uploadFromBuffer
};
