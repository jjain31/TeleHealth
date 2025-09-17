import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TeleHealth Auth Service API',
            version: '1.0.0',
            description:
                'Authentication and User Management Service for TeleHealth Platform',
            contact: {
                name: 'TeleHealth Support',
                email: 'support@telehealth.com',
            },
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV === 'production'
                        ? 'https://api.telehealth.com'
                        : `http://localhost:${process.env.PORT || 3000}`,
                description:
                    process.env.NODE_ENV === 'production'
                        ? 'Production server'
                        : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        name: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/**/*.ts', './src/routes/**/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)
