const fs = require('fs');
const path = require('path');
const AppError = require('../../util/appError');
const { Trx } = require('../../model');

async function uploadImage(req, reply) {
    try {
        const { trxId } = req.params;
        if (!trxId) {
            throw new AppError('No trxId provided', 400);
        }

        const uploadsDir = path.join(__dirname, '../../..', 'upload');
        const parts = req.parts();

        let fileBuffer = null;
        let filename = null;
        let mimetype = null;
        let extension = null;

        // Iterate through multipart form data
        for await (const part of parts) {
            if (part.type === 'file') {
                // Get the file from the multipart request
                const buffer = await part.toBuffer();
                fileBuffer = buffer;
                mimetype = part.mimetype;
                filename = part.filename;
            } else if (part.type === 'field' && part.fieldname === 'filename') {
                // Custom filename from the frontend
                filename = part.value;
            }  else if (part.type === 'field' && part.fieldname === 'extension') {
                // extension from the frontend
                extension = part.value;
            }
        }

        // check if parameters are not complete
        if (!filename || !fileBuffer || !extension) {
            throw new AppError('No filename or trxId or fileBuffer or extension provided', 400);
        }
        
        // Validate file type
        const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(mimetype)) {
            throw new AppError('Only image files are allowed', 400);    
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (fileBuffer.length > maxSize) {
            throw new AppError('File size must not exceed 5MB', 400);
        }
        
        
        // name the file
        // const fname = `${trxId}-imgTrx-${filename}.${extension}`;
        let fName = `${trxId}-imgTrx.${extension}`;
        const filepath = path.join(uploadsDir, fName);
        
        // Prevent directory traversal
        if (!filepath.startsWith(uploadsDir)) {
            return reply.code(403).send({ error: 'Forbidden' });
        }
        
        fs.writeFileSync(filepath, fileBuffer);
        
        // Update trx with image filename if trxId is provided
        try {
            await Trx.findByIdAndUpdate(
                trxId,
                { img: fName },
                { new: true }
            );
        } catch (updateError) {
            console.error('Failed to update trx with image:', updateError);
        }
        
        return reply.code(200).send({
            success: true,
            message: 'File uploaded successfully',
            filename: fName
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to upload file', 500);
    }
}

module.exports = uploadImage;
