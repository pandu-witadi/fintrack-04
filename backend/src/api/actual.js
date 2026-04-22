const {
    getAllActual,
    getAllActualByProjectId,
    getAllActualByAssignee,
    getActualById,
    updateActual,
    deleteActual,
    cloneFromBudget,
    registerActual,
    attachToTrx,
    unAttachFromTrx
} = require('../module/actual')

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
                typ: { type: 'string', enum: ['income', 'expense', 'other'] },
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
                budget: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        amount: { type: 'number' }
                    }
                },
                trx: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        amount: { type: 'number' },
                        typ: { type: 'string', enum: ['income', 'expense'] },
                        done: { type: 'boolean' },
                        projectName: { type: 'string' },
                        projectId: { type: 'string' }
                    }
                },
                dateEx: { type: 'string', format: 'date-time' },
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

async function actualApi(fastify, options) {
    const { protect, restrictTo } = require('../module/auth')

    // spawn actual from budget
    fastify.route({
        method: 'POST',
        url: '/register',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: registerActual,
        schema: {
            tags: ['actual'],
            summary: 'Spawn actual from budget',
            description: 'Spawn actual from budget',
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

    // clone actual from budget
    fastify.route({
        method: 'POST',
        url: '/cloneFromBudget',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: cloneFromBudget,
        schema: {
            tags: ['actual'],
            summary: 'Clone actual from budget',
            description: 'Clone actual from budget',
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

    // Get all actuals by project ID
    fastify.route({
        method: 'GET',
        url: '/project/:projectId',
        preHandler: [protect, restrictTo(['admin', 'finance', 'project_manager'])],
        handler: getAllActualByProjectId,
        schema: {
            tags: ['actual'],
            summary: 'Get all actuals by project ID',
            description: 'Retrieve all actuals for a specific project',
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

    // Get all actuals by assignee ID
    fastify.route({
        method: 'GET',
        url: '/assignee/:assigneeId',
        preHandler: [protect],
        handler: getAllActualByAssignee,
        schema: {
            tags: ['actual'],
            summary: 'Get all actuals by assignee ID',
            description: 'Retrieve all actuals assigned to a specific assignee',
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

    // Get all actuals (only accessible by admin/finance)
    fastify.route({
        method: 'GET',
        url: '/getAll',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: getAllActual,
        schema: {
            tags: ['actual'],
            summary: 'Get all actuals',
            description: 'Retrieve all actuals (admin/finance access only)',
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

    // Get actual by ID (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getActualById,
        schema: {
            tags: ['actual'],
            summary: 'Get actual by ID',
            description: 'Get a single actual by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Actual ID' }
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

    // Delete actual (only accessible by admin/finance roles)
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: deleteActual,
        schema: {
            tags: ['actual'],
            summary: 'Delete actual',
            description: 'Delete an actual by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Actual ID' }
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

    // Update actual (only accessible by admin/finance roles)
    fastify.route({
        method: 'PATCH',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: updateActual,
        schema: {
            tags: ['actual'],
            summary: 'Update actual',
            description: 'Update actual information',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Actual ID' }
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
                    typ: { type: 'string', enum: ['income', 'expense', 'other'] },
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
                    budget: { type: 'string' },
                    trx: { type: 'string' },
                    dateEx: { type: 'string', format: 'date' }
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

    // Attach actual to transaction
    fastify.route({
        method: 'POST',
        url: '/attachToTrx',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: attachToTrx,
        schema: {
            tags: ['actual'],
            summary: 'Attach actual to transaction',
            description: 'Attach an actual record to a transaction and update the transaction\'s lActual array',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                properties: {
                    allActualId: { type: 'array', items: { type: 'string' } },
                    trxId: { type: 'string' }
                },
                required: ['allActualId', 'trxId']
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

    // Unattach actual from transaction
    fastify.route({
        method: 'POST',
        url: '/unAttachFromTrx',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: unAttachFromTrx,
        schema: {
            tags: ['actual'],
            summary: 'Unattach actual from transaction',
            description: 'Unattach an actual record from a transaction and update the transaction\'s lActual array',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                properties: {
                    actualId: { type: 'string' },
                    trxId: { type: 'string' }
                },
                required: ['actualId', 'trxId']
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
module.exports = actualApi
