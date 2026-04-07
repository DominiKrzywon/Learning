import {
  GetFundsHistoryResponse,
  GetFundsResponse,
} from '@_src/models/funds.model';
import { apiUrls } from '@_src/utils/api.util';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class FundsApi {
  constructor(
    private request: APIRequestContext,
    private authHeader?: string,
  ) {}

  async getFunds(
    userId: number,
  ): Promise<{ resFunds: APIResponse; jsonFunds: GetFundsResponse }> {
    const resFunds = await this.request.get(apiUrls.getUserFundsUrl(userId), {
      headers: { Authorization: this.authHeader! },
    });
    const jsonFunds = await resFunds.json();

    return { resFunds, jsonFunds };
  }

  async updateFunds(
    userId: number,
    amount: number,
  ): Promise<{
    resUpdateFunds: APIResponse;
    jsonUpdateFunds: any;
  }> {
    const resUpdateFunds = await this.request.put(
      apiUrls.putUserFundsUrl(userId),
      {
        headers: { Authorization: this.authHeader! },
        data: { amount },
      },
    );
    const jsonUpdateFunds = await resUpdateFunds.json();
    return { resUpdateFunds, jsonUpdateFunds };
  }

  async getFundsHistory(userId: number): Promise<{
    resFundsHistory: APIResponse;
    jsonFundsHistory: GetFundsHistoryResponse;
  }> {
    const resFundsHistory = await this.request.get(
      apiUrls.getUserFundsHistoryUrl(userId),
      {
        headers: { Authorization: this.authHeader! },
      },
    );
    const jsonFundsHistory = await resFundsHistory.json();
    return { resFundsHistory, jsonFundsHistory };
  }
}
