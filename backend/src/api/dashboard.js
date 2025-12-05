const { verifyToken } = require('../util/auth')
const { summary } = require('../module/dashboard')


async function dashboardApi(fastify, options) {
    const { protect } = require('../module/auth')

    // Dashboard summary route
    fastify.route({
        method: 'GET',
        url: '/summary',
        preHandler: [protect],
        handler: summary,
        schema: {
            tags: ['dashboard'],
            summary: 'Get dashboard summary',
            description: 'Get counts of projects, events, and transactions for dashboard display',
            security: [{
                bearerAuth: []
            }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        pyd: {
                            type: 'object',
                            properties: {
                                users: { type: 'number' },
                                projects: { type: 'number' },
                                events: { type: 'number' },
                                transactions: { type: 'number' }
                            }
                        }
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    });
};

module.exports = dashboardApi