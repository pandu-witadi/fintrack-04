const fs = require('fs');
const path = require('path');
const AppError = require('../../util/appError');

function viewImageByName(req, reply) {
    try {
        const uploadsDir = path.join(__dirname, '../../..', 'upload');
        const filename = req.params.filename;
        const filepath = path.join(uploadsDir, filename);
        
        // Prevent directory traversal
        if (!filepath.startsWith(uploadsDir)) {
            return reply.code(403).send({ error: 'Forbidden' });
        }
        
        if (fs.existsSync(filepath)) {
            return reply.sendFile(filename, uploadsDir);
        } else {
            return reply.code(404).send({ error: 'File not found' });
        }
    } catch (error) {
        throw new AppError('Failed to retrieve image', 500);
    }
}

module.exports = viewImageByName;
