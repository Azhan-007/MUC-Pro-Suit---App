# Authentication Implementation

## Mechanism
- **JWT:** Short-lived access tokens via `@fastify/jwt`.
- **Cookies:** HTTP-only secure cookies for web clients via `@fastify/cookie`.
- **Password Hashing:** Argon2id via `argon2` package. Configured for memoryCost 65536, timeCost 3, parallelism 4.
- **Refresh Tokens:** `AuthSession` model supports family IDs and rotation (not yet fully wired in controllers).

## Fastify Integration
- Augmented `@fastify/jwt` to strictly type `JwtPayload`.
- `fastify.authenticate` decorator available for route protection.

## Password Security
- Passwords are never logged or returned.
- Validation and hashing encapsulated in `src/utils/password.ts`.
