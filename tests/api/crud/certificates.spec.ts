import { loginAndGetUser } from '@_src/helper/auth';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { expect, test } from '@playwright/test';

test.describe('Certificates API', () => {
  const courseId = 2;
  test('should not display certificates without auth', async ({ request }) => {
    const response = await request.get(apiUrls.certificatesUrl);
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(responseJson.error.message).toContain('Endpoint not found for GET');
  });

  test('should display user certificates after auth', async ({ request }) => {
    const { authHeader, userId } = await loginAndGetUser(request);
    const response = await request.get(apiUrls.userCertificatesUrl(userId), {
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();

    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(responseJson.certificates)).toBe(true);
    if (responseJson.certificates.length > 0) {
      expect(typeof responseJson.certificates[0].uuid).toBe('string');
    } else {
      expect(responseJson.certificates).toEqual([]);
    }
  });

  test('GET public certificate by UUID', async ({ request }) => {
    const { authHeader, userId } = await loginAndGetUser(request);
    const response = await request.get(apiUrls.userCertificatesUrl(userId), {
      headers: { Authorization: authHeader },
    });
    const responseJson = await response.json();
    const uuid = responseJson.certificates[0].uuid;

    const publicResponse = await request.get(
      apiUrls.publicCertificateUrl(uuid),
    );

    const publicJson = await publicResponse.json();

    expect(publicResponse.status()).toBe(HTTP_STATUS.OK);
    expect(publicJson.uuid).toBe(uuid);
  });

  test('generate course certificate (then restore DB)', async ({ request }) => {
    const { authHeader, userId } = await loginAndGetUser(request);
    await test.step('Enroll user if needed', async () => {
      const enrollmentsRes = await request.get(
        apiUrls.userEnrollmentsUrl(userId),
        {
          headers: { Authorization: authHeader },
        },
      );

      const enrollmentJson = await enrollmentsRes.json();
      const isEnrolled = enrollmentJson.some(
        (e: any) => e.courseId === courseId,
      );
      if (!isEnrolled) {
        const enrollRes = await request.post(
          apiUrls.courseEnrollUrl(courseId),
          {
            headers: { Authorization: authHeader },
            data: { userId },
          },
        );
        expect(enrollRes.status()).toBe(HTTP_STATUS.OK);
      }
    });

    await test.step('Complete all lessons', async () => {
      const lessonsRes = await request.get(apiUrls.courseLessonsUrl(courseId), {
        headers: { Authorization: authHeader },
      });
      const lessons = await lessonsRes.json();

      for (const l of lessons) {
        await request.post(apiUrls.lessonCompleteUrl(courseId, l.id), {
          headers: { Authorization: authHeader },
          data: { userId },
        });
      }
    });

    await test.step('Generate certificate', async () => {
      const generateCertRes = await request.post(
        apiUrls.generateCertificateUrl(courseId),
        { headers: { Authorization: authHeader }, data: { userId } },
      );
      const generateJson = await generateCertRes.json();

      expect(
        generateJson.uuid || generateJson.certificate || generateJson.success,
      ).toBeTruthy();
    });
    await test.step('Restore DB', async () => {
      const restoreDBRes = await request.get('/api/learning/system/restore2');
      expect(restoreDBRes.status()).toBe(HTTP_STATUS.OK);
    });
  });
});
