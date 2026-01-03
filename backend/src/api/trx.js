const {
    getAllTrx,
    getAllTrxByProjectId,
    getAllTrxByAssignee,
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
                isEq: { type: 'boolean' },
                actAmount: { type: 'number' },
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
                            active: { type: 'boolean' },
                            name: { type: 'string' },
                            amount: { type: 'number' },
                            typ: { type: 'string', enum: ['income', 'expense'] },
                            done: { type: 'boolean' },
                            dateEx: { type: 'string', format: 'date' },
                            projectId: { type: 'string' },
                            projectName: { type: 'string' },
                            assigneeId: { type: 'string' },
                            assigneeName: { type: 'string' }
                        }
                    }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                img: { type: 'string' },
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

    // Register a new trx
    fastify.route({
        method: 'POST',
        url: '/register',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: registerTrx,
        schema: {
            tags: ['trx'],
            summary: 'Register a new trx',
            description: 'Register a new trx',
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

    // Clone trx from actual
    fastify.route({
        method: 'POST',
        url: '/cloneFromActual',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: cloneFromActual,
        schema: {
            tags: ['trx'],
            summary: 'Clone trx from actual',
            description: 'Create a new trx based on an existing actual record',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', maxLength: 50 },
                    actualId: { type: 'string' },
                    amount: { type: 'number' },
                    dateEx: { type: 'string', format: 'date-time' }
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

    // Get all trxs by project ID
    fastify.route({
        method: 'GET',
        url: '/project/:projectId',
        preHandler: [protect, restrictTo(['admin', 'finance', 'project_manager'])],
        handler: getAllTrxByProjectId,
        schema: {
            tags: ['trx'],
            summary: 'Get all trxs by project ID',
            description: 'Retrieve all trxs for a specific project',
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

    // Get all trxs (only accessible by admin/finance)
    fastify.route({
        method: 'GET',
        url: '/getAll',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: getAllTrx,
        schema: {
            tags: ['trx'],
            summary: 'Get all trxs',
            description: 'Retrieve all trxs (admin/finance access only)',
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
            tags: ['trx'],
            summary: 'Get trx by ID',
            description: 'Get a single trx by ID',
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

    // Get all trxs by assignee
    fastify.route({
        method: 'GET',
        url: '/assignee/:assigneeId',
        preHandler: [protect, restrictTo(['admin', 'finance', 'project_manager'])],
        handler: getAllTrxByAssignee,
        schema: {
            tags: ['trx'],
            summary: 'Get all trxs by assignee ID',
            description: 'Retrieve all trxs for a specific assignee',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    assigneeId: { type: 'string', description: 'Assignee ID' }
                },
                required: ['assigneeId']
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

    // Get trx by Actual ID (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/byActual/:actualId',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getTrxByActualId,
        schema: {
            tags: ['trx'],
            summary: 'Get trx by actual ID',
            description: 'Get a trx by actual ID',
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
            tags: ['trx'],
            summary: 'Delete trx',
            description: 'Delete a trx by ID',
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
            tags: ['trx'],
            summary: 'Update trx',
            description: 'Update trx information',
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