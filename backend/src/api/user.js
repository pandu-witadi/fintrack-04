//
const { 
    protect, 
    restrictTo, 
    getMe 
} = require('../module/auth')
const { 
    getAllUser, 
    getUserById,
    updateUser,
    deleteUser,
    registerUser,
    login
} = require('../module/user')

const bankInfo = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        bankName: { type: 'string' },
        accNo: { type: 'string' },
        accName: { type: 'string' }
    }
}

const depositTrx = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        amount: { type: 'number' },
        date: { type: 'string', format: 'date-time' },
        note: { type: 'string' }
    }
}

const deposit = {
    type: 'array',
    items: depositTrx
}

const resp_200 = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        pyd: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                active: { type: 'boolean' },
                lastAccess: { type: 'string', format: 'date-time' },
                phone: { type: 'string' },
                note: { type: 'string' },
                bankInfo: bankInfo,
                total: { type: 'number' },
                deposit: deposit,
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

async function userApi(fastify, options) {

     // Login user
    fastify.route({
        method: 'POST',
        url: '/login', 
        handler: login,
        schema: {
            tags: ['user'],
            summary: 'Login a user',
            description: 'Login a user',
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },    
                        pyd: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' },
                                active: { type: 'boolean' },
                                lastAccess: { type: 'string', format: 'date-time' },
                            }
                        },
                        token: { type: 'string' }
                    }
                }
            },
        },
    })

    // Get all users (only accessible by admin/finance roles)
    fastify.route({
        method: 'GET',
        url: '/getAll',
        preHandler: [protect, restrictTo(['finance', 'admin'])],
        handler: getAllUser,
        schema: {
            tags: ['user'],
            summary: 'Get all users',
            description: 'Get all users',
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

    // Get current user
    fastify.route({
        method: 'GET',
        url: '/me',
        preHandler: [protect, restrictTo(['guest', 'tax', 'vendor', 'user', 'project_manager', 'finance', 'admin', 'other'])],
        handler: getMe,
        schema: {
            tags: ['user'],
            summary: 'Get current user',
            description: 'Get the currently authenticated user\'s information',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        pyd: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' },
                                active: { type: 'boolean' },
                                lastAccess: { type: 'string', format: 'date-time' },
                                __v: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    });

    // Get user by ID (only accessible by all roles)
    fastify.route({
        method: 'GET',
        url: '/:id',
        preHandler: [protect, restrictTo(['guest', 'tax', 'vendor', 'user', 'project_manager', 'finance', 'admin', 'other'])],
        handler: getUserById,
        schema: {
            tags: ['user'],
            summary: 'Get user by ID',
            description: 'Get a single user by ID',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID' }
                },
                required: ['id']
            },
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                404: resp_400
            }
        }
    });

    // Create user (only accessible by admin roles)
    fastify.route({
        method: 'POST',
        url: '/register',
        preHandler: [protect, restrictTo(['admin'])],
        handler: registerUser,
        schema: {
            tags: ['user'],
            summary: 'Create a new user',
            description: 'Create a new user',
            security: [{
                bearerAuth: []
            }],
            body: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string' },
                    active: { type: 'boolean' },
                    phone: { type: 'string' },
                    note: { type: 'string' },
                    bankInfo: bankInfo
                }
            },
            response: {
                201: resp_200,
                400: resp_400,
                401: resp_400,
                403: resp_400
            }
        }
    });

    // Update user (only accessible by all roles)
    fastify.route({
        method: 'PATCH',
        url: '/:id',
        preHandler: [protect, restrictTo(['guest', 'tax', 'vendor', 'user', 'project_manager', 'finance', 'admin', 'other'])],
        handler: updateUser,
        schema: {
            tags: ['user'],
            summary: 'Update user',
            description: 'Update user information',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string' },
                    active: { type: 'boolean' },
                    phone: { type: 'string' },
                    note: { type: 'string' },
                    bankInfo: bankInfo,
                    deposit: deposit
                }
            },
            response: {
                200: resp_200,
                400: resp_400,
                401: resp_400,
                404: resp_400
            }
        }
    })

    // Delete user (only accessible by admin roles)
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        preHandler: [protect, restrictTo(['admin'])],
        handler: deleteUser,
        schema: {
            tags: ['user'],
            summary: 'Delete user',
            description: 'Delete user information',
            security: [{
                bearerAuth: []
            }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID' }
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
                404: resp_400
            }
        }
    })
}

// --- export
module.exports = userApi