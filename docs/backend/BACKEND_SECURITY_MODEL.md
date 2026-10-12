# MUC PRO SUITE — Security, Authentication and Privacy Model

**Classification:** NEEDS DECISION for production deployment/provider details; the security architecture below is the recommended baseline.

## Authentication lock

| Concern | Recommendation |
| --- | --- |
| Password hashing | Argon2id with per-password random salt and parameters held in typed configuration. Store only the encoded hash. A future dependency addition is justified; no password implementation exists today. |
| Access credential | Short-lived signed JWT access token (recommended 10–15 minutes), with subject user UUID, session ID, token version, issued/expiry timestamps and minimal authorization hints. Do not put PII, domain assignments, or permissions in a long-lived claim. |
| Refresh credential | Opaque, high-entropy random refresh token. Store only a hash in a `session`/refresh-token family record, rotate on every use, detect reuse and revoke the entire family when reuse is detected. Recommended 30-day maximum with configurable idle timeout. |
| Web transport | Same-site secure HTTP-only refresh cookie for admin web when deployed on same trusted site; do not expose refresh tokens to JavaScript. The Expo mobile client receives refresh/access tokens in the authenticated response and stores them only in Expo SecureStore. |
| Login | Identifier (email/employee/register number as allowed by account type) + password; generic failure message; rate limit by IP and account; increment failed count; temporary lock policy is configurable. |
| Logout/revocation | Revoke current session/token family server-side; clear web cookie/mobile secure store. Account disable, password reset, admin security action, token-reuse detection and role removal revoke applicable sessions. |
| Password reset | Single-use, hashed, expiry-bound reset token; generic request response; audit request/consume; invalidate active sessions after reset. Send no token/hash to logs. |
| Session/audit | Record session/device metadata, creation, refresh, revocation, login success/failure and lock events; minimize IP/user-agent retention under policy. |

The current admin web `localStorage` Zustand auth state and constant `SUPER_ADMIN` helper are mock UI only. The current mobile hard-coded credentials and placeholder token values are also not authentication. The mobile Axios refresh shape is a useful non-authoritative client boundary.

## Configuration and secrets

- Validate all runtime configuration at Fastify startup with a server-only Zod schema: database URL, JWT signing key/public-key configuration, refresh pepper if used, cookie origin/secure settings, allowed CORS origins, file provider credentials, payment webhook secret, and notification provider credentials.
- Keep secrets out of Git, browser-exposed `NEXT_PUBLIC_*`/`EXPO_PUBLIC_*` variables, client bundles, logs, audit before/after JSON and error responses. Public app environment variables contain endpoint URLs only.
- Separate development/staging/production credentials and databases. Rotate secrets with a documented runbook. Production must terminate TLS and set trust-proxy explicitly only for known proxy topology.
- `GET /api/health` should evolve into unauthenticated liveness only; readiness must not disclose database configuration/error detail publicly.

## Authorization and data minimization

| Sensitive data | Read | Modify | Controls |
| --- | --- | --- | --- |
| Student PII/guardian/contact/DOB/blood group | Student self; scoped faculty when academically necessary; Master/scoped admin | Limited self fields; authorized institutional admin | Field-level DTOs, ownership/scope checks, audit high-risk access |
| Faculty PII | Faculty self; Master/scoped admin | Self-limited/authorized admin | Do not return full personnel profiles to student endpoints |
| Attendance/results | Student self when appropriate published/visible; assigned faculty; authorized academic/COE roles | Assigned faculty entry; Attendance/COE-controlled workflow | Enrollment scope and published/locked state checks |
| Finance/payment/receipts | Student self; Finance/Master | Finance workflow only | Never return provider secrets/full gateway payload; receipt access scoped |
| Placement profile/resume | Student self; Placement/Master oversight | Student own placement fields; Placement workflow fields only | Private file authorization; no cross-student resume access |
| Certificates/PDFs | Requester self/authorized certificate admin | Certificate Admin workflow | Signed/authorized download; revoked document policy applies |
| Audit/security logs | Super Admin, narrowly delegated security access | Append only via services | Redaction and retention policy; no public IP/session disclosure |

## API and file protections

- Authenticate every non-auth/non-liveness route. Require permission and record-scope checks before data access; use select projections rather than returning Prisma models blindly.
- Schema-validate request body/query/params and response DTOs. Apply payload/file-size limits, rate limits, request IDs, safe error mapping and structured security logs.
- Store files outside the web root. Persist metadata only; authorize before issuing a short-lived download/upload URL. Validate MIME type/size, malware-scan state and ownership/classification before serving.
- Payment webhook routes authenticate by provider signature and raw-body verification, not by user JWT; deduplicate every provider event.
- Use CORS allow-list and cookie origin/CSRF controls appropriate to final web deployment. Bearer-token API routes do not rely on a browser cookie alone.

## Privacy and retention decisions

Retention periods, legal export/erasure workflow, malware scanning provider, recovery point/recovery time targets, and any public certificate verification policy are not present in the repository. They are required operational decisions. Public QR/online certificate verification is explicitly out of scope under the college rules.
