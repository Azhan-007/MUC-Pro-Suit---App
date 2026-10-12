import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '@muc/database';

export const getAppVersion = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { platform = 'ANDROID', currentVersion } = req.query as { platform?: string, currentVersion?: string };
    
    let dbVersion = null;
    try {
      // Find the latest active version for the platform
      // @ts-ignore - type may not be generated yet
      dbVersion = await (prisma as any).appVersion.findFirst({
        where: { platform: platform.toUpperCase(), status: 'ACTIVE' },
        orderBy: { buildNumber: 'desc' },
      });
    } catch (e) {
      // If table doesn't exist yet (before migration), fallback gracefully
      console.warn('AppVersion table not found. Returning default OTA config.', e);
    }

    const defaultOTA = {
      latestVersion: '1.0.1',
      otaUpdateAvailable: true, 
      isMandatory: false,
      releaseNotes: 'Welcome to MUC Pro Suite Beta.\n- Minor fixes and improvements.',
      minRequiredVersion: '1.0.0'
    };

    if (dbVersion) {
      reply.send({
        success: true,
        data: {
          latestVersion: dbVersion.version,
          otaUpdateAvailable: dbVersion.version !== currentVersion,
          isMandatory: dbVersion.isMandatory,
          releaseNotes: dbVersion.releaseNotes || 'New updates available.',
          minRequiredVersion: dbVersion.minRequiredVersion || '1.0.0'
        }
      });
    } else {
      reply.send({
        success: true,
        data: defaultOTA
      });
    }
  } catch (error) {
    req.log.error(error);
    reply.status(500).send({ success: false, error: 'Failed to fetch OTA info' });
  }
};
