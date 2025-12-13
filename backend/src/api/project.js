const {
    getAllProject,
    getProjectById,
    registerProject,
    deleteProject,
    updateProject,
    runFinance
} = require('../module/project')

const resp_200 = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        pyd: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                code: { type: 'string' },
                name: { type: 'string' },
                note: { type: 'string' },
                active: { type: 'boolean' },
                done: { type: 'boolean' },
                typ: {
                    type: 'string',
                    enum: ['project', 'routine', 'other']
                },
                info: {
                    type: 'object',
                    properties: {
                        income: {
                            type: 'object',
                            properties: {
                                budget: { type: 'number' },
                                actual: { type: 'number' }
                            }
                        },
                        expense: {
                            type: 'object',
                            properties: {
                                budget: { type: 'number' },
                                actual: { type: 'number' }
                            }
                        },
                        profit: {
                            type: 'object',
                            properties: {
                                budget: { type: 'number' },
                                actual: { type: 'number' }
                            }
                        }
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
                lBudget: { 
                    type: 'array',
                    items: { 
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' }
                        }
                    }
                },
                lActual: { 
                    type: 'array',
                    items: { 
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' }
                        }
                    }
                },
                lTrx: { 
                    type: 'array',
                    items: { 
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' }
                        }
                    }
                },
                stDate: { type: 'string', format: 'date' },
                enDate: { type: 'string', format: 'date' },
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

async function projectApi(fastify, options) {
    const { protect, restrictTo } = require('../module/auth')

    // Get all projects (only accessible by admin/finance)
    fastify.route({
        method: 'GET',
        url: '/getAll',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: getAllProject,
        schema: {
            tags: ['project'],
            summary: 'Get all projects',
            description: 'Retrieve all projects (admin/finance access only)',
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

    // Get project by ID (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getProjectById,
        schema: {
            tags: ['project'],
            summary: 'Get project by ID',
            description: 'Get a single project by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Project ID' }
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

    // create project
    fastify.route({
        method: 'POST',
        url: '/register',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: registerProject,
        schema: {
            tags: ['project'],
            summary: 'Register project',
            description: 'Register a new project',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                    code: {
                        type: 'string',
                        description: 'Unique code for the project',
                        maxLength: 50
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the project',
                        maxLength: 50
                    },
                    note: {
                        type: 'string',
                        description: 'Additional notes about the project'
                    },
                    active: {
                        type: 'boolean',
                        description: 'Whether the project is active',
                        default: true
                    },
                    typ: {
                        type: 'string',
                        description: 'Type of the project',
                        enum: ['project', 'routine', 'other'],
                        default: 'project'
                    },
                    stDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Start date of the project'
                    },
                    enDate: {
                        type: 'string',
                        format: 'date',
                        description: 'End date of the project'
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

    // Delete project (only accessible by admin/finance  roles)
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        preHandler: [protect, restrictTo(['admin', 'finance'])],
        handler: deleteProject,
        schema: {
            tags: ['project'],
            summary: 'Delete project',
            description: 'Delete a project by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Project ID' }
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

    // Update project (only accessible by admin/finance roles)
    fastify.route({
        method: 'PATCH',
        url: '/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: updateProject,
        schema: {
            tags: ['project'],
            summary: 'Update project',
            description: 'Update project information',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Project ID' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    code: { type: 'string', maxLength: 50 },
                    name: { type: 'string', maxLength: 50 },
                    note: { type: 'string' },
                    active: { type: 'boolean' },
                    typ: { type: 'string', enum: ['project', 'routine', 'other'] },
                    year: { type: 'number', minimum: 2000 },
                    stDate: { type: 'string', format: 'date' },
                    enDate: { type: 'string', format: 'date' }
                }
            },
            response: {
                200: resp_200,
                400: resp_400,
                404: resp_400
            }
        }
    });

    // run finance
    fastify.route({
        method: 'GET',
        url: '/runFinance/:id',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: runFinance,
        schema: {
            tags: ['project'],
            summary: 'Calculate project finance by ID',
            description: 'Calculate project finance by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Project ID' }
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
}


// --- export API
module.exports = projectApi