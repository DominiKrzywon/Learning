import { CourseApi } from '@_src/api/course.api';
import { LessonApi } from '@_src/api/lesson.api';
import { restoreSystem } from '@_src/helper/restore';
import { createUserAndLogin } from '@_src/helper/user';
import { expect, test } from '@_src/merge.fixture';
import { courseData } from '@_src/test-data/course.data';

const courseId = courseData.defaultCourseId;

test.describe('Test for enrollment', () => {
  let authHeader: string;
  let userId: number;

  test.beforeEach(async ({ page, loginPage, courseViewerPage }) => {
    await restoreSystem(page.request);

    const user = await createUserAndLogin(page.request);
    authHeader = user.authHeader;
    userId = user.userId;
    const username = user.username;
    const password = user.password;

    const courseApi = new CourseApi(page.request, authHeader);
    await courseApi.enroll(courseId, userId);

    await loginPage.login({ username, password });
    await courseViewerPage.goto('?id=1&lesson=1');
  });

  test('COURSE-001 verify if marking lesson as complete shows success notification', async ({
    courseViewerPage,
  }) => {
    const lessonCompletedMessage = 'Lesson completed successfully!';
    await courseViewerPage.markAsCompleteButton.click();

    await expect(courseViewerPage.lessonCompletedNotification).toHaveText(
      lessonCompletedMessage,
    );
  });

  test('COURSE-002 verify if marking lesson as complete shows success notification', async ({
    page,
    courseViewerPage,
  }) => {
    const lessonApi = new LessonApi(page.request, authHeader);
    const courseApi = new CourseApi(page.request, authHeader);

    const { jsonGetLessons } = await lessonApi.getLessons(courseId);
    const lessonId = jsonGetLessons[0].id;
    await courseViewerPage.markAsCompleteButton.click();

    await expect(courseViewerPage.lessonCompletedNotification).toBeVisible();

    const { jsonGetProgress } = await courseApi.getProgress(courseId);

    expect(jsonGetProgress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ lessonId, courseId, completed: true }),
      ]),
    );
  });
});
