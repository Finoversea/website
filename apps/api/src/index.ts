import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

const buildServer = async () => {
  const server = Fastify({
    logger,
    requestIdHeader: 'x-request-id',
  });

  // Register plugins
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
  });
  await server.register(sensible);
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Product API',
        version: '1.0.0',
        description: 'API for Product MVP',
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:3001',
          description: 'Development server',
        },
      ],
    },
  });

  // Health check endpoint
  server.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // API info endpoint
  server.get('/api', async (request, reply) => {
    return {
      name: 'Product API',
      version: '1.0.0',
      docs: '/documentation',
    };
  });

  return server;
};

const start = async () => {
  const server = await buildServer();
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    logger.info(`Server running at http://${host}:${port}`);
    logger.info(`API documentation at http://${host}:${port}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
