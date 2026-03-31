import { expect, test } from '@_src/fixtures/user.fixture';
import {
  getFundsHistory,
  getUserFunds,
  updateUserFunds,
} from '@_src/helper/funds';
import { restoreSystem } from '@_src/helper/restore';
import { fundsTestData } from '@_src/test-data/funds.data';
import { HTTP_STATUS } from '@_src/utils/http-status';

test.describe('REQ-007 Funds', () => {
  test.beforeEach(async ({ request }) => {
    await restoreSystem(request);
  });

  test('REQ-007 should read balance and update funds correctly', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const fundsBeforeUpdate = await getUserFunds(request, authHeader, userId);
    expect(fundsBeforeUpdate.status()).toBe(HTTP_STATUS.OK);

    const fundsDataJson = await fundsBeforeUpdate.json();
    expect(fundsDataJson.funds).toBeLessThanOrEqual(fundsTestData.zeroAmount);

    const updatedFunds = await updateUserFunds(
      request,
      authHeader,
      userId,
      fundsTestData.validAmount,
    );
    expect(updatedFunds.status()).toBe(HTTP_STATUS.OK);

    const updatedFundsJson = await updatedFunds.json();
    expect(updatedFundsJson.newBalance).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should create a transaction history entry after fund update', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    const historyData = await getFundsHistory(request, authHeader, userId);
    expect(historyData.status()).toBe(HTTP_STATUS.OK);

    const historyDataJson = await historyData.json();
    expect(Array.isArray(historyDataJson.history)).toBe(true);
    expect(historyDataJson.history).toHaveLength(fundsTestData.zeroAmount);

    const updateFunds = await updateUserFunds(
      request,
      authHeader,
      userId,
      fundsTestData.validAmount,
    );
    expect(updateFunds.status()).toBe(HTTP_STATUS.OK);

    const updateFundsJson = await updateFunds.json();
    expect(updateFundsJson.newBalance).toEqual(fundsTestData.validAmount);

    const getUpdatedHistory = await getFundsHistory(
      request,
      authHeader,
      userId,
    );
    expect(getUpdatedHistory.status()).toBe(HTTP_STATUS.OK);

    const getUpdatedHistoryJson = await getUpdatedHistory.json();
    expect(
      getUpdatedHistoryJson.history[fundsTestData.zeroAmount].amount,
    ).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should reject out-of-range amount', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    await test.step('should accept 0 amount', async () => {
      const updateUserFundsZero = await updateUserFunds(
        request,
        authHeader,
        userId,
        fundsTestData.zeroAmount,
      );
      expect(updateUserFundsZero.status()).toBe(HTTP_STATUS.OK);

      const updateUserFundsZeroJson = await updateUserFundsZero.json();
      expect(updateUserFundsZeroJson.newBalance).toEqual(
        fundsTestData.zeroAmount,
      );
    });

    await test.step('should reject negative amount', async () => {
      const updateUserFundsZero = await updateUserFunds(
        request,
        authHeader,
        userId,
        fundsTestData.negativeAmount,
      );
      expect(updateUserFundsZero.status()).toBe(HTTP_STATUS.BAD_REQUEST);

      const updateUserFundsZeroJson = await updateUserFundsZero.json();
      expect(updateUserFundsZeroJson.error).toBeTruthy();
    });

    await test.step('should reject extremely high amount', async () => {
      const updateUserFundsZero = await updateUserFunds(
        request,
        authHeader,
        userId,
        fundsTestData.excessiveAmount,
      );
      expect(updateUserFundsZero.status()).toBe(HTTP_STATUS.BAD_REQUEST);

      const updateUserFundsZeroJson = await updateUserFundsZero.json();
      expect(updateUserFundsZeroJson.error).toBeTruthy();
    });

    await test.step('should record only successful update in history', async () => {
      const getHistory = await getFundsHistory(request, authHeader, userId);
      expect(getHistory.status()).toBe(HTTP_STATUS.OK);

      const getHistoryJson = await getHistory.json();
      expect(Array.isArray(getHistoryJson.history)).toBe(true);
      expect(getHistoryJson.history.length).toEqual(0);
    });
  });
});
