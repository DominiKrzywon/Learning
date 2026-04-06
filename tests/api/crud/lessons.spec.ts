import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import {
  LessonModel,
  QuizContent,
  ReadingContent,
} from '@_src/models/lessons.model';
import { courseData } from '@_src/test-data/course.data';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('Lessons API', () => {
  const courseId = courseData.defaultCourseId;

  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('should deny lesson access for unauthorized user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader } = loggedUser;
    const lessonApi = new LessonApi(request, authHeader);

    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);

    expect(responseLessons.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonLessons.error.message).toBe(
      'Not authorized to access this course',
    );
  });

  test('should get lessons with authorize user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    const courseApi = new CourseApi(request, authHeader);
    const lessonApi = new LessonApi(request, authHeader);

    await courseApi.enrollCourse(courseId, userId);

    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);

    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonLessons)).toBe(true);
    expect(jsonLessons.length).toBeGreaterThan(1);

    jsonLessons.forEach((lesson: LessonModel) => {
      expect(lesson.id).toBeGreaterThanOrEqual(1);
      expect(typeof lesson.title).toBe('string');
      expect(typeof lesson.completed).toBe('boolean');

      if (lesson.duration !== undefined) {
        expect(typeof lesson.duration).toBe('string');
      }

      if (lesson.type === 'video') {
        expect(lesson.content).toHaveProperty('videoUrl');
        expect(lesson.content).toHaveProperty('transcript');
      }
      if (lesson.type === 'reading') {
        const readingContent = lesson.content as ReadingContent;
        expect(lesson.content).toHaveProperty('text');
        expect(Array.isArray(readingContent.resources)).toBe(true);
      }
      if (lesson.type === 'quiz') {
        const quizContent = lesson.content as QuizContent;
        expect(Array.isArray(quizContent.questions)).toBe(true);
        expect(quizContent.questions[0]).toHaveProperty('question');
        expect(quizContent.questions[0]).toHaveProperty('options');
        expect(typeof quizContent.questions[0].correct).toBe('number');
      }
    });
  });

  test('should return lesson titles', async ({ request }) => {
    const lessonApi = new LessonApi(request);
    const { responseTitles, jsonTitles } = await lessonApi.getTitles(courseId);

    expect(responseTitles.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonTitles)).toBe(true);
    jsonTitles.forEach((title: { id: number; title: string }) => {
      expect(typeof title.id).toBe('number');
      expect(typeof title.title).toBe('string');
    });
  });

  test('should return preview lessons', async ({ request }) => {
    const lessonApi = new LessonApi(request);
    const { responsePreview, jsonPreview } =
      await lessonApi.getPreview(courseId);

    expect(responsePreview.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonPreview.previewLessons)).toBe(true);
    expect(jsonPreview.previewLessons.length).toBeGreaterThan(1);
    expect(typeof jsonPreview.totalLessons).toBe('number');
    expect(jsonPreview.previewLessons.length).toBeLessThanOrEqual(
      jsonPreview.totalLessons,
    );
  });

  test('should get lesson content with authorized user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    const courseApi = new CourseApi(request, authHeader);
    const lessonApi = new LessonApi(request, authHeader);

    await courseApi.enrollCourse(courseId, userId);
    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);

    const lessonId = jsonLessons[0].id;
    const { responseContent, jsonContent } = await lessonApi.getContent(
      courseId,
      lessonId,
    );

    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(responseContent.status()).toBe(HTTP_STATUS.OK);
    expect(typeof jsonContent.content.videoUrl).toBe('string');
    expect(typeof jsonContent.content.transcript).toBe('string');
  });

  test('should mark lesson as completed for authorized user', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    const courseApi = new CourseApi(request, authHeader);
    const lessonApi = new LessonApi(request, authHeader);

    await courseApi.enrollCourse(courseId, userId);
    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);

    const lessonId = jsonLessons[0].id;
    const { responseComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(responseComplete.status()).toBe(HTTP_STATUS.OK);
    expect(jsonComplete.success).toBe(true);
  });
});
