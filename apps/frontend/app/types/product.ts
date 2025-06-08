import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "@tradoora/backend/trpc/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type ProductType = RouterOutputs['product']['list'][number];