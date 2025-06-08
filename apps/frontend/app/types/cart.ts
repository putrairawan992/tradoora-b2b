import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "@tradoora/backend/trpc/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ListCartType = RouterOutputs['cart']['list'];

export type InsertCartType = RouterOutputs['cart']['add'];

export type CountCartType = RouterOutputs['cart']['count'];

export type UpdateCartType = RouterOutputs['cart']['updateQty'];

export type ClearAllCartType = RouterOutputs['cart']['clear'];

export type RemoveCartType = RouterOutputs['cart']['remove'];