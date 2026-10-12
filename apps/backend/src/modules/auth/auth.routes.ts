import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', AuthController.login);
  fastify.post('/refresh', AuthController.refresh);
  fastify.post('/logout', AuthController.logout);
  
  fastify.get('/me', {
    preValidation: [fastify.authenticate],
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.userId },
      include: {
        roleAssignments: {
          include: { role: true }
        },
        student: {
          include: {
            enrollments: {
              where: { status: 'ACTIVE' },
              orderBy: { effectiveFrom: 'desc' },
              take: 1,
              include: {
                program: { include: { department: true } },
                academicClass: true
              }
            }
          }
        },
        faculty: {
          include: { department: true }
        }
      }
    });
    
    if (!user) {
      return reply.code(401).send({ error: 'User not found' });
    }
    
    const { passwordHash, ...safeUser } = user;
    return reply.send({
      user: {
        ...safeUser,
        roles: user.roleAssignments.map(a => a.role.code)
      }
    });
  });

  fastify.post('/profile-update', { preValidation: [fastify.authenticate] }, AuthController.requestProfileUpdate);
  fastify.put<{Params: {id: string}}>('/profile-update/:id/approve', { preValidation: [fastify.authenticate, fastify.requireRole(['MASTER_ADMIN', 'DOMAIN_ADMIN'])] }, AuthController.approveProfileUpdate);

}
