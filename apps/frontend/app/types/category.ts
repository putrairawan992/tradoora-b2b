import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "@tradoora/backend/trpc/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type CategoriesListResponse = RouterOutputs['category']['list']; 

export type CategoryListItemType = CategoriesListResponse[number]; 