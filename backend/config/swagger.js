const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TheCollabify API',
            version: '1.0.0',
            description: 'API documentation for Instagram Creator-Seller Promotion Marketplace',
            contact: {
                name: 'API Support',
                url: 'https://thecollabify.tech',
            },
        },
        servers: [
            {
                url: 'http://localhost:8080/api',
                description: 'Development server',
            },
            {
                url: 'https://api.thecollabify.tech/api',
                description: 'Production server (Azure)',
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
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Path to the API docs (JSDoc comments in routes)
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
