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
import { expectStatusOK, expectSuccess } from '@_src/utils/assertions';
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
    const expectedErrorMessage = 'Not authorized to access this course';
    const { authHeader } = loggedUser;
    const lessonApi = new LessonApi(request, authHeader);

    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);

    expect(resGetLessons.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonGetLessons.error.message).toBe(expectedErrorMessage);
  });

  test('should get lessons with authorize user', async ({
    request,
    loggedUser,
  }) => {
    const expectedLengthNumber = 1;
    const expectedZeroNumber = 0;
    const { authHeader, userId } = loggedUser;
    const courseApi = new CourseApi(request, authHeader);
    const lessonApi = new LessonApi(request, authHeader);

    await courseApi.enroll(courseId, userId);

    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);

    expectStatusOK(resGetLessons);
    expect(Array.isArray(jsonGetLessons)).toBe(true);
    expect(jsonGetLessons.length).toBeGreaterThan(expectedZeroNumber);

    jsonGetLessons.forEach((lesson: LessonModel) => {
      expect(lesson.id).toBeGreaterThanOrEqual(expectedLengthNumber);
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
        expect(quizContent.questions[expectedZeroNumber]).toHaveProperty(
          'question',
        );
        expect(quizContent.questions[expectedZeroNumber]).toHaveProperty(
          'options',
        );
        expect(typeof quizContent.questions[expectedZeroNumber].correct).toBe(
          'number',
        );
      }
    });
  });

  test('should return lesson titles', async ({ request }) => {
    const lessonApi = new LessonApi(request);
    const { resGetTitles, jsonGetTitles } = await lessonApi.getTitles(courseId);

    expectStatusOK(resGetTitles);
    expect(Array.isArray(jsonGetTitles)).toBe(true);
    jsonGetTitles.forEach((title: { id: number; title: string }) => {
      expect(typeof title.id).toBe('number');
      expect(typeof title.title).toBe('string');
    });
  });

  test('should return preview lessons', async ({ request }) => {
    const expectedLengthNumber = 1;
    const lessonApi = new LessonApi(request);
    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);

    expectStatusOK(resGetPreview);
    expect(Array.isArray(jsonGetPreview.previewLessons)).toBe(true);
    expect(jsonGetPreview.previewLessons.length).toBeGreaterThan(
      expectedLengthNumber,
    );
    expect(typeof jsonGetPreview.totalLessons).toBe('number');
    expect(jsonGetPreview.previewLessons.length).toBeLessThanOrEqual(
      jsonGetPreview.totalLessons,
    );
  });

  test('should get lesson content with authorized user', async ({
    request,
    loggedUser,
  }) => {
    const expectedZeroNumber = 0;
    const { authHeader, userId } = loggedUser;
    const courseApi = new CourseApi(request, authHeader);
    const lessonApi = new LessonApi(request, authHeader);

    await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);

    const lessonId = jsonGetLessons[expectedZeroNumber].id;
    const { resGetContent, jsonGetContent } = await lessonApi.getContent(
      courseId,
      lessonId,
    );

    expectStatusOK(resGetLessons);
    expectStatusOK(resGetContent);
    expect(typeof jsonGetContent.content.videoUrl).toBe('string');
    expect(typeof jsonGetContent.content.transcript).toBe('string');
  });

  test('should mark lesson as completed for authorized user', async ({
    request,
    loggedUser,
  }) => {
    const expectedZeroNumber = 0;
    const { authHeader, userId } = loggedUser;
    const courseApi = new CourseApi(request, authHeader);
    const lessonApi = new LessonApi(request, authHeader);

    await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);

    const lessonId = jsonGetLessons[expectedZeroNumber].id;
    const { resComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    expectStatusOK(resGetLessons);
    expectStatusOK(resComplete);
    expectSuccess(jsonComplete);
  });
});
