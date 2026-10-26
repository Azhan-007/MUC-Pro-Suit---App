import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '@muc/database';
import { verifyPassword, hashPassword } from '../../utils/password';
import { UnauthorizedError, BadRequestError } from '../../utils/errors';
import { AuditService } from '../../services/audit.service';
import { AuditOutcome, AuthClientType, SessionRevocationReason } from '@prisma/client';
import crypto from 'crypto';
import type { CookieSerializeOptions } from '@fastify/cookie';

/**
 * Compute cookie options based on the request origin.
 * When the frontend is on a different origin (e.g. localhost calling Render),
 * we must use SameSite=None so the browser stores the cross-origin cookie.
 * SameSite=None normally requires Secure, but localhost is exempt in most browsers.
 */
function getCookieOptions(request: FastifyRequest, pathOverride?: string): CookieSerializeOptions {
  const origin = request.headers.origin || '';
  const isProduction = process.env.NODE_ENV === 'production';
  const isCrossOrigin = isProduction && origin && !origin.includes('.onrender.com');

  return {
    path: pathOverride || '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: isCrossOrigin ? 'none' as const : 'lax' as const,
  };
}

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
  clientType: z.nativeEnum(AuthClientType).default(AuthClientType.WEB),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
  clientType: z.nativeEnum(AuthClientType).default(AuthClientType.WEB),
});

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const { identifier, password, clientType } = loginSchema.parse(request.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { normalizedEmail: identifier.toLowerCase() },
          { normalizedUsername: identifier.toLowerCase() },
          { student: { registrationNumber: identifier } },
          { faculty: { employeeId: identifier } },
        ],
      },
    });

    if (!user) {
      await AuditService.log({
        action: 'LOGIN_ATTEMPT',
        resourceType: 'User',
        outcome: AuditOutcome.FAILURE,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        requestId: request.reqId,
        correlationId: request.correlationId,
      });
      throw new UnauthorizedError('Invalid credentials');
    }


    if (user.status !== 'ACTIVE') {
      await AuditService.log({
        actorId: user.id,
        action: 'LOGIN_ATTEMPT',
        resourceType: 'User',
        resourceId: user.id,
        outcome: AuditOutcome.DENIED,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });
      throw new UnauthorizedError('Account is not active');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedError('Account is locked');
    }

    const isValid = await verifyPassword(user.passwordHash, password);

    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: { increment: 1 } },
      });
      await AuditService.log({
        actorId: user.id,
        action: 'LOGIN_ATTEMPT',
        resourceType: 'User',
        resourceId: user.id,
        outcome: AuditOutcome.FAILURE,
        ipAddress: request.ip,
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed logins
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lastLoginAt: new Date() },
    });

    // Create session
    const familyId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const randomSecret = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await hashPassword(randomSecret);
    const opaqueToken = `${sessionId}.${randomSecret}`;

    await prisma.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        familyId,
        refreshTokenHash,
        clientType,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    const accessToken = await reply.jwtSign({
      userId: user.id,
      familyId,
      sessionId,
    }, { expiresIn: '15m' });

    await AuditService.log({
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      resourceId: user.id,
      outcome: AuditOutcome.SUCCESS,
      ipAddress: request.ip,
    });

    if (clientType === AuthClientType.WEB) {
      reply.setCookie('accessToken', accessToken, getCookieOptions(request));
      reply.setCookie('refreshToken', opaqueToken, getCookieOptions(request));
      return reply.send({ success: true, message: 'Logged in successfully' });
    }

    return reply.send({ success: true, accessToken, refreshToken: opaqueToken });
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken: bodyToken, clientType } = refreshSchema.parse(request.body || {});
    const cookieToken = request.cookies['refreshToken'];
    const token = clientType === AuthClientType.WEB ? cookieToken : bodyToken;

    if (!token) {
      throw new UnauthorizedError('Refresh token required');
    }

    const [sessionId, secret] = token.split('.');
    if (!sessionId || !secret) {
      throw new UnauthorizedError('Invalid refresh token format');
    }

    const session = await prisma.authSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Session not found');
    }

    if (session.revokedAt) {
      // Reuse detection: If a revoked session's token is presented again,
      // it means the new valid token might be compromised. Revoke the entire family.
      await prisma.authSession.updateMany({
        where: { familyId: session.familyId, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: SessionRevocationReason.TOKEN_REUSE },
      });
      
      await AuditService.log({
        actorId: session.userId,
        action: 'REFRESH_TOKEN_REUSE',
        resourceType: 'AuthSession',
        resourceId: session.id,
        outcome: AuditOutcome.FAILURE,
        ipAddress: request.ip,
      });

      throw new UnauthorizedError('Invalid session. Please login again.');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session expired');
    }

    if (session.user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    const isValid = await verifyPassword(session.refreshTokenHash, secret);
    if (!isValid) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Rotate refresh token
    const newSessionId = crypto.randomUUID();
    const newSecret = crypto.randomBytes(32).toString('hex');
    const newRefreshTokenHash = await hashPassword(newSecret);
    const newOpaqueToken = `${newSessionId}.${newSecret}`;

    // Perform inside transaction to ensure consistency
    await prisma.$transaction([
      prisma.authSession.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
          revokedReason: SessionRevocationReason.ROTATED,
        },
      }),
      prisma.authSession.create({
        data: {
          id: newSessionId,
          userId: session.userId,
          familyId: session.familyId,
          parentSessionId: session.id,
          refreshTokenHash: newRefreshTokenHash,
          clientType: session.clientType,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      }),
    ]);

    const accessToken = await reply.jwtSign({
      userId: session.userId,
      familyId: session.familyId,
      sessionId: newSessionId,
    }, { expiresIn: '15m' });

    await AuditService.log({
      actorId: session.userId,
      action: 'SESSION_REFRESH',
      resourceType: 'AuthSession',
      resourceId: newSessionId,
      outcome: AuditOutcome.SUCCESS,
      ipAddress: request.ip,
    });

    if (clientType === AuthClientType.WEB) {
      reply.setCookie('accessToken', accessToken, getCookieOptions(request));
      reply.setCookie('refreshToken', newOpaqueToken, getCookieOptions(request, '/api/v1/auth/refresh'));
      return reply.send({ success: true, message: 'Token refreshed' });
    }

    return reply.send({ success: true, accessToken, refreshToken: newOpaqueToken });
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      if (request.user) {
        await prisma.authSession.updateMany({
          where: { id: request.user.sessionId, revokedAt: null },
          data: { revokedAt: new Date(), revokedReason: SessionRevocationReason.LOGOUT },
        });
        await AuditService.log({
          actorId: request.user.userId,
          action: 'LOGOUT',
          resourceType: 'User',
          resourceId: request.user.userId,
          outcome: AuditOutcome.SUCCESS,
        });
      }
    } catch (e) {
      // Token verification failed (e.g. expired). Try to decode it without verification to revoke the session server-side.
      try {
        const token = request.cookies['accessToken'] || request.headers.authorization?.replace('Bearer ', '');
        if (token) {
          const decoded: any = request.server.jwt.decode(token);
          if (decoded && decoded.sessionId) {
            await prisma.authSession.updateMany({
              where: { id: decoded.sessionId, revokedAt: null },
              data: { revokedAt: new Date(), revokedReason: SessionRevocationReason.LOGOUT },
            });
          }
        }
      } catch (innerErr) {
        // Ignore errors during fallback revocation
      }
    }

    reply.clearCookie('accessToken', getCookieOptions(request));
    reply.clearCookie('refreshToken', getCookieOptions(request, '/api/v1/auth/refresh'));
    return reply.send({ success: true, message: 'Logged out successfully' });
  }

  static async requestProfileUpdate(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      field: z.string(),
      newValue: z.string(),
    });
    const { field, newValue } = schema.parse(request.body);
    const updateRequest = await prisma.profileUpdateRequest.create({
      data: {
        userId: request.user.userId,
        field,
        newValue
      }
    });
    return reply.send({ success: true, data: updateRequest });
  }

  static async approveProfileUpdate(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
    const { id } = request.params;
    const updateRequest = await prisma.profileUpdateRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    // In a real scenario, this would also apply the update to the Student/Faculty table.
    return reply.send({ success: true, data: updateRequest });
  }

}
