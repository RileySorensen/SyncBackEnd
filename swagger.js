import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SYNC API',
      version: '1.0.0',
      description: 'API documentation for SYNC API endpoints and such',
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;