import { APIRequestContext } from '@playwright/test';

const restoreUrl = '/api/learning/system/restore2';

export async function restoreSystem(request: APIRequestContext) {
  const restoreRes = await request.get(restoreUrl);
  if (!restoreRes.ok()) {
    throw new Error(`System restore failed with status ${restoreRes.status()}`);
  }
}
