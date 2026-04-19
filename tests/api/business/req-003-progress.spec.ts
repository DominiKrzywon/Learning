import { AuthApi } from '@_src/api/auth.api';
import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { PreviewLessonsResponseSchema } from '@_src/schemas/lessons.schema';
import { CourseProgressResponseSchema } from '@_src/schemas/progress.schema';
import { courseData } from '@_src/test-data/course.data';
import { expectStatusOK, expectSuccess } from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';

let courseApi: CourseApi;
let lessonApi: LessonApi;
let authApi: AuthApi;

test.describe('REQ-003 User Progress Monitor', () => {
  const courseId = courseData.defaultCourseId;
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-003 should track progress after lesson completion @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedEmptyProgressCount = 0;
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { resEnroll } = await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonGetLessons[expectedEmptyProgressCount].id;

    const {
      resGetProgress: beforeResGetProgress,
      jsonGetProgress: beforeJsonGetProgress,
    } = await courseApi.getProgress(courseId);

    const { resComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    const {
      resGetProgress: afterResGetProgress,
      jsonGetProgress: afterJsonGetProgress,
    } = await courseApi.getProgress(courseId);

    const progressBefore = CourseProgressResponseSchema.parse(
      beforeJsonGetProgress,
    );
    const progressAfter =
      CourseProgressResponseSchema.parse(afterJsonGetProgress);

    expectStatusOK(beforeResGetProgress);
    expectStatusOK(resEnroll);
    expectStatusOK(resGetLessons);
    expectStatusOK(resComplete);
    expectStatusOK(afterResGetProgress);
    expectSuccess(jsonComplete);

    expect(progressBefore.length).toBe(expectedEmptyProgressCount);
    expect(progressAfter).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ lessonId, courseId, completed: true }),
      ]),
    );
  });

  test('REQ-003 should persist progress after relogin @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedZeroCount = 0;
    const { authHeader, userId, username, password } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);
    authApi = new AuthApi(request);

    const { resEnroll } = await courseApi.enroll(courseId, userId);
    const { resGetLessons, jsonGetLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonGetLessons[expectedZeroCount].id;
    const { resComplete, jsonComplete } = await lessonApi.complete(
      courseId,
      lessonId,
      userId,
    );

    const { resGetProgress, jsonGetProgress } =
      await courseApi.getProgress(courseId);
    const { resLogin, jsonLogin } = await authApi.login({ username, password });
    const {
      resGetProgress: afterResGetProgress,
      jsonGetProgress: afterJsonGetProgress,
    } = await courseApi.getProgress(courseId);

    const progressBefore = CourseProgressResponseSchema.parse(jsonGetProgress);
    const progressAfter =
      CourseProgressResponseSchema.parse(afterJsonGetProgress);

    const beforeEntry = progressBefore.find(
      (p) => p.lessonId === lessonId && p.courseId === courseId,
    );

    const afterEntry = progressAfter.find(
      (p) => p.lessonId === lessonId && p.courseId === courseId,
    );

    expect(beforeEntry).toBeDefined();
    expect(afterEntry).toBeDefined();

    expect(beforeEntry?.completed).toBe(true);
    expect(afterEntry?.completed).toBe(true);

    expect(afterEntry?.completedAt).toEqual(beforeEntry?.completedAt);
    expect(progressAfter.length).toEqual(progressBefore.length);

    expectStatusOK(resEnroll);
    expectStatusOK(resGetLessons);
    expectStatusOK(resComplete);
    expectStatusOK(resLogin);
    expectStatusOK(afterResGetProgress);
    expectStatusOK(resGetProgress);
    expectSuccess(jsonComplete);
    expectSuccess(jsonLogin);
  });

  test('REQ-003 should reject lesson completion for non-enrolled course @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedZeroCount = 0;
    const expectedErrorMessage = 'User not enrolled in this course';
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { resGetPreview, jsonGetPreview } =
      await lessonApi.getPreview(courseId);
    const { previewLessons } = jsonGetPreview;
    const lessonId = previewLessons[expectedZeroCount].id;
    await lessonApi.complete(courseId, lessonId, userId);
    const { resGetProgress, jsonGetProgress } =
      await courseApi.getProgress(courseId);

    const previewLessonsSchema =
      PreviewLessonsResponseSchema.parse(jsonGetPreview);

    expectStatusOK(resGetPreview);
    expect(previewLessons.length).toBeGreaterThan(expectedZeroCount);
    expect(resGetProgress.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(jsonGetProgress.error.message).toBe(expectedErrorMessage);
  });
});
