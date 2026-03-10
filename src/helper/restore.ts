import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIRequestContext, expect } from '@playwright/test';

const restoreUrl = '/api/learning/system/restore2';

export async function restoreSystem(request: APIRequestContext) {
  const restoreRes = await request.get(restoreUrl);
  expect(restoreRes.status()).toBe(HTTP_STATUS.OK);
}
