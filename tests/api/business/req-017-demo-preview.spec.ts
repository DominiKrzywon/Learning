import { expect, test } from '@_src/fixtures/user.fixture';
import { enrollAndGetFirstLessonId } from '@_src/helper/enroll-lesson';
import { getPreviewLessons } from '@_src/helper/preview';
import { restoreSystem } from '@_src/helper/restore';
import { LessonModel } from '@_src/models/lessons.model';
import { courseData } from '@_src/test-data/course.data';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';

const courseId = courseData.defaultCourseId;

test.describe('REQ-017 Free Demo Preview', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-017 should return preview lessons without authentication', async ({
    request,
  }) => {
    const previewLessons = await getPreviewLessons(request, courseId);
    expect(previewLessons.status()).toBe(HTTP_STATUS.OK);

    const responseJson = await previewLessons.json();
    expect(Array.isArray(responseJson.previewLessons)).toBe(true);
    expect(typeof responseJson.totalLessons).toBe('number');
    expect(responseJson.previewLessons.length).toBeLessThan(
      responseJson.totalLessons,
    );

    responseJson.previewLessons.forEach((lesson: LessonModel) => {
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
    const previewLesson = await getPreviewLessons(request, courseId);
    const previewLessonJson = await previewLesson.json();

    const previewCount = previewLessonJson.previewLessons.length;
    const totalLessons = previewLessonJson.totalLessons;

    const { authHeader, userId } = loggedUser;

    const enrollUser = await request.post(apiUrls.courseEnrollUrl(courseId), {
      data: { userId },
      headers: { Authorization: authHeader },
    });
    expect(enrollUser.status()).toBe(HTTP_STATUS.OK);

    const getLessons = await request.get(apiUrls.courseLessonsUrl(courseId), {
      headers: { Authorization: authHeader },
    });

    const getLessonsJson = await getLessons.json();
    expect(getLessonsJson.length).toEqual(totalLessons);
    expect(getLessonsJson.length).toBeGreaterThan(previewCount);
  });

  test('REQ-017 should return full lesson content for enrolled user @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const lessonId = await enrollAndGetFirstLessonId(
      request,
      authHeader,
      userId,
      courseId,
    );

    const getContent = await request.get(
      apiUrls.lessonContentUrl(courseId, lessonId),
      { headers: { Authorization: authHeader } },
    );
    const getContentJson = await getContent.json();

    expect(getContent.status()).toBe(HTTP_STATUS.OK);
    expect(getContentJson.content).toBeDefined();
    expect(typeof getContentJson.content).toBe('object');
  });

  test('REQ-017 should deny full lesson content without authentication', async ({
    request,
  }) => {
    const previewLesson = await getPreviewLessons(request, courseId);
    const previewLessonJson = await previewLesson.json();
    const previewLessonId = previewLessonJson.previewLessons[0].id;

    const wrongGetContent = await request.get(
      apiUrls.lessonContentUrl(courseId, previewLessonId),
    );

    const wrongContentJson = await wrongGetContent.json();
    expect(wrongGetContent.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(wrongContentJson.error).toBeTruthy();
  });
});
