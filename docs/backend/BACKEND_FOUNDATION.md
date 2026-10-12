# Backend Foundation

The backend foundation leverages Fastify, Prisma, and PostgreSQL.

## Core Setup
- **Fastify:** Used for high-performance HTTP routing. Includes plugins for CORS, rate-limiting, and error handling.
- **Prisma:** ORM used for database interactions. A Fastify plugin manages the Prisma client lifecycle.
- **Configuration:** Environment variables are strictly typed and validated using Zod in `src/config/env.ts`.

## Essential Services
1. **Error Handling:** Global error handler catches `AppError` and `ZodError` to return standard JSON responses.
2. **Request IDs:** Every request is assigned a `reqId` and `correlationId` to track requests across services and logs.
3. **Audit Service:** Centralized service to log critical actions. Includes actor details, before/after states, and outcomes.
4. **Idempotency Service:** Ensures operations (like payments or data modifications) happen exactly once, using DB locks.
5. **Outbox Service:** Transactional outbox pattern foundation for reliable event publishing.
