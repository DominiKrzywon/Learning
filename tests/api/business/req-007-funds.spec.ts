import { FundsApi } from '@_src/api/funds.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { getInvalidAmountRejection } from '@_src/helper/funds';
import { restoreSystem } from '@_src/helper/restore';
import {
  GetFundsHistoryResponseSchema,
  GetFundsResponseSchema,
  UpdateFundsResponseSchema,
} from '@_src/schemas/funds.schema';
import { fundsTestData } from '@_src/test-data/funds.data';
import { expectStatusOK } from '@_src/utils/assertions';
import { HTTP_STATUS } from '@_src/utils/http-status';

let fundsApi: FundsApi;

test.describe('REQ-007 Funds', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-007 should read balance and update funds correctly @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    fundsApi = new FundsApi(request, authHeader);

    const { resGetFunds, jsonGetFunds } = await fundsApi.getFunds(userId);
    const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
      userId,
      fundsTestData.validAmount,
    );

    const getFundsSchema = GetFundsResponseSchema.parse(jsonGetFunds);
    const updatedFundsSchema = UpdateFundsResponseSchema.parse(jsonUpdateFunds);

    expectStatusOK(resGetFunds);
    expectStatusOK(resUpdateFunds);

    expect(getFundsSchema.funds).toEqual(fundsTestData.zeroAmount);
    expect(updatedFundsSchema.newBalance).toEqual(fundsTestData.validAmount);

    const { jsonGetFunds: afterFunds } = await fundsApi.getFunds(userId);
    const afterFundsSchema = GetFundsResponseSchema.parse(afterFunds);

    expect(afterFundsSchema.funds).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should create a transaction history entry after fund update @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedSuccessMessage = 'Funds updated successfully';
    const { authHeader, userId } = loggedUser;
    fundsApi = new FundsApi(request, authHeader);

    const { resGetHistory, jsonGetHistory } = await fundsApi.getHistory(userId);
    const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
      userId,
      fundsTestData.validAmount,
    );
    const {
      resGetHistory: resGetHistoryAfter,
      jsonGetHistory: jsonGetHistoryAfter,
    } = await fundsApi.getHistory(userId);

    const historySchema = GetFundsHistoryResponseSchema.parse(jsonGetHistory);
    const historySchemaAfterUpdate =
      GetFundsHistoryResponseSchema.parse(jsonGetHistoryAfter);

    const historyUpdate = UpdateFundsResponseSchema.parse(jsonUpdateFunds);

    expectStatusOK(resGetHistory);
    expectStatusOK(resUpdateFunds);
    expectStatusOK(resGetHistoryAfter);

    expect(historyUpdate.message).toBe(expectedSuccessMessage);
    expect(historySchema.history).toHaveLength(fundsTestData.zeroAmount);
    expect(historyUpdate.newBalance).toEqual(fundsTestData.validAmount);
    expect(historySchemaAfterUpdate.history.length).toBeGreaterThan(
      fundsTestData.zeroAmount,
    );
    expect(
      historySchemaAfterUpdate.history[fundsTestData.zeroAmount].amount,
    ).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should reject out-of-range amount @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedZeroCount = 0;
    const expectedErrorMessage = 'Invalid amount';
    const { authHeader, userId } = loggedUser;
    fundsApi = new FundsApi(request, authHeader);

    await test.step('should accept 0 amount', async () => {
      const expectedSuccessMessage = 'Funds updated successfully';
      const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
        userId,
        fundsTestData.zeroAmount,
      );

      const updateSchema = UpdateFundsResponseSchema.parse(jsonUpdateFunds);

      expectStatusOK(resUpdateFunds);
      expect(jsonUpdateFunds.newBalance).toEqual(fundsTestData.zeroAmount);
      expect(updateSchema.message).toBe(expectedSuccessMessage);
    });

    await test.step('should reject negative amount', async () => {
      const rejection = await getInvalidAmountRejection(
        fundsApi,
        userId,
        fundsTestData.negativeAmount,
      );

      expect(rejection.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(rejection.message).toBe(expectedErrorMessage);
    });

    await test.step('should reject extremely high amount', async () => {
      const rejection = await getInvalidAmountRejection(
        fundsApi,
        userId,
        fundsTestData.excessiveAmount,
      );

      expect(rejection.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(rejection.message).toBe(expectedErrorMessage);
    });

    await test.step('should not create history entries for rejected amounts', async () => {
      const { resGetHistory, jsonGetHistory } =
        await fundsApi.getHistory(userId);

      const historySchema = GetFundsHistoryResponseSchema.parse(jsonGetHistory);
      expect(historySchema.history).toHaveLength(expectedZeroCount);
      expectStatusOK(resGetHistory);
    });
  });
});
