import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getUserFunds(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<APIResponse> {
  return request.get(apiUrls.getUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
  });
}

export async function updateUserFunds(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  amount: number,
): Promise<APIResponse> {
  return request.put(apiUrls.putUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
    data: { amount },
  });
}

export async function getFundsHistory(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<APIResponse> {
  return request.get(apiUrls.getUserFundsHistoryUrl(userId), {
    headers: { Authorization: authHeader },
  });
}
