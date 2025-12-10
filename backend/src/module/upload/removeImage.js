const fs = require('fs');
const path = require('path');
const AppError = require('../../util/appError');
const { Trx } = require('../../model');

async function removeImage(req, reply) {
    try {
        const uploadsDir = path.join(__dirname, '../../..', 'upload');
        const { trxId, filename } = req.params;

        if (!filename) {
            throw new AppError('No filename provided', 400);
        }

        const filepath = path.join(uploadsDir, filename);
        
        // Prevent directory traversal
        if (!filepath.startsWith(uploadsDir)) {
            return reply.code(403).send({ error: 'Forbidden' });
        }
        
        // Delete the file from disk
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        // Update transaction to remove image reference if trxId is provided
        if (trxId) {
            try {
                await Trx.findByIdAndUpdate(
                    trxId,
                    { img: null },
                    { new: true }
                );
            } catch (updateError) {
                console.error('Failed to update transaction after image removal:', updateError);
                // Don't throw error, file was deleted successfully
            }
        }
        
        return reply.code(200).send({
            success: true,
            message: 'Image removed successfully'
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to remove image', 500);
    }
}

module.exports = removeImage;
