import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

import type { StudioTheme } from '#src/registry.ts';
import type { AgentPolicyOptions } from '#src/server/agent/providers.ts';

import { createCommentStore, isCommentFileName } from '#src/core/store.ts';
import { resolvePolicy } from '#src/server/agent/providers.ts';
import { createAgentRunner } from '#src/server/agent/runner.ts';
import { createSettingsStore } from '#src/server/agent/settings.ts';
import { createApiHandler } from '#src/server/api.ts';

export type ArtboardPluginOptions = {
  /**
   * URL path where the dev-only Artboard studio is mounted.
   * @default '/__artboard'
   */
  route?: string;
  /**
   * Path to the consumer's Svelte 5 entry component (e.g. `./artboard/Artboard.svelte`)
   * that renders `<Artboard {sections} />`.
   * @default './artboard/Artboard.svelte'
   */
  entry?: string;
  /**
   * Directory (relative to Vite project root) where `.artboard/comments/*.json`, settings,
   * and agent logs are stored. Add this folder to `.gitignore`.
   * @default '.artboard'
   */
  dir?: string;
  /**
   * Extra Host headers accepted by `/__artboard/api` (in addition to localhost, IP literals,
   * and Vite's `server.allowedHosts`). Set to `true` or `['.ts.net']` for Tailscale Serve.
   */
  allowedHosts?: true | string[];
  /**
   * Policy and command configuration for the built-in AI Agent runner (`claude` / `agy`).
   */
  agent?: AgentPolicyOptions;
  /**
   * Optional path (or array of paths) to the consumer's stylesheet(s) so components rendered
   * inside artboards receive the app's styles.
   */
  css?: string | string[];
  /**
   * Page title shown in the browser tab.
   * @default 'Artboard Studio — Dev UI Review'
   */
  title?: string;
  /**
   * Default UI theme for the Artboard Studio chrome itself (sidebar, toolbar, canvas).
   * Separate from your app's own themes.
   * @default 'dark'
   */
  studioTheme?: StudioTheme;
  /**
   * localStorage key prefix for persisted Studio UI preferences (studioTheme, debug toggle).
   * @default 'sveltekit-artboard-prefs-v1'
   */
  storageKey?: string;
  /**
   * Back-to-app URL shown in the Studio sidebar footer.
   * @default '/'
   */
  appUrl?: string;
  /**
   * Whether debug & performance tools (Stress Test, IntersectionObserver mounted counter,
   * FPS meter, mounted dots) are visible by default.
   * @default false
   */
  debug?: boolean;
};

export const COMMENTS_CHANGED_EVENT = 'artboard:comments-changed';
export const AGENT_CHANGED_EVENT = 'artboard:agent-changed';
export const AGENT_LOG_EVENT = 'artboard:agent-log';

const VIRTUAL_ENTRY_ID = 'virtual:sveltekit-artboard-entry';
const RESOLVED_VIRTUAL_ENTRY_ID = `\0${VIRTUAL_ENTRY_ID}`;

const STUDIO_ENTRY = fileURLToPath(
  new URL(import.meta.url.endsWith('.ts') ? './client/studio.ts' : './studio.js', import.meta.url),
).replaceAll('\\', '/');
const STUDIO_DIR = path.posix.dirname(STUDIO_ENTRY);

const toFsImport = (filePath: string): string => {
  const normalized = filePath.replaceAll('\\', '/');
  return normalized.startsWith('/') ? `/@fs${normalized}` : `/@fs/${normalized}`;
};

export const artboard = (options: ArtboardPluginOptions = {}): Plugin => {
  const route = (options.route ?? '/__artboard').replace(/\/+$/, '') || '/__artboard';
  const apiBase = `${route}/api`;
  const entryPath = options.entry ?? './artboard/Artboard.svelte';
  const title = options.title ?? 'Artboard Studio — Dev UI Review';
  const studioTheme: StudioTheme = options.studioTheme ?? 'dark';
  const storageKey = options.storageKey ?? 'sveltekit-artboard-prefs-v1';
  const appUrl = options.appUrl ?? '/';
  const defaultDebug = Boolean(options.debug);

  let root = process.cwd();

  const createHtml = (): string => {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;overflow:hidden;">
    <div id="artboard-root"></div>
    <script type="module" src="/@id/__x00__${VIRTUAL_ENTRY_ID}"></script>
  </body>
</html>`;
  };

  return {
    name: 'sveltekit-artboard',
    enforce: 'pre',
    apply: (_config, env): boolean => {
      return env.command === 'serve' && !process.env.VITEST;
    },
    configResolved(config): void {
      root = config.root;
      if (!config.server.fs.allow.includes(STUDIO_DIR)) {
        config.server.fs.allow.push(STUDIO_DIR);
      }
    },
    resolveId(id): string | undefined {
      if (id === VIRTUAL_ENTRY_ID || id === `/@id/__x00__${VIRTUAL_ENTRY_ID}`) {
        return RESOLVED_VIRTUAL_ENTRY_ID;
      }
      return undefined;
    },
    load(id): string | undefined {
      if (id !== RESOLVED_VIRTUAL_ENTRY_ID) {
        return undefined;
      }

      const resolvedEntry = path.resolve(root, entryPath).replaceAll('\\', '/');
      let cssList: string[] = [];
      if (Array.isArray(options.css)) {
        cssList = options.css;
      } else if (options.css) {
        cssList = [options.css];
      }

      const lines: string[] = [];

      for (const cssFile of cssList) {
        const resolvedCss = path.resolve(root, cssFile).replaceAll('\\', '/');
        lines.push(`import ${JSON.stringify(toFsImport(resolvedCss))};`);
      }

      lines.push(`import { mount } from 'svelte';`);
      lines.push(`import { setStudioDefaults } from ${JSON.stringify(toFsImport(STUDIO_ENTRY))};`);
      lines.push(`import ConsumerArtboard from ${JSON.stringify(toFsImport(resolvedEntry))};`);
      lines.push(`
setStudioDefaults({
  studioTheme: ${JSON.stringify(studioTheme)},
  storageKey: ${JSON.stringify(storageKey)},
  appUrl: ${JSON.stringify(appUrl)},
  apiBase: ${JSON.stringify(apiBase)},
  defaultDebug: ${JSON.stringify(defaultDebug)},
});

if (import.meta.hot) {
  import.meta.hot.on(${JSON.stringify(COMMENTS_CHANGED_EVENT)}, () => {
    window.dispatchEvent(new CustomEvent(${JSON.stringify(COMMENTS_CHANGED_EVENT)}));
  });
  import.meta.hot.on(${JSON.stringify(AGENT_CHANGED_EVENT)}, () => {
    window.dispatchEvent(new CustomEvent(${JSON.stringify(AGENT_CHANGED_EVENT)}));
  });
  import.meta.hot.on(${JSON.stringify(AGENT_LOG_EVENT)}, (data) => {
    window.dispatchEvent(new CustomEvent(${JSON.stringify(AGENT_LOG_EVENT)}, { detail: data }));
  });
}

const target = document.getElementById('artboard-root');
if (target) {
  mount(ConsumerArtboard, { target });
}
`);

      return lines.join('\n');
    },
    configureServer(server): void {
      const dir = path.resolve(root, options.dir ?? '.artboard');
      const warn = (message: string): void => {
        server.config.logger.warn(`[sveltekit-artboard] ${message}`);
      };

      const store = createCommentStore({ dir, root, warn });
      const policy = resolvePolicy(options.agent);
      const agent = createAgentRunner({
        root,
        dir,
        store,
        settings: createSettingsStore(dir),
        policy,
        warn,
        onChange: () => {
          server.ws.send({ type: 'custom', event: AGENT_CHANGED_EVENT, data: {} });
        },
        onLog: (runId) => {
          server.ws.send({ type: 'custom', event: AGENT_LOG_EVENT, data: { runId } });
        },
      });

      const viteHosts = server.config.server.allowedHosts;
      const allowedHosts: true | string[] =
        options.allowedHosts === true || viteHosts === true
          ? true
          : [...(options.allowedHosts ?? []), ...(Array.isArray(viteHosts) ? viteHosts : [])];

      const apiHandler = createApiHandler(store, { allowedHosts, agent });

      mkdirSync(store.commentsDir, { recursive: true });
      store.repairAll().catch((error: unknown) => {
        warn(`could not repair comments: ${error instanceof Error ? error.message : 'error'}`);
      });
      agent.init().catch((error: unknown) => {
        warn(`could not init agent runner: ${error instanceof Error ? error.message : 'error'}`);
      });

      server.httpServer?.once('close', () => {
        agent.dispose();
      });

      // Watch `.artboard/comments/` so external edits by an AI agent push live updates to the UI
      const normalizeFs = (val: string): string => {
        return process.platform === 'win32' ? val.toLowerCase() : val;
      };
      const normalizedCommentsDir = normalizeFs(path.resolve(store.commentsDir));
      let watchTimer: ReturnType<typeof setTimeout> | undefined;

      const handleCommentFileChange = (filePath: string): void => {
        if (normalizeFs(path.dirname(path.resolve(filePath))) !== normalizedCommentsDir) {
          return;
        }
        if (!isCommentFileName(path.basename(filePath))) {
          return;
        }
        clearTimeout(watchTimer);
        watchTimer = setTimeout(() => {
          void store
            .repairAll()
            .then(() => {
              return agent.reconcile();
            })
            .then(() => {
              server.ws.send({ type: 'custom', event: COMMENTS_CHANGED_EVENT, data: {} });
            });
        }, 80);
      };

      server.watcher.add(store.commentsDir);
      server.watcher.on('add', handleCommentFileChange);
      server.watcher.on('change', handleCommentFileChange);
      server.watcher.on('unlink', handleCommentFileChange);

      const originalPrintUrls = server.printUrls.bind(server);
      server.printUrls = (): void => {
        originalPrintUrls();
        const localUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '');
        if (localUrl) {
          server.config.logger.info(
            `  \x1b[35m➜\x1b[0m  \x1b[1mArtboard:\x1b[0m \x1b[36m${localUrl}${route}\x1b[0m`,
          );
        }
      };

      // Mount API routes at `${route}/api`
      server.middlewares.use(apiBase, (req, res, next) => {
        apiHandler(req, res).catch(next);
      });

      // Serve Artboard Studio HTML at `${route}`
      server.middlewares.use(async (req, res, next): Promise<void> => {
        const rawUrl = req.url ?? '';
        const pathname = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';

        if (pathname !== route) {
          next();
          return;
        }

        try {
          const html = await server.transformIndexHtml(rawUrl, createHtml());
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          next(err);
        }
      });
    },
  };
};
