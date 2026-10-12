import fp from 'fastify-plugin';
import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

export default fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors,
      });
    }

    // Fastify built-in errors
    if ('statusCode' in error && error.statusCode) {
      return reply.status(error.statusCode).send({
        code: 'BAD_REQUEST',
        message: error.message,
      });
    }

    // Unhandled errors
    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  });
});
