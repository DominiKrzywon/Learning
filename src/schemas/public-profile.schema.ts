import { z } from 'zod';

export const publicProfileSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string(),
  joinDate: z.string(),
  role: z.string(),
  enrollments: z.array(z.unknown()),
  certificates: z.array(z.unknown()),
  ratings: z.array(z.unknown()),
});
