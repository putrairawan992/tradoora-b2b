import { initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { checkoutTransaction } from '../../schema/transaction.schema';
import { transactionService } from '../../services/transaction.service';
import { z } from 'zod';

const t = initTRPC.context<Context>().create();

export const transactionRouter = t.router({
  checkout: t.procedure
    .input(checkoutTransaction)
    .mutation(async ({ input }) => {
      try {
        const result = await transactionService.checkout(input);
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message ?? 'Gagal memproses checkout',
        });
      }
    }),
listByUser: t.procedure
  .input(z.object({ userId: z.string() })) // Input mengharapkan objek dengan userId
  .query(async ({ input }) => {
    return transactionService.getTransactionsByUserId(input.userId);
  }),
});
