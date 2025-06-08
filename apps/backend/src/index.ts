import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { trpcServer } from '@hono/trpc-server';

import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { transactionService } from './services/transaction.service';

const app = new Hono();
app.use(logger());

app.get('/', (c) => c.text('API is running'));
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post("/midtrans/callback", async (c) => {
  try {
    const payload = await c.req.json();
    await transactionService.handleCallback(payload);
    return c.json({ message: "Callback processed" }, 200);
  } catch (err) {
    console.error("Callback processing error:", err instanceof Error ? err.message : err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.vercel.app',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => !!origin);

app.use(
  '/trpc/*',
  cors({
    origin: (origin, c) => {
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      return origin; 
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'trpc-batch-mode'],
    credentials: true,
  })
);

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
  })
);

export default app;
