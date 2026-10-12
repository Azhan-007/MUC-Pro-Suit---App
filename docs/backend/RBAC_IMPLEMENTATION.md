# RBAC Implementation

## Core Roles
- `SUPER_ADMIN`
- `MASTER_ADMIN`
- `DOMAIN_ADMIN`
- `FACULTY`
- `STUDENT`

## Structure
- Uses `UserRoleAssignment` for time-bound role assignment.
- Uses `DomainAssignment` for scoped administrative access.

## Fastify Integration
- `fastify.requireRole([...roles])` decorator enforces role-based access.
- It dynamically queries `UserRoleAssignment` ensuring the user has an active, backend-verified role assignment.
- Never trusts client-side role claims.
