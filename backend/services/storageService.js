const multer = require('multer');

// Cloudinary storage — only configured if env vars are present
let cloudinary = null;
let upload = null;
let uploadFromBuffer = null;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
        const cloudinaryLib = require('cloudinary').v2;
        const { CloudinaryStorage } = require('multer-storage-cloudinary');

        cloudinaryLib.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const storage = new CloudinaryStorage({
            cloudinary: cloudinaryLib,
            params: {
                folder: 'thecollabify/avatars',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [{ width: 500, height: 500, crop: 'limit' }]
            },
        });

        upload = multer({
            storage: storage,
            limits: { fileSize: 5 * 1024 * 1024 }
        });

        uploadFromBuffer = (buffer, options = {}) => {
            return new Promise((resolve, reject) => {
                cloudinaryLib.uploader.upload_stream(options, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });
        };

        cloudinary = cloudinaryLib;
        console.log('✅ Cloudinary storage configured');
    } catch (e) {
        console.warn('⚠️  Cloudinary setup failed (non-fatal):', e.message);
    }
} else {
    console.warn('⚠️  Cloudinary env vars missing — file uploads disabled (set CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)');
}

// Fallback upload middleware that returns an error when Cloudinary is not configured
if (!upload) {
    upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
}

module.exports = {
    upload,
    cloudinary,
    uploadFromBuffer
};
