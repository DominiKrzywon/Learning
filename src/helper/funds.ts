import {
  GetFundsHistoryResponse,
  GetFundsResponse,
  UpdateFundsResponse,
} from '@_src/models/funds.model';
import { apiUrls } from '@_src/utils/api.util';
import { HTTP_STATUS } from '@_src/utils/http-status';
import { APIRequestContext, expect } from '@playwright/test';

export async function getUserFunds(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<GetFundsResponse> {
  const getFunds = await request.get(apiUrls.getUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
  });
  expect(getFunds.status()).toBe(HTTP_STATUS.OK);

  return getFunds.json();
}

export async function updateUserFunds(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  amount: number,
): Promise<UpdateFundsResponse> {
  const updateFunds = await request.put(apiUrls.putUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
    data: { amount },
  });
  expect(updateFunds.status()).toBe(HTTP_STATUS.OK);

  return updateFunds.json();
}

export async function getFundsHistory(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<GetFundsHistoryResponse> {
  const fundsHistory = await request.get(
    apiUrls.getUserFundsHistoryUrl(userId),
    {
      headers: { Authorization: authHeader },
    },
  );
  expect(fundsHistory.status()).toBe(HTTP_STATUS.OK);

  return fundsHistory.json();
}
