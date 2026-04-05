import {
  GetFundsHistoryResponse,
  GetFundsResponse,
  UpdateFundsResponse,
} from '@_src/models/funds.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getUserFunds(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<{ res: APIResponse; json: GetFundsResponse }> {
  const res = await request.get(apiUrls.getUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
  });
  const json: GetFundsResponse = await res.json();
  return { res, json };
}

export async function updateUserFunds(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
  amount: number,
): Promise<{ resUpdate: APIResponse; jsonUpdate: UpdateFundsResponse }> {
  const resUpdate = await request.put(apiUrls.putUserFundsUrl(userId), {
    headers: { Authorization: authHeader },
    data: { amount },
  });
  const jsonUpdate: UpdateFundsResponse = await resUpdate.json();

  return { resUpdate, jsonUpdate };
}

export async function getFundsHistory(
  request: APIRequestContext,
  authHeader: string,
  userId: number,
): Promise<{ resHistory: APIResponse; jsonHistory: GetFundsHistoryResponse }> {
  const resHistory = await request.get(apiUrls.getUserFundsHistoryUrl(userId), {
    headers: { Authorization: authHeader },
  });
  const jsonHistory: GetFundsHistoryResponse = await resHistory.json();
  return { resHistory, jsonHistory };
}
