import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIResponse, expect } from '@playwright/test';

export const expectStatusOK = (response: APIResponse) => {
  expect(response.status()).toBe(HTTP_STATUS.OK);
};
export const expectSuccess = (json: { success?: boolean }) => {
  expect(json.success).toBe(true);
};
export const errorAssert = (json: any) => {
  expect(json.error?.message).toBeTruthy();
};
