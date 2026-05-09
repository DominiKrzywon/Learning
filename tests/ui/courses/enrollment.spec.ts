import { CourseApi } from '@_src/api/course.api';
import { restoreSystem } from '@_src/helper/restore';
import { createUserAndLogin } from '@_src/helper/user';
import { expect, test } from '@_src/merge.fixture';
import { CourseProgressResponseSchema } from '@_src/schemas/progress.schema';
import { courseData } from '@_src/test-data/course.data';
import { fundsTestData } from '@_src/test-data/funds.data';
import { waitForResponse } from '@_src/ui/utils/wait.util';
import { apiUrls } from '@_src/utils/api.util';
import { expectSuccess } from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { Response } from '@playwright/test';

const courseQuery = `?id=${courseData.fourthCourseId}`;

test.describe('Tests for enrollment', () => {
  let authHeader: string;
  let userId: number;

  test.beforeEach(async ({ page, loginPage }) => {
    await restoreSystem(page.request);
    const user = await createUserAndLogin(page.request);
    authHeader = user.authHeader;
    userId = user.userId;
    await loginPage.login({ username: user.username, password: user.password });
  });

  test('ENROLL-001 should enroll user from course details @e2e', async ({
    page,
    courseDetailsPage,
    courseViewerPage,
  }) => {
    await courseDetailsPage.goto(courseQuery);

    let enrollResponse: Response;
    let enrollBody: {
      success: boolean;
      enrollment: { courseId: number; userId: number; completed: boolean };
    };

    [enrollResponse] = await Promise.all([
      waitForResponse(
        page,
        apiUrls.courseEnrollUrl(courseData.fourthCourseId),
        'POST',
        HTTP_STATUS.OK,
      ),
      courseDetailsPage.enroll(),
    ]);
    enrollBody = await enrollResponse.json();

    await expect.soft(courseViewerPage.url).toContain('course-viewer.html');
    await expect.soft(courseViewerPage.downloadTranscript).toBeVisible();
    await expect(courseDetailsPage.enrollButton).not.toBeVisible();

    expect(enrollResponse.status()).toBe(HTTP_STATUS.OK);
    expect(enrollBody.enrollment.courseId).toBe(courseData.fourthCourseId);
    expect(enrollBody.enrollment.completed).toBe(false);
    expect(enrollBody.enrollment.userId).toBe(userId);

    const courseApi = new CourseApi(page.request, authHeader);
    const { resGetProgress, jsonGetProgress } = await courseApi.getProgress(
      courseData.fourthCourseId,
    );
    expect(resGetProgress.ok()).toBe(true);
    const parsed = CourseProgressResponseSchema.safeParse(jsonGetProgress);
    expect(parsed.success).toBe(true);
  });

  test('ENROLL-002 should show enrolled course on dashboard @e2e', async ({
    courseDetailsPage,
    dashboardPage,
    page,
  }) => {
    await courseDetailsPage.goto(courseQuery);
    await courseDetailsPage.enroll();

    await dashboardPage.goto();

    await expect(
      dashboardPage.getCourse(courseData.fourthCourseId),
    ).toBeVisible();
    await expect(
      dashboardPage.getEnrollButton(courseData.fourthCourseId),
    ).not.toBeVisible();

    const courseApi = new CourseApi(page.request, authHeader);
    const { resGetProgress, jsonGetProgress } = await courseApi.getProgress(
      courseData.fourthCourseId,
    );
    expect(resGetProgress.ok()).toBe(true);
    expect(jsonGetProgress.length).toBe(0);
    const parsed = CourseProgressResponseSchema.safeParse(jsonGetProgress);
    expect(parsed.success).toBe(true);
  });

  test('ENROLL-003 should reject dashboard enrollment with insufficient funds @integration', async ({
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();

    await dashboardPage.getEnrollButton(courseData.fourthCourseId).click();

    await expect(dashboardPage.enrollError).toHaveText(
      dashboardPage.errorMessage,
    );

    const courseApi = new CourseApi(page.request, authHeader);
    const { resGetProgress } = await courseApi.getProgress(
      courseData.fourthCourseId,
    );

    expect(resGetProgress.status()).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('ENROLL-004 should allow dashboard enrollment after top-up @integration', async ({
    accountSettingsPage,
    dashboardPage,
    courseViewerPage,
    page,
  }) => {
    await accountSettingsPage.goto();
    const { before, after } = await accountSettingsPage.topUpFunds(
      fundsTestData.validAmount,
    );

    expect.soft(after - before).toBe(fundsTestData.validAmount);
    await expect
      .soft(accountSettingsPage.topUpSuccessNotification)
      .toContainText(
        accountSettingsPage.topUpSuccessMessage(fundsTestData.validAmount),
      );

    await dashboardPage.goto();
    const [enrollResponse] = await Promise.all([
      waitForResponse(
        page,
        apiUrls.courseEnrollUrl(courseData.fourthCourseId),
        'POST',
        HTTP_STATUS.OK,
      ),
      dashboardPage.getEnrollButton(courseData.fourthCourseId).click(),
    ]);
    const enrollBody = await enrollResponse.json();

    await expect(courseViewerPage.downloadTranscript).toBeVisible();
    expectSuccess(enrollBody);
    expect(enrollBody.enrollment.courseId).toBe(courseData.fourthCourseId);

    const courseApi = new CourseApi(page.request, authHeader);
    const { resGetProgress, jsonGetProgress } = await courseApi.getProgress(
      courseData.fourthCourseId,
    );
    expect(resGetProgress.ok()).toBe(true);
    expect(jsonGetProgress.length).toBe(0);
  });
});
