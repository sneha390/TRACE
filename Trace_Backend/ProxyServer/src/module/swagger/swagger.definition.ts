const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'HeHe',
    version: '0.0.1',
    description: 'HeHeHe',
    license: {
      name: ':(',
    },
  },
  servers: [
    {
      url: `http://localhost:8000`,
      description: 'Testing Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          username: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
          },
          refreshToken: {
            type: 'string',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
    responses: {
      DuplicateEmail: {
        description: 'Email already exists',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
  },
};

export default swaggerDefinition;
