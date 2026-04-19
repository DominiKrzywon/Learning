import { FundsApi } from '@_src/api/funds.api';
import { ApiErrorResponseSchema } from '@_src/schemas/funds.schema';

export const getInvalidAmountRejection = async (
  fundsApi: FundsApi,
  userId: number,
  invalidAmount: number,
) => {
  const { resUpdateFunds, jsonUpdateFunds } = await fundsApi.updateFunds(
    userId,
    invalidAmount,
  );

  const parsed = ApiErrorResponseSchema.parse(jsonUpdateFunds);

  return {
    status: resUpdateFunds.status(),
    message: parsed.error.message,
  };
};
