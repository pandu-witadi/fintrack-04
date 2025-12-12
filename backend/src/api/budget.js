const {
    getAllBudget,
    getAllBudgetByProjectId,
    getBudgetById,
    updateBudget,
    deleteBudget,
    registerBudget,
} = require('../module/budget')

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
                amountActual: { type: 'number' },
                project: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        code: { type: 'string' },
                        stDate: { type: 'string', format: 'date' },
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
              
                lActual: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            amount: { type: 'number' },
                            dateEx: { type: 'string', format: 'date-time' },
                            amount: { type: 'number' },
                            done: { type: 'boolean' },
                            typ: { type: 'string', enum: ['income', 'expense', 'other'] },
                            assignee: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    name: { type: 'string' },
                                    email: { type: 'string' }
                                }
                            },
                        }
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

async function budgetApi(fastify, options) {
    const { protect, restrictTo } = require('../module/auth')

    // Get all budgets by project ID
    fastify.route({
        method: 'GET',
        url: '/project/:projectId',
        preHandler: [protect, restrictTo(['admin', 'finance', 'project_manager'])],
        handler: getAllBudgetByProjectId,
        schema: {
            tags: ['budget'],
            summary: 'Get all budgets by project ID',
            description: 'Retrieve all budgets for a specific project',
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

    // Get all budgets (only accessible by admin/finance)
    fastify.route({
        method: 'GET',
        url: '/getAll',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: getAllBudget,
        schema: {
            tags: ['budget'],
            summary: 'Get all budgets',
            description: 'Retrieve all budgets (admin/finance access only)',
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

    // Get budget by ID (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getBudgetById,
        schema: {
            tags: ['budget'],
            summary: 'Get budget by ID',
            description: 'Get a single budget by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Budget ID' }
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

    // Create budget
    fastify.route({
        method: 'POST',
        url: '/register',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: registerBudget,
        schema: {
            tags: ['budget'],
            summary: 'Register budget',
            description: 'Register a new budget',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                required: ['name', 'projectId', 'amount', 'dateEx'],
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the budget',
                        maxLength: 50
                    },
                    note: {
                        type: 'string',
                        description: 'Additional notes about the budget'
                    },
                    active: {
                        type: 'boolean',
                        description: 'Whether the budget is active',
                        default: true
                    },
                    done: {
                        type: 'boolean',
                        description: 'Whether the budget is completed',
                        default: false
                    },
                    typ: {
                        type: 'string',
                        description: 'Type of the budget',
                        enum: ['income', 'expense', 'other'],
                        default: 'expense'
                    },
                    amount: {
                        type: 'number',
                        description: 'Budget amount'
                    },
                    dateEx: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Date of execution'
                    },
                    projectId: {
                        type: 'string',
                        description: 'Project ID associated with this budget'
                    },
                    budgetId: {
                        type: 'string',
                        description: 'Budget ID associated with this budget'
                    },
                    detailedAmount: {
                        type: 'object',
                        description: 'Detailed amount with currency and exchange rate',
                        properties: {
                            currency: {
                                type: 'string',
                                default: 'IDR'
                            },
                            value: {
                                type: 'number',
                                default: 0
                            },
                            exRate: {
                                type: 'number',
                                default: 1
                            }
                        }
                    }
                }
            },
            response: {
                201: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400
            }
        }
    })

    // Delete budget (only accessible by admin/finance roles)
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: deleteBudget,
        schema: {
            tags: ['budget'],
            summary: 'Delete budget',
            description: 'Delete a budget by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Budget ID' }
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

    // Update budget (only accessible by admin/finance roles)
    fastify.route({
        method: 'PATCH',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: updateBudget,
        schema: {
            tags: ['budget'],
            summary: 'Update budget',
            description: 'Update budget information',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Budget ID' }
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
                    amountActual: { type: 'number' },
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
}


// --- export API
module.exports = budgetApi
