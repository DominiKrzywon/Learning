import { FundsApi } from '@_src/api/funds.api';
import { expect, test } from '@_src/fixtures/user.fixture';
import { restoreSystem } from '@_src/helper/restore';
import { fundsTestData } from '@_src/test-data/funds.data';
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

    const { resFunds, jsonFunds } = await fundsApi.getFunds(userId);
    const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
      userId,
      fundsTestData.validAmount,
    );

    expect(resFunds.status()).toBe(HTTP_STATUS.OK);
    expect(jsonFunds.funds).toBeLessThanOrEqual(fundsTestData.zeroAmount);
    expect(resUpdateFunds.status()).toBe(HTTP_STATUS.OK);
    expect(jsonUpdateFunds.newBalance).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should create a transaction history entry after fund update @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    fundsApi = new FundsApi(request, authHeader);

    const { resFundsHistory, jsonFundsHistory } =
      await fundsApi.getFundsHistory(userId);
    const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
      userId,
      fundsTestData.validAmount,
    );
    const {
      resFundsHistory: resFundsHistoryAfter,
      jsonFundsHistory: jsonFundsHistoryAfter,
    } = await fundsApi.getFundsHistory(userId);

    expect(resFundsHistory.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonFundsHistory.history)).toBe(true);
    expect(jsonFundsHistory.history).toHaveLength(fundsTestData.zeroAmount);

    expect(resUpdateFunds.status()).toBe(HTTP_STATUS.OK);
    expect(jsonUpdateFunds.newBalance).toEqual(fundsTestData.validAmount);

    expect(resFundsHistoryAfter.status()).toBe(HTTP_STATUS.OK);
    expect(
      jsonFundsHistoryAfter.history[fundsTestData.zeroAmount].amount,
    ).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should reject out-of-range amount @logged', async ({
    request,
    loggedUser,
  }) => {
    const expectedErrorMessage = 'Invalid amount';
    const { authHeader, userId } = loggedUser;
    fundsApi = new FundsApi(request, authHeader);

    await test.step('should accept 0 amount', async () => {
      const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
        userId,
        fundsTestData.zeroAmount,
      );

      expect(resUpdateFunds.status()).toBe(HTTP_STATUS.OK);
      expect(jsonUpdateFunds.newBalance).toEqual(fundsTestData.zeroAmount);
    });

    await test.step('should reject negative amount', async () => {
      const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
        userId,
        fundsTestData.negativeAmount,
      );

      expect(resUpdateFunds.status()).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(jsonUpdateFunds.error.message).toBe(expectedErrorMessage);
    });

    await test.step('should reject extremely high amount', async () => {
      const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
        userId,
        fundsTestData.excessiveAmount,
      );

      expect(resUpdateFunds.status()).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(jsonUpdateFunds.error.message).toBe(expectedErrorMessage);
    });

    await test.step('should record only successful update in history', async () => {
      const { resFundsHistory, jsonFundsHistory } =
        await fundsApi.getFundsHistory(userId);

      expect(resFundsHistory.status()).toBe(HTTP_STATUS.OK);
      expect(Array.isArray(jsonFundsHistory.history)).toBe(true);
      expect(jsonFundsHistory.history.length).toEqual(0);
    });
  });
});
