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

  test('REQ-007 should read balance and update funds correctly @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    const { res, json } = await getUserFunds(request, authHeader, userId);

    expect(res.status()).toBe(HTTP_STATUS.OK);
    expect(json.funds).toBeLessThanOrEqual(fundsTestData.zeroAmount);

    const { resUpdate, jsonUpdate } = await updateUserFunds(
      request,
      authHeader,
      userId,
      fundsTestData.validAmount,
    );

    expect(resUpdate.status()).toBe(HTTP_STATUS.OK);
    expect(jsonUpdate.newBalance).toEqual(fundsTestData.validAmount);
  });

  test('REQ-007 should create a transaction history entry after fund update @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;
    const { resHistory: resHistoryBefore, jsonHistory: jsonHistoryBefore } =
      await getFundsHistory(request, authHeader, userId);

    expect(resHistoryBefore.status()).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(jsonHistoryBefore.history)).toBe(true);
    expect(jsonHistoryBefore.history).toHaveLength(fundsTestData.zeroAmount);

    const { resUpdate, jsonUpdate } = await updateUserFunds(
      request,
      authHeader,
      userId,
      fundsTestData.validAmount,
    );

    expect(resUpdate.status()).toBe(HTTP_STATUS.OK);
    expect(jsonUpdate.newBalance).toEqual(fundsTestData.validAmount);

    const { resHistory: resHistoryAfter, jsonHistory: jsonHistoryAfter } =
      await getFundsHistory(request, authHeader, userId);

    expect(resHistoryAfter.status()).toBe(HTTP_STATUS.OK);
    expect(jsonHistoryAfter.history[fundsTestData.zeroAmount].amount).toEqual(
      fundsTestData.validAmount,
    );
  });

  test('REQ-007 should reject out-of-range amount @logged', async ({
    request,
    loggedUser,
  }) => {
    const { authHeader, userId } = loggedUser;

    await test.step('should accept 0 amount', async () => {
      const { resUpdate, jsonUpdate } = await updateUserFunds(
        request,
        authHeader,
        userId,
        fundsTestData.zeroAmount,
      );
      expect(resUpdate.status()).toBe(HTTP_STATUS.OK);
      expect(jsonUpdate.newBalance).toEqual(fundsTestData.zeroAmount);
    });

    await test.step('should reject negative amount', async () => {
      const { resUpdate } = await updateUserFunds(
        request,
        authHeader,
        userId,
        fundsTestData.negativeAmount,
      );
      expect(resUpdate.status()).toBe(HTTP_STATUS.BAD_REQUEST);

      const updateUserFundsZeroJson = await resUpdate.json();
      expect(updateUserFundsZeroJson.error).toBeTruthy();
    });

    await test.step('should reject extremely high amount', async () => {
      const { resUpdate } = await updateUserFunds(
        request,
        authHeader,
        userId,
        fundsTestData.excessiveAmount,
      );
      expect(resUpdate.status()).toBe(HTTP_STATUS.BAD_REQUEST);

      const updateUserFundsZeroJson = await resUpdate.json();
      expect(updateUserFundsZeroJson.error).toBeTruthy();
    });

    await test.step('should record only successful update in history', async () => {
      const { resHistory, jsonHistory } = await getFundsHistory(
        request,
        authHeader,
        userId,
      );

      expect(resHistory.status()).toBe(HTTP_STATUS.OK);
      expect(Array.isArray(jsonHistory.history)).toBe(true);
      expect(jsonHistory.history.length).toEqual(0);
    });
  });
});
