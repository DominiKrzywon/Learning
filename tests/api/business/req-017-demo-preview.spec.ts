import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { LessonModel } from '@_src/models/lessons.model';
import { courseData } from '@_src/test-data/course.data';
import { HTTP_STATUS } from '@_src/utils/http-status';

let lessonApi: LessonApi;
let courseApi: CourseApi;
const courseId = courseData.defaultCourseId;

test.describe('REQ-017 Free Demo Preview', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-017 should return preview lessons without authentication', async ({
    request,
  }) => {
    lessonApi = new LessonApi(request);
    const { responsePreview, jsonPreview } =
      await lessonApi.getPreview(courseId);

    expect(responsePreview.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonPreview.previewLessons)).toBe(true);
    expect(typeof jsonPreview.totalLessons).toBe('number');
    expect(jsonPreview.previewLessons.length).toBeLessThan(
      jsonPreview.totalLessons,
    );

    jsonPreview.previewLessons.forEach((lesson: LessonModel) => {
      expect(typeof lesson.id).toBe('number');
      expect(typeof lesson.title).toBe('string');
      expect(typeof lesson.type).toBe('string');
      expect(typeof lesson.completed).toBe('boolean');
      expect(typeof lesson.content).toBe('object');
    });
  });

  test('REQ-017 should show more content to enrolled user than preview @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);
    const { responsePreview, jsonPreview } =
      await lessonApi.getPreview(courseId);

    const previewCount = jsonPreview.previewLessons.length;
    const totalLessons = jsonPreview.totalLessons;

    const { resEnroll, jsonEnroll } = await courseApi.enrollCourse(
      courseId,
      userId,
    );
    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);

    expect(responsePreview.status()).toBe(HTTP_STATUS.OK);
    expect(resEnroll.status()).toBe(HTTP_STATUS.OK);
    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(jsonEnroll.enrollment.completed).toBe(false);
    expect(jsonLessons.length).toEqual(totalLessons);
    expect(jsonLessons.length).toBeGreaterThan(previewCount);
  });

  test('REQ-017 should return full lesson content for enrolled user @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    lessonApi = new LessonApi(request, authHeader);
    courseApi = new CourseApi(request, authHeader);

    const { resEnroll } = await courseApi.enrollCourse(courseId, userId);
    const { responseLessons, jsonLessons } =
      await lessonApi.getLessons(courseId);
    const lessonId = jsonLessons[0].id;
    const { responseContent, jsonContent } = await lessonApi.getContent(
      courseId,
      lessonId,
    );

    expect(resEnroll.status()).toBe(HTTP_STATUS.OK);
    expect(responseLessons.status()).toBe(HTTP_STATUS.OK);
    expect(responseContent.status()).toBe(HTTP_STATUS.OK);
    expect(jsonContent.content).toBeDefined();
    expect(typeof jsonContent.content).toBe('object');
  });

  test('REQ-017 should deny full lesson content without authentication', async ({
    request,
  }) => {
    lessonApi = new LessonApi(request);
    courseApi = new CourseApi(request);

    const { responsePreview, jsonPreview } =
      await lessonApi.getPreview(courseId);
    const previewLessonId = jsonPreview.previewLessons[0].id;
    const { responseContent, jsonContent } = await lessonApi.getContent(
      courseId,
      previewLessonId,
    );

    expect(responsePreview.status()).toBe(HTTP_STATUS.OK);
    expect(responseContent.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(jsonContent.error.message).toBeTruthy();
  });
});
