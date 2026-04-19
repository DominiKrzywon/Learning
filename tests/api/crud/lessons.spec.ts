import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import {
  LessonContentResponseSchema,
  LessonSchema,
  LessonTitleSchema,
  PreviewLessonsResponseSchema,
} from '@_src/schemas/lessons.schema';
import { courseData } from '@_src/test-data/course.data';
import { expectStatusOK, expectSuccess } from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';
import z from 'zod';

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
    expect(jsonGetLessons.length).toBeGreaterThan(expectedZeroNumber);

    const validLessons = z.array(LessonSchema).parse(jsonGetLessons);
    validLessons.forEach((lesson) => {
      expect(lesson.id).toBeGreaterThanOrEqual(expectedLengthNumber);
    });
  });

  test('should return lesson titles', async ({ request }) => {
    const expectedZeroNumber = 0;
    const lessonApi = new LessonApi(request);
    const { resGetTitles, jsonGetTitles } = await lessonApi.getTitles(courseId);

    expectStatusOK(resGetTitles);

    const lessonTitles = z.array(LessonTitleSchema).parse(jsonGetTitles);

    expect(lessonTitles.length).toBeGreaterThan(expectedZeroNumber);

    const ids = lessonTitles.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);

    lessonTitles.forEach((lesson) => {
      expect(lesson.title.length).toBeGreaterThan(expectedZeroNumber);
    });
  });

  test('should return preview lessons', async ({ request }) => {
    const expectedLengthNumber = 1;
    const lessonApi = new LessonApi(request);
    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);

    expectStatusOK(resGetPreview);

    const preview = PreviewLessonsResponseSchema.parse(jsonGetPreview);

    expect(preview.previewLessons.length).toBeGreaterThan(expectedLengthNumber);
    expect(preview.previewLessons.length).toBeLessThanOrEqual(
      preview.totalLessons,
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

    const content = LessonContentResponseSchema.parse(jsonGetContent);

    if ('videoUrl' in content.content) {
      expect(content.content.videoUrl.length).toBeGreaterThan(
        expectedZeroNumber,
      );
      expect(content.content.transcript.length).toBeGreaterThan(
        expectedZeroNumber,
      );
    }

    expectStatusOK(resGetLessons);
    expectStatusOK(resGetContent);
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
