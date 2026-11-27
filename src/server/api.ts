import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Context } from 'hono';

import { getRequestListener } from '@hono/node-server';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import * as v from 'valibot';

import type { CommentStore } from '#src/core/store.ts';
import type { AgentRunner } from '#src/server/agent/runner.ts';
import type { AllowedHostsOption } from '#src/server/http.ts';

import { AgentSettingsPatchSchema, PROVIDERS } from '#src/core/agent-state.ts';
import { COMMENT_ID_PATTERN, CommentInputSchema, CommentPatchSchema } from '#src/core/schema.ts';
import { isAllowedHost, isAllowedOrigin, MAX_BODY_BYTES } from '#src/server/http.ts';

export type ApiHandlerOptions = {
  allowedHosts?: AllowedHostsOption;
  agent: AgentRunner;
};

const ProviderQuerySchema = v.picklist(PROVIDERS);

const RunBodySchema = v.object({
  ids: v.pipe(
    v.array(v.pipe(v.string(), v.regex(COMMENT_ID_PATTERN))),
    v.minLength(1),
    v.maxLength(200),
  ),
});

const parseJsonBody = async <T extends v.GenericSchema>(
  c: Context,
  schema: T,
): Promise<{ ok: true; data: v.InferOutput<T> } | { ok: false; response: Response }> => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return { ok: false, response: c.json({ error: 'invalid_json' }, 400) };
  }

  const parsed = v.safeParse(schema, raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: c.json({ error: 'invalid_body', issues: v.flatten(parsed.issues) }, 400),
    };
  }

  return { ok: true, data: parsed.output };
};

export const createApiApp = (store: CommentStore, options: ApiHandlerOptions): Hono => {
  const app = new Hono();

  // Security & no-store headers on all API routes
  app.use('*', async (c, next) => {
    const host = c.req.header('host');
    const origin = c.req.header('origin');
    const forwardedHost = c.req.header('x-forwarded-host');

    if (!isAllowedHost(host, options.allowedHosts)) {
      return c.json({ error: 'forbidden_host' }, 403);
    }

    if (
      !isAllowedOrigin(
        {
          method: c.req.method,
          headers: { host, origin, 'x-forwarded-host': forwardedHost },
        },
        options.allowedHosts,
      )
    ) {
      return c.json({ error: 'forbidden_origin' }, 403);
    }

    await next();
    c.header('Cache-Control', 'no-store');
  });

  app.use(
    '*',
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) => {
        return c.json({ error: 'too_large' }, 413);
      },
    }),
  );

  // ── Comments API ──────────────────────────────────────────────────────────
  app.get('/comments', async (c) => {
    const comments = await store.list();
    return c.json({ comments });
  });

  app.post('/comments', async (c) => {
    const parsed = await parseJsonBody(c, CommentInputSchema);
    if (!parsed.ok) {
      return parsed.response;
    }
    const comment = await store.create(parsed.data);
    return c.json({ comment }, 201);
  });

  app.delete('/comments', async (c) => {
    if (c.req.query('status') !== 'resolved') {
      return c.json({ error: 'method_not_allowed' }, 405);
    }
    const removed = await store.clearResolved();
    for (const removedId of removed) {
      await options.agent.forget(removedId);
    }
    return c.json({ removed });
  });

  app.patch('/comments/:id', async (c) => {
    const id = c.req.param('id');
    if (options.agent.isRunning(id)) {
      return c.json({ error: 'busy' }, 409);
    }
    const parsed = await parseJsonBody(c, CommentPatchSchema);
    if (!parsed.ok) {
      return parsed.response;
    }
    const updated = await store.patch(id, parsed.data);
    if (!updated) {
      return c.json({ error: 'not_found' }, 404);
    }
    await options.agent.reconcile();
    return c.json({ comment: updated });
  });

  app.delete('/comments/:id', async (c) => {
    const id = c.req.param('id');
    if (options.agent.isRunning(id)) {
      return c.json({ error: 'busy' }, 409);
    }
    const deleted = await store.remove(id);
    if (!deleted) {
      return c.json({ error: 'not_found' }, 404);
    }
    await options.agent.forget(id);
    return c.json({ deleted: true });
  });

  // ── Agent API ─────────────────────────────────────────────────────────────
  app.get('/agent', async (c) => {
    const info = await options.agent.info();
    return c.json(info);
  });

  app.get('/agent/models', async (c) => {
    const parsed = v.safeParse(ProviderQuerySchema, c.req.query('provider'));
    if (!parsed.success) {
      return c.json({ error: 'invalid_provider' }, 400);
    }
    const models = await options.agent.models(parsed.output);
    return c.json({ models });
  });

  app.get('/agent/mcp-servers', async (c) => {
    const parsed = v.safeParse(ProviderQuerySchema, c.req.query('provider'));
    if (!parsed.success) {
      return c.json({ error: 'invalid_provider' }, 400);
    }
    const servers = await options.agent.mcpServers(parsed.output);
    return c.json({ servers });
  });

  app.get('/agent/logs/:runId', async (c) => {
    const runId = c.req.param('runId');
    if (!COMMENT_ID_PATTERN.test(runId)) {
      return c.json({ error: 'invalid_run_id' }, 400);
    }
    const log = await options.agent.readLog(runId);
    if (!log) {
      return c.json({ error: 'not_found' }, 404);
    }
    return c.json({ runId, raw: log.raw, active: log.active });
  });

  app.put('/agent/settings', async (c) => {
    const parsed = await parseJsonBody(c, AgentSettingsPatchSchema);
    if (!parsed.ok) {
      return parsed.response;
    }
    const settings = await options.agent.updateSettings(parsed.data);
    return c.json({ settings });
  });

  app.post('/agent/run', async (c) => {
    const parsed = await parseJsonBody(c, RunBodySchema);
    if (!parsed.ok) {
      return parsed.response;
    }
    const result = await options.agent.run(parsed.data.ids);
    if (!result.ok) {
      return c.json(result.error, 409);
    }
    return c.json(result.value, 202);
  });

  app.post('/agent/cancel', async (c) => {
    await options.agent.cancel();
    return c.json({ ok: true });
  });

  app.post('/agent/resume', async (c) => {
    const result = await options.agent.resume();
    if (!result.ok) {
      return c.json({ error: result.error }, 409);
    }
    return c.json({ ok: true });
  });

  return app;
};

export const createApiHandler = (
  store: CommentStore,
  options: ApiHandlerOptions,
): ((req: IncomingMessage, res: ServerResponse) => Promise<void>) => {
  const app = createApiApp(store, options);
  const listener = getRequestListener(app.fetch);
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    await listener(req, res);
  };
};
