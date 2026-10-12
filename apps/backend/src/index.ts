import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import errorHandler from './plugins/error-handler';
import requestId from './plugins/request-id';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import { authRoutes } from './modules/auth/auth.routes';
import { academicRoutes } from './modules/academic/academic.routes';
import { attendanceRoutes } from './modules/attendance/attendance.routes';
import { examinationRoutes } from './modules/examination/examination.routes';
import { financeRoutes } from './modules/finance/finance.routes';
import { libraryRoutes } from './modules/library/library.routes';
import { placementRoutes } from './modules/placement/placement.routes';
import { eventsRoutes } from './modules/events/events.routes';
import { certificateRoutes } from './modules/certificates/certificates.routes';
import { notificationRoutes } from './modules/notifications/notifications.routes';
import { systemRoutes } from './modules/system/system.routes';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
  disableRequestLogging: true,
});

const start = async () => {
  try {
    // Plugins
    await fastify.register(cors, {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (/^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)) {
          return cb(null, true);
        }
        if (origin === env.FRONTEND_URL) {
          return cb(null, true);
        }
        cb(null, true);
      },
      credentials: true,
    });
    
    await fastify.register(rateLimit, {
      max: 1000,
      timeWindow: '1 minute',
      // Skip rate limiting for local SSR server-to-server requests
      allowList: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
      keyGenerator: (request: FastifyRequest) => {
        // Use user ID from JWT if available, otherwise IP
        return (request.headers['x-forwarded-for'] as string) || request.ip;
      },
    });

    await fastify.register(errorHandler);
    await fastify.register(requestId);
    await fastify.register(prismaPlugin);
    await fastify.register(authPlugin);

    // Route Registration Helper
    const registerApiRoutes = async (api: any) => {
      api.register(authRoutes, { prefix: '/auth' });
      api.register(academicRoutes, { prefix: '/academic' });
      api.register(attendanceRoutes, { prefix: '/attendance' });
      api.register(examinationRoutes, { prefix: '/examination' });
      api.register(financeRoutes, { prefix: '/finance' });
      api.register(libraryRoutes, { prefix: '/library' });
      api.register(placementRoutes, { prefix: '/placement' });
      api.register(eventsRoutes, { prefix: '/events' });
      api.register(certificateRoutes, { prefix: '/certificates' });
      api.register(notificationRoutes, { prefix: '/notifications' });
      api.register(systemRoutes, { prefix: '/system' });
      
      api.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
      });
    };

    // Register under both /api/v1 and /api for compatibility across web and mobile
    fastify.register(registerApiRoutes, { prefix: '/api/v1' });
    fastify.register(registerApiRoutes, { prefix: '/api' });

    const port = parseInt(env.PORT, 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server is running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
