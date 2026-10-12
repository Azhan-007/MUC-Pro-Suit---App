import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { RoleCode, DomainCode } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  familyId: string;
  sessionId: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: RoleCode[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireDomain: (domain: DomainCode, additionalRoles?: RoleCode[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'accessToken',
      signed: false,
    },
  });

  fastify.register(fastifyCookie);

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const session = await fastify.prisma.authSession.findUnique({
      where: { id: request.user.sessionId },
      include: { user: true }
    });

    if (!session || session.revokedAt || !session.user || session.user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Invalid or expired token');
    }
  });

  fastify.decorate('requireRole', (roles: RoleCode[]) => async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.userId;
      
      const assignments = await fastify.prisma.userRoleAssignment.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { role: true }
      });
      
      const userRoles = assignments.map(a => a.role.code);

      if (userRoles.includes('SUPER_ADMIN')) {
        return; // Super admin bypassed
      }

      const hasRequiredRole = roles.some(r => userRoles.includes(r));
      if (!hasRequiredRole) {
        throw new UnauthorizedError('Insufficient permissions');
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Authentication required');
    }
  });

  fastify.decorate('requireDomain', (domain: DomainCode, additionalRoles: RoleCode[] = []) => async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.userId;
      
      const assignments = await fastify.prisma.userRoleAssignment.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { role: true }
      });
      const userRoles = assignments.map(a => a.role.code);

      if (userRoles.includes('SUPER_ADMIN') || userRoles.includes('MASTER_ADMIN')) {
        return; // Admin bypassed
      }

      if (additionalRoles.some(r => userRoles.includes(r))) {
        return; // User has an explicitly allowed non-admin role
      }

      if (!userRoles.includes('DOMAIN_ADMIN')) {
        throw new UnauthorizedError('Insufficient domain permissions');
      }

      const domainAssignment = await fastify.prisma.domainAssignment.findFirst({
        where: {
          userId,
          domain,
          state: 'ACTIVE'
        }
      });

      if (!domainAssignment) {
        throw new UnauthorizedError(`Insufficient permissions for domain ${domain}`);
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Authentication required');
    }
  });
});
