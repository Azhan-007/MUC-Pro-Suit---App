import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { prisma } from '@muc/database';
import { hashPassword } from '../../utils/password';
import authPlugin from '../../plugins/auth';
import { authRoutes } from './auth.routes';
import { academicRoutes } from '../academic/academic.routes';
import fastifyCookie from '@fastify/cookie';

import { AuthClientType, SessionRevocationReason } from '@prisma/client';

describe('Auth Security Integration Tests', () => {
  let fastify: any;
  let testUser: any;
  let testInactiveUser: any;
  let studentUser: any;
  let libraryAdminUser: any;
  let superAdminUser: any;

  beforeAll(async () => {
    fastify = Fastify();
    
    // Minimal required plugins
    await fastify.decorate('prisma', prisma);
    
    // Auth plugin provides authenticate and requireDomain
    await fastify.register(authPlugin);
    
    // Register routes to test real middleware execution
    await fastify.register(authRoutes, { prefix: '/auth' });
    await fastify.register(academicRoutes, { prefix: '/academic' });

    await fastify.ready();

    // 1. Valid Admin User
    testUser = await prisma.user.upsert({
      where: { normalizedEmail: 'test_admin@example.com' },
      update: { passwordHash: await hashPassword('password123'), status: 'ACTIVE' },
      create: {
        normalizedEmail: 'test_admin@example.com',
        normalizedUsername: 'testadmin',
        passwordHash: await hashPassword('password123'),
        status: 'ACTIVE',
      },
    });

    // 2. Inactive User
    testInactiveUser = await prisma.user.upsert({
      where: { normalizedEmail: 'inactive@example.com' },
      update: { passwordHash: await hashPassword('password123'), status: 'INACTIVE' },
      create: {
        normalizedEmail: 'inactive@example.com',
        normalizedUsername: 'inactiveuser',
        passwordHash: await hashPassword('password123'),
        status: 'INACTIVE',
      },
    });

    // 3. Student User
    studentUser = await prisma.user.upsert({
      where: { normalizedEmail: 'student@example.com' },
      update: { passwordHash: await hashPassword('password123'), status: 'ACTIVE' },
      create: {
        normalizedEmail: 'student@example.com',
        normalizedUsername: 'studentuser',
        passwordHash: await hashPassword('password123'),
        status: 'ACTIVE',
      },
    });
    
    // 4. Library Domain Admin
    libraryAdminUser = await prisma.user.upsert({
      where: { normalizedEmail: 'libraryadmin@example.com' },
      update: { passwordHash: await hashPassword('password123'), status: 'ACTIVE' },
      create: {
        normalizedEmail: 'libraryadmin@example.com',
        normalizedUsername: 'libraryadminuser',
        passwordHash: await hashPassword('password123'),
        status: 'ACTIVE',
      },
    });

    // 5. Super Admin
    superAdminUser = await prisma.user.upsert({
      where: { normalizedEmail: 'superadmin@example.com' },
      update: { passwordHash: await hashPassword('password123'), status: 'ACTIVE' },
      create: {
        normalizedEmail: 'superadmin@example.com',
        normalizedUsername: 'superadminuser',
        passwordHash: await hashPassword('password123'),
        status: 'ACTIVE',
      },
    });

    // Setup roles
    const masterRole = await prisma.role.findUnique({ where: { code: 'MASTER_ADMIN' } });
    const domainRole = await prisma.role.findUnique({ where: { code: 'DOMAIN_ADMIN' } });
    const studentRole = await prisma.role.findUnique({ where: { code: 'STUDENT' } });
    const superRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });

    // Assign roles
    if (masterRole) {
      await prisma.userRoleAssignment.createMany({
        data: [{ userId: testUser.id, roleId: masterRole.id }],
        skipDuplicates: true
      });
    }

    if (superRole) {
      await prisma.userRoleAssignment.createMany({
        data: [{ userId: superAdminUser.id, roleId: superRole.id }],
        skipDuplicates: true
      });
    }
    
    if (domainRole) {
      await prisma.userRoleAssignment.createMany({
        data: [{ userId: libraryAdminUser.id, roleId: domainRole.id }],
        skipDuplicates: true
      });
      // Assign specific domain
      await prisma.domainAssignment.createMany({
        data: [{ userId: libraryAdminUser.id, domain: 'LIBRARY' }],
        skipDuplicates: true
      });
    }

    if (studentRole) {
      await prisma.userRoleAssignment.createMany({
        data: [{ userId: studentUser.id, roleId: studentRole.id }],
        skipDuplicates: true
      });
    }
  });

  afterAll(async () => {
    const userIds = [testUser.id, testInactiveUser.id, studentUser.id, libraryAdminUser.id, superAdminUser.id];
    
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.auditLog.deleteMany({
      where: { OR: [{ actorId: { in: userIds } }, { resourceId: { in: userIds } }] }
    });
    await prisma.domainAssignment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.userRoleAssignment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  it('TEST 1 — Revoked Session Denied', async () => {
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { identifier: 'testadmin', password: 'password123', clientType: AuthClientType.MOBILE }
    });
    
    const { accessToken, refreshToken } = loginRes.json();
    const [sessionId] = refreshToken.split('.');
    
    // Revoke session in DB manually
    await prisma.authSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), revokedReason: SessionRevocationReason.LOGOUT }
    });

    // Use access token on protected route
    const meRes = await fastify.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${accessToken}` }
    });
    
    expect(meRes.statusCode).toBe(401);
    expect(meRes.json().message).toBe('Invalid or expired token');
  });

  it('TEST 2 — Inactive User Denied', async () => {
    // We cannot login an inactive user directly, so we create a session manually
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { identifier: 'testadmin', password: 'password123', clientType: AuthClientType.MOBILE } // Valid login first
    });
    const { accessToken, refreshToken } = loginRes.json();
    const [sessionId] = refreshToken.split('.');

    // Attach session to inactive user to simulate account deletion post-login
    await prisma.authSession.update({
      where: { id: sessionId },
      data: { userId: testInactiveUser.id }
    });
    
    // Generate a fresh token for this user
    const token = await fastify.jwt.sign({ userId: testInactiveUser.id, familyId: '1', sessionId });

    const meRes = await fastify.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` }
    });
    
    expect(meRes.statusCode).toBe(401);
    expect(meRes.json().message).toBe('Invalid or expired token');
  });

  it('TEST 3 — Cross-Domain Isolation (Library Admin on Academic Route)', async () => {
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { identifier: 'libraryadminuser', password: 'password123', clientType: AuthClientType.MOBILE }
    });
    const { accessToken } = loginRes.json();

    const academicRes = await fastify.inject({
      method: 'POST',
      url: '/academic/classes',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {} // Payload doesn't matter if we hit 401/403 first
    });

    expect(academicRes.statusCode).toBe(401); // Throws UnauthorizedError which maps to 401 (or 403)
    expect(academicRes.json().message).toBe('Insufficient permissions for domain ACADEMIC');
  });

  it('TEST 4 — Student Administrative Rejection', async () => {
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { identifier: 'studentuser', password: 'password123', clientType: AuthClientType.MOBILE }
    });
    const { accessToken } = loginRes.json();

    const academicRes = await fastify.inject({
      method: 'POST',
      url: '/academic/classes',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {}
    });

    expect(academicRes.statusCode).toBe(401); // UnauthorizedError
    expect(academicRes.json().message).toBe('Insufficient domain permissions');
  });

  it('TEST 5 — SUPER_ADMIN Access', async () => {
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { identifier: 'superadminuser', password: 'password123', clientType: AuthClientType.MOBILE }
    });
    const { accessToken } = loginRes.json();

    const academicRes = await fastify.inject({
      method: 'POST',
      url: '/academic/classes',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {} // Empty payload might trigger 400 validation error, but we just want to get past 401
    });

    // Status shouldn't be 401 or 403, it should be 400 (validation) or 500 (db error) meaning auth passed
    expect(academicRes.statusCode).not.toBe(401);
    expect(academicRes.statusCode).not.toBe(403);
  });

  it('TEST 6 — Logout with expired JWT revokes session successfully', async () => {
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { identifier: 'testadmin', password: 'password123', clientType: AuthClientType.MOBILE }
    });
    
    const { accessToken, refreshToken } = loginRes.json();
    const [sessionId] = refreshToken.split('.');
    
    // Simulate expired token by generating a new one with a manual old `exp`
    const now = Math.floor(Date.now() / 1000);
    const expiredToken = await fastify.jwt.sign(
      { userId: testUser.id, familyId: '1', sessionId, iat: now - 7200, exp: now - 3600 },
      {}
    );

    const logoutRes = await fastify.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: { authorization: `Bearer ${expiredToken}` },
      payload: { allDevices: false }
    });

    expect(logoutRes.statusCode).toBe(200);

    // Verify session is actually revoked in DB
    const session = await prisma.authSession.findUnique({ where: { id: sessionId } });
    expect(session?.revokedAt).not.toBeNull();
  });
});
