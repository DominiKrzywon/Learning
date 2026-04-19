import { z } from 'zod';

export const ProgressEntrySchema = z.object({
  userId: z.number(),
  courseId: z.number(),
  lessonId: z.number(),
  completed: z.boolean(),
  completedAt: z.string(),
});

export const CourseProgressResponseSchema = z.array(ProgressEntrySchema);
