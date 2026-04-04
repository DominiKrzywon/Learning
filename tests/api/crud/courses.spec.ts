import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { CourseRatingModel } from '@_src/models/course.model';
import { courseData } from '@_src/test-data/course.data';
import { testUser1 } from '@_src/test-data/user.data';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIRequestContext } from '@playwright/test';

async function enrollUserInCourse(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  courseId: number,
) {
  const enrollRes = await request.post(apiUrls.courseEnrollUrl(courseId), {
    data: { userId },
    headers: { Authorization: authHeader },
  });

  expect(enrollRes.status()).toBe(HTTP_STATUS.OK);
}

test.describe('Courses API', () => {
  let courseId = courseData.defaultCourseId;
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('should displayed all courses @logged', async ({ request }) => {
    const response = await request.get(apiUrls.coursesUrl);
    const responseJson = await response.json();

    const firstCourse = responseJson[0];

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson)).toBe(true);
    expect(responseJson.length).toBeGreaterThan(0);
    expect(firstCourse.id).toBeTruthy();
    expect(['Beginner', 'Intermediate', 'Advanced']).toContain(
      firstCourse.level,
    );
  });

  test('should return course details by ID', async ({ request }) => {
    const courseId = courseData.fourthCourseId;
    const response = await request.get(apiUrls.courseByIdUrl(courseId));
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(responseJson).toMatchObject({
      id: 4,
      title: 'Playwright Automation Testing',
      description:
        'Learn end-to-end testing with Playwright. Automate browser interactions, test web applications, and write reliable tests.',
      thumbnail: '..\\data\\learning\\courses\\playwright.jpg',
      instructor: 'John Doe',
      instructorId: 2,
      level: 'Intermediate',
      tags: ['Playwright', 'Testing', 'Automation'],
      prerequisites: ['JavaScript', 'Testing Basics'],
      price: 129.99,
      learningObjectives: [
        'Master Playwright automation testing',
        'Automate browser interactions',
        'Write reliable end-to-end tests',
        'Test web applications effectively',
        'Debug and optimize test scripts',
        'Implement testing best practices',
      ],
      totalHours: 2.2,
      duration: '2.2 hour(s)',
    });
    expect(typeof responseJson.students).toBe('number');
    expect(typeof responseJson.rating).toBe('number');
  });

  test('should not displayed course with ID 9999', async ({ request }) => {
    const courseId = courseData.nonExistingCourseId;
    const response = await request.get(apiUrls.courseByIdUrl(courseId));
    const responseBody = await response.text();
    const responseJson = JSON.parse(responseBody);

    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(responseJson.error.message).toBe('Course not found');
  });

  test('should displayed course ratings @logged', async ({ request }) => {
    const courseId = courseData.secondCourseId;
    const response = await request.get(apiUrls.courseRatingsUrl(courseId));
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson)).toBe(true);

    responseJson.forEach((rating: CourseRatingModel) => {
      expect(rating.rating).toBeGreaterThanOrEqual(0);
      expect(rating.rating).toBeLessThanOrEqual(5);
      expect(typeof rating.comment).toBe('string');
      expect(rating.createdAt).toBeTruthy();
      expect(rating.userInfo).toHaveProperty('name');
    });
  });

  test('should display progress for user @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    await enrollUserInCourse(request, authHeader, userId, courseId);

    const progressResponse = await request.get(
      apiUrls.courseProgressUrl(courseId),
      { headers: { Authorization: authHeader } },
    );

    expect(progressResponse.status()).toBe(HTTP_STATUS.OK);
    const progress = await progressResponse.json();
    expect(typeof progress.progress).toBe('number');
  });

  test('should not display progress for not authorized user @logged', async ({
    request,
  }) => {
    const response = await request.post(apiUrls.loginUrl, { data: testUser1 });

    const progressResponse = await request.get(
      apiUrls.courseProgressUrl(courseId),
    );
    expect(response).toBeDefined();
    expect(progressResponse.status()).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('should not display rate when user is not at this course @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader } = loggedUser;
    const rateResponse = await request.post(apiUrls.courseRateUrl(courseId), {
      data: { rating: 4, comment: 'test' },
      headers: { Authorization: authHeader },
    });

    expect(rateResponse.status()).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
