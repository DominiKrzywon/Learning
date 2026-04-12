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
  ): Promise<{ resGetFunds: APIResponse; jsonGetFunds: GetFundsResponse }> {
    const resGetFunds = await this.request.get(
      apiUrls.getUserFundsUrl(userId),
      {
        headers: { Authorization: this.authHeader! },
      },
    );
    const jsonGetFunds = await resGetFunds.json();

    return { resGetFunds, jsonGetFunds };
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

  async getHistory(userId: number): Promise<{
    resGetHistory: APIResponse;
    jsonGetHistory: GetFundsHistoryResponse;
  }> {
    const resGetHistory = await this.request.get(
      apiUrls.getUserFundsHistoryUrl(userId),
      {
        headers: { Authorization: this.authHeader! },
      },
    );
    const jsonGetHistory = await resGetHistory.json();
    return { resGetHistory, jsonGetHistory };
  }
}
