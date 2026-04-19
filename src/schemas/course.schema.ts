import { z } from 'zod';

export const CourseLevelSchema = z.enum([
  'Beginner',
  'Intermediate',
  'Advanced',
]);

export const CourseDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  instructor: z.string(),
  instructorId: z.number(),
  level: CourseLevelSchema,
  tags: z.array(z.string()),
  prerequisites: z.array(z.string()),
  price: z.number(),
  learningObjectives: z.array(z.string()),
  students: z.number(),
  rating: z.number(),
  totalHours: z.number(),
  duration: z.string(),
});

export const CourseRatingSchema = z.object({
  userId: z.number(),
  courseId: z.number(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string(),
  userInfo: z.object({
    name: z.string(),
    avatar: z.string(),
    id: z.number(),
  }),
});

export const CourseRatingResponseSchema = z.array(CourseRatingSchema);
