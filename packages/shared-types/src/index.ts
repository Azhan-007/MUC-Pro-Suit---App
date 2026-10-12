import { z } from 'zod';

/**
 * Backend authorization vocabulary. New backend code must use this schema.
 * The legacy UserRoleSchema remains below to avoid breaking the frozen mock UI.
 */
export const BackendRoleCodeSchema = z.enum([
  'SUPER_ADMIN',
  'MASTER_ADMIN',
  'DOMAIN_ADMIN',
  'FACULTY',
  'STUDENT',
]);
export type BackendRoleCode = z.infer<typeof BackendRoleCodeSchema>;

/** @deprecated Mock-frontend vocabulary only; never use for backend authorization. */
export const UserRoleSchema = z.enum(['SUPERADMIN', 'ADMIN', 'STUDENT', 'FACULTY']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
});
export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
