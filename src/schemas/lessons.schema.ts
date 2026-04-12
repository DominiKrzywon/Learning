import { z } from 'zod';

export const VideoContentSchema = z.object({
  videoUrl: z.string(),
  transcript: z.string(),
});

export const ReadingContentSchema = z.object({
  text: z.string(),
  resources: z.array(z.string()),
});

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correct: z.number(),
});

export const QuizContentSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});

export const LessonSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.number(),
    title: z.string(),
    type: z.literal('video'),
    duration: z.string().optional(),
    completed: z.boolean(),
    content: VideoContentSchema,
  }),
  z.object({
    id: z.number(),
    title: z.string(),
    type: z.literal('reading'),
    duration: z.string().optional(),
    completed: z.boolean(),
    content: ReadingContentSchema,
  }),
  z.object({
    id: z.number(),
    title: z.string(),
    type: z.literal('quiz'),
    duration: z.string().optional(),
    completed: z.boolean(),
    content: QuizContentSchema,
  }),
]);

export const LessonTitleSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export const PreviewLessonsResponseSchema = z.object({
  previewLessons: z.array(LessonSchema),
  totalLessons: z.number(),
});

export const LessonContentResponseSchema = z.object({
  content: z.union([
    VideoContentSchema,
    ReadingContentSchema,
    QuizContentSchema,
  ]),
});
