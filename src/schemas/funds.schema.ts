import { z } from 'zod';

export const GetFundsResponseSchema = z.object({
  funds: z.number(),
});

export const UpdateFundsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  newBalance: z.number(),
});

export const FundsHistoryEntrySchema = z.object({
  userId: z.number(),
  amount: z.number(),
  type: z.string(),
  timestamp: z.string(),
  description: z.string(),
});

export const GetFundsHistoryResponseSchema = z.object({
  history: z.array(FundsHistoryEntrySchema),
});

export const ApiErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});
