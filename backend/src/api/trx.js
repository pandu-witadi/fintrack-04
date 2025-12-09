const {
    getAllTrx,
    getAllTrxByProjectId,
    getTrxById,
    getTrxByActualId,
    updateTrx,
    deleteTrx,
    registerTrx,
    cloneFromActual
} = require('../module/trx')
const resp_200 = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        pyd: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                note: { type: 'string' },
                active: { type: 'boolean' },
                done: { type: 'boolean' },
                typ: { type: 'string', enum: ['income', 'expense'] },
                amount: { type: 'number' },
                detailedAmount: {
                    type: 'object',
                    properties: {
                        currency: { type: 'string' },
                        value: { type: 'number' },
                        exRate: { type: 'number' }
                    }
                },
                project: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                updatedBy: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' }
                    }
                },
                assignee: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' }
                    }
                },
                dateEx: { type: 'string', format: 'date' },
                sndr: {
                    type: 'object',
                    properties: {
                        bankName: { type: 'string' },
                        accNo: { type: 'string' },
                        accName: { type: 'string' }
                    }
                },
                recv: {
                    type: 'object',
                    properties: {
                        bankName: { type: 'string' },
                        accNo: { type: 'string' },
                        accName: { type: 'string' }
                    }
                },
                  lActual: { 
                    type: 'array',
                    items: { 
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            amount: { type: 'number' },
                            typ: { type: 'string', enum: ['income', 'expense'] },
                            done: { type: 'boolean' }
                        }
                    }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }
}

const resp_400 = {
    type: 'object',
    properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
    }
}

async function trxApi(fastify, options) {
    const { protect, restrictTo } = require('../module/auth')

    // Register a new transaction
    fastify.route({
        method: 'POST',
        url: '/register',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: registerTrx,
        schema: {
            tags: ['transaction'],
            summary: 'Register a new transaction',
            description: 'Register a new transaction',
            security: [{
                bearerAuth: []
            }],
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400
            }
        }
    });

    // Clone transaction from actual
    fastify.route({
        method: 'POST',
        url: '/cloneFromActual',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: cloneFromActual,
        schema: {
            tags: ['transaction'],
            summary: 'Clone transaction from actual',
            description: 'Create a new transaction based on an existing actual record',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', maxLength: 50 },
                    actualId: { type: 'string' },
                    amount: { type: 'number' },
                    dateEx: { type: 'string', format: 'date' }
                },
                required: ['name', 'actualId', 'amount', 'dateEx']
            },
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400,
                404: resp_400
            }
        }
    });

    // Get all transactions by project ID
    fastify.route({
        method: 'GET',
        url: '/project/:projectId',
        preHandler: [protect, restrictTo(['admin', 'finance', 'project_manager'])],
        handler: getAllTrxByProjectId,
        schema: {
            tags: ['transaction'],
            summary: 'Get all transactions by project ID',
            description: 'Retrieve all transactions for a specific project',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    projectId: { type: 'string', description: 'Project ID' }
                },
                required: ['projectId']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        pyd: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: resp_200.properties.pyd.properties
                            }
                        }
                    }
                },
                400: resp_400,
                401: resp_400,
                403: resp_400
            }
        }
    });

    // Get all transactions (only accessible by admin/finance)
    fastify.route({
        method: 'GET',
        url: '/getAll',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: getAllTrx,
        schema: {
            tags: ['transaction'],
            summary: 'Get all transactions',
            description: 'Retrieve all transactions (admin/finance access only)',
            security: [{
                bearerAuth: []
            }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        pyd: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: resp_200.properties.pyd.properties
                            }
                        }
                    }
                },
                401: resp_400,
                403: resp_400
            }
        }
    });

    // Get trx by ID (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getTrxById,
        schema: {
            tags: ['transaction'],
            summary: 'Get transaction by ID',
            description: 'Get a single transaction by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Transaction ID' }
                },
                required: ['id']
            },
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400,
                404: resp_400
            }
        },
    })

    // Get trx by Actual ID (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/byActual/:actualId',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getTrxByActualId,
        schema: {
            tags: ['transaction'],
            summary: 'Get transaction by actual ID',
            description: 'Get a transaction by actual ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    actualId: { type: 'string', description: 'Actual ID' }
                },
                required: ['actualId']
            },
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400,
                404: resp_400
            }
        },
    })

    // Delete trx (only accessible by admin/finance roles)
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: deleteTrx,
        schema: {
            tags: ['transaction'],
            summary: 'Delete transaction',
            description: 'Delete a transaction by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Transaction ID' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                400: resp_400,
                401: resp_400,
                403: resp_400,
                404: resp_400
            }
        }
    });

    // Update trx (only accessible by admin/finance roles)
    fastify.route({
        method: 'PATCH',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: updateTrx,
        schema: {
            tags: ['transaction'],
            summary: 'Update transaction',
            description: 'Update transaction information',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Transaction ID' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', maxLength: 50 },
                    note: { type: 'string' },
                    active: { type: 'boolean' },
                    done: { type: 'boolean' },
                    typ: { type: 'string', enum: ['income', 'expense'] },
                    amount: { type: 'number' },
                    detailedAmount: {
                        type: 'object',
                        properties: {
                            currency: { type: 'string' },
                            value: { type: 'number' },
                            exRate: { type: 'number' }
                        }
                    },
                    assignee: { type: 'string' },
                    dateEx: { type: 'string', format: 'date' },
                    sndr: {
                        type: 'object',
                        properties: {
                            bankName: { type: 'string' },
                            accNo: { type: 'string' },
                            accName: { type: 'string' }
                        }
                    },
                    recv: {
                        type: 'object',
                        properties: {
                            bankName: { type: 'string' },
                            accNo: { type: 'string' },
                            accName: { type: 'string' }
                        }
                    }
                }
            },
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400,
                404: resp_400
            }
        }
    });

}


// --- export API
module.exports = trxApi