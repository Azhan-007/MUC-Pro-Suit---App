import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { prisma } from '@muc/database';
import { verifyPassword, hashPassword } from '../../utils/password';
import { AuditService } from '../../services/audit.service';
import { UnauthorizedError } from '../../utils/errors';
import { AuthClientType, SessionRevocationReason } from '@prisma/client';
import crypto from 'crypto';

// Mock dependencies
vi.mock('@muc/database', () => ({
  prisma: {
    user: { findFirst: vi.fn(), update: vi.fn() },
    authSession: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn((ops) => Promise.all(ops)),
  }
}));

vi.mock('../../utils/password', () => ({
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../../services/audit.service', () => ({
  AuditService: { log: vi.fn() }
}));

const mockReply = () => {
  const reply: any = {
    jwtSign: vi.fn(),
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
    send: vi.fn((payload) => payload),
  };
  return reply;
};

const mockRequest = (body: any = {}, cookies: any = {}, user: any = null) => ({
  body,
  cookies,
  user,
  ip: '127.0.0.1',
  headers: { 'user-agent': 'vitest' },
  jwtVerify: vi.fn().mockResolvedValue(true),
});

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('refresh', () => {
    it('should throw Unauthorized if no token is provided', async () => {
      const req = mockRequest({}, {}, null);
      const reply = mockReply();
      
      await expect(AuthController.refresh(req as any, reply)).rejects.toThrow(UnauthorizedError);
      await expect(AuthController.refresh(req as any, reply)).rejects.toThrow('Refresh token required');
    });

    it('should throw Unauthorized if token format is invalid', async () => {
      const req = mockRequest({ refreshToken: 'invalidtoken', clientType: AuthClientType.MOBILE });
      const reply = mockReply();
      
      await expect(AuthController.refresh(req as any, reply)).rejects.toThrow(UnauthorizedError);
    });

    it('should successfully refresh token and rotate it', async () => {
      const sessionId = crypto.randomUUID();
      const secret = 'valid-secret';
      const req = mockRequest({ refreshToken: `${sessionId}.${secret}`, clientType: AuthClientType.MOBILE });
      const reply = mockReply();
      
      const mockSession = {
        id: sessionId,
        userId: 'user-1',
        familyId: 'family-1',
        refreshTokenHash: 'hashed-secret',
        clientType: AuthClientType.MOBILE,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        user: { status: 'ACTIVE' }
      };

      vi.mocked(prisma.authSession.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(hashPassword).mockResolvedValue('new-hash');
      reply.jwtSign.mockResolvedValue('new-access-token');

      const response = (await AuthController.refresh(req as any, reply)) as any;

      expect(prisma.authSession.findUnique).toHaveBeenCalledWith({ where: { id: sessionId }, include: { user: true } });
      expect(verifyPassword).toHaveBeenCalledWith('hashed-secret', secret);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(reply.jwtSign).toHaveBeenCalled();
      expect(response.accessToken).toBe('new-access-token');
      expect(response.refreshToken).toBeDefined();
    });

    it('should detect token reuse (revoked session) and revoke entire family', async () => {
      const sessionId = crypto.randomUUID();
      const secret = 'valid-secret';
      const req = mockRequest({ refreshToken: `${sessionId}.${secret}`, clientType: AuthClientType.MOBILE });
      const reply = mockReply();
      
      const mockSession = {
        id: sessionId,
        userId: 'user-1',
        familyId: 'family-1',
        refreshTokenHash: 'hashed-secret',
        revokedAt: new Date(),
        user: { status: 'ACTIVE' }
      };

      vi.mocked(prisma.authSession.findUnique).mockResolvedValue(mockSession as any);

      await expect(AuthController.refresh(req as any, reply)).rejects.toThrow('Invalid session. Please login again.');
      expect(prisma.authSession.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'family-1', revokedAt: null },
        data: expect.objectContaining({ revokedReason: SessionRevocationReason.TOKEN_REUSE })
      });
      expect(AuditService.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'REFRESH_TOKEN_REUSE' }));
    });

    it('should reject expired session', async () => {
      const sessionId = crypto.randomUUID();
      const req = mockRequest({ refreshToken: `${sessionId}.secret`, clientType: AuthClientType.MOBILE });
      const reply = mockReply();
      
      const mockSession = {
        id: sessionId,
        expiresAt: new Date(Date.now() - 100000), // Past
        revokedAt: null,
        user: { status: 'ACTIVE' }
      };

      vi.mocked(prisma.authSession.findUnique).mockResolvedValue(mockSession as any);

      await expect(AuthController.refresh(req as any, reply)).rejects.toThrow('Session expired');
    });

    it('should reject inactive user', async () => {
      const sessionId = crypto.randomUUID();
      const req = mockRequest({ refreshToken: `${sessionId}.secret`, clientType: AuthClientType.MOBILE });
      const reply = mockReply();
      
      const mockSession = {
        id: sessionId,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        user: { status: 'INACTIVE' } // Inactive
      };

      vi.mocked(prisma.authSession.findUnique).mockResolvedValue(mockSession as any);

      await expect(AuthController.refresh(req as any, reply)).rejects.toThrow('Account is not active');
    });
  });

  describe('logout', () => {
    it('should revoke session and clear cookies', async () => {
      const sessionId = crypto.randomUUID();
      const req = mockRequest({}, {}, { userId: 'user-1', sessionId });
      const reply = mockReply();

      await AuthController.logout(req as any, reply);

      expect(req.jwtVerify).toHaveBeenCalled();
      expect(prisma.authSession.updateMany).toHaveBeenCalledWith({
        where: { id: sessionId, revokedAt: null },
        data: expect.objectContaining({ revokedReason: SessionRevocationReason.LOGOUT })
      });
      expect(reply.clearCookie).toHaveBeenCalledWith('accessToken', { path: '/' });
      expect(reply.clearCookie).toHaveBeenCalledWith('refreshToken', { path: '/api/v1/auth/refresh' });
    });
  });
});
