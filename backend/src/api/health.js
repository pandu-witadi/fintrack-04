// 
// 
const { healthCheck } = require('../module/health')


async function healthApi(fastify) {
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['health'],
            summary: 'Health check',
            description: 'Health check', 
        },
        handler: healthCheck
    }); 
};
  

module.exports = healthApi;