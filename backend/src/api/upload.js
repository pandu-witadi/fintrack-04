const { 
    uploadImage, 
    removeImage, 
    viewImageByName 
} = require('../module/upload')


module.exports = async function(fastify, opts) {
    
    // View image by filename
    fastify.route({
        method: 'GET',
        url: '/viewImage/:filename',
        handler: viewImageByName,
        schema: {
            tags: ['upload'],
            summary: 'View image by filename',
            description: 'View image by filename',
        }
    })

    
    // Upload image endpoint
    fastify.route({
        method: 'POST',
        url: '/imageTrx/:trxId',
        handler: uploadImage,
        schema: {
            tags: ['upload'],
            summary: 'Upload image',
            description: 'Upload image',
        }
    });
    

    // Remove image endpoint
    fastify.route({
        method: 'DELETE',
        url: '/removeImage/:trxId/:filename',
        handler: removeImage,
        schema: {
            tags: ['upload'],
            summary: 'Remove image',
            description: 'Remove image',
        }
    });

}