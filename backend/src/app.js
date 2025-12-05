const path = require('path')
const fs = require('fs')
const fastifyStatic = require('@fastify/static')
const fastifyCors = require('@fastify/cors')
const fastifyMultipart = require('@fastify/multipart')

const fastifyCookie = require('@fastify/cookie')
const fastifySwagger = require('@fastify/swagger')
const fastifySwaggerUi = require('@fastify/swagger-ui')

require('dotenv').config();

const app = require('fastify')({ logger: true })

const API_PTH = '/api'
// Register plugins
app.register(fastifyCors, {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
})
app.register(fastifyMultipart)

app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'fintrack-secret-key', // Use a secret from env or default
    parseOptions: {}  // options for parsing cookies
})

// Register Swagger
app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'FinTrack API',
            description: 'Financial tracking application API',
            version: '0.0.1'
        },
        tags: [
            { name: 'auth', description: 'Authentication endpoints' },
            { name: 'health', description: 'Health check endpoints' },
            { name: 'user', description: 'User management endpoints' },
            { name: 'project', description: 'Project management endpoints' },
            { name: 'clnt', description: 'Client management endpoints' },
            { name: 'pjev', description: 'Income/Expense management endpoints' },
            { name: 'dashboard', description: 'Dashboard summary endpoints' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        name: {
                            type: 'string',
                            maxLength: 50
                        },
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        role: {
                            type: 'string',
                            enum: ['guest', 'user', 'finance', 'admin']
                        },
                        active: {
                            type: 'boolean'
                        },
                        lastAccess: {
                            type: 'string',
                            format: 'date-time'
                        },
                        phone: {
                            type: 'string'
                        },
                        financialRecord: {
                            type: 'object',
                            properties: {
                                bankCode: {
                                    type: 'string'
                                },
                                bankAccountNumber: {
                                    type: 'string'
                                },
                                note: {
                                    type: 'string'
                                }
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Project: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'objectId' },
                        name: { type: 'string', maxLength: 50 },
                        description: { type: 'string' },
                        status: { type: 'string', enum: ['active', 'inactive'] },
                        typ: { type: 'string', enum: ['project', 'routine', 'other'] },
                        updatedBy: { type: 'string', format: 'objectId' },
                        lpev: {
                            type: 'array',
                            items: { type: 'string', format: 'objectId' }
                        },
                        ltrx: {
                            type: 'array',
                            items: { type: 'string', format: 'objectId' }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }
})
app.register(fastifySwaggerUi, {
    routePrefix: API_PTH + '/doc',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true,
})



// Register API
app.register(require('./api/health'), { prefix: API_PTH + '/health' })
app.register(require('./api/user'), { prefix: API_PTH + '/user' })
app.register(require('./api/dashboard'), { prefix: API_PTH + '/dashboard' })
app.register(require('./api/project'), { prefix: API_PTH + '/project' })
// app.register(require('./api/evn'), { prefix: API_PTH + '/evn' })
// app.register(require('./api/trx'), { prefix: API_PTH + '/trx' })
// app.register(require('./api/upload'), { prefix: API_PTH + '/upload' })

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..','uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Register static plugin to serve frontend
app.register(fastifyStatic, {
    root: frontendDistPath,
    prefix: '/',
})

app.setNotFoundHandler((req, reply) => {
    reply.sendFile('index.html');
})

module.exports = app
