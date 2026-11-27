import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { parseAgentLog } from '#src/core/agent-log.ts';
import { createCommentStore } from '#src/core/store.ts';
import {
  antigravityMcpRules,
  buildInvocation,
  claudeMcpRules,
  resolvePolicy,
} from '#src/server/agent/providers.ts';
import { createAgentRunner } from '#src/server/agent/runner.ts';
import { createSettingsStore } from '#src/server/agent/settings.ts';
import { createApiApp } from '#src/server/api.ts';
import { isAllowedHost, isAllowedOrigin } from '#src/server/http.ts';

const makeTempProject = async (): Promise<{
  root: string;
  dir: string;
  cleanup: () => Promise<void>;
}> => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'artboard-test-'));
  const dir = path.join(root, '.artboard');
  await fs.mkdir(path.join(root, 'src'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'src', 'Button.svelte'),
    [
      '<script lang="ts">',
      '  let label = "Click";',
      '</script>',
      '<button>{label}</button>',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(path.join(root, 'package.json'), '{"name":"demo"}\n', 'utf8');

  return {
    root,
    dir,
    cleanup: async (): Promise<void> => {
      await fs.rm(root, { recursive: true, force: true });
    },
  };
};

describe('CommentStore (.artboard/comments/<uuid>.json)', () => {
  it('creates comments with source snippet, patches status, repairs resolvedAt, and clears resolved', async () => {
    const env = await makeTempProject();
    try {
      const store = createCommentStore({ dir: env.dir, root: env.root });

      const created = await store.create({
        text: 'Increase button padding',
        artboard: {
          boardId: 'atom-buttons',
          boardTitle: 'Buttons Matrix',
          section: '01 / Atoms',
          viewport: { width: 440, height: 320 },
          theme: { id: 'light', label: 'Light' },
          xPct: 50,
          yPct: 40,
        },
        target: {
          source: { file: 'src/Button.svelte', line: 4, column: 1, inherited: false },
          componentStack: [],
          selector: 'button',
          tag: 'button',
          text: 'Click',
          html: '<button>Click</button>',
        },
      });

      expect(created.status).toBe('open');
      expect(created.target.source?.file).toBe('src/Button.svelte');
      expect(created.target.source?.snippet?.text).toContain('<button>{label}</button>');

      // File lives inside `.artboard/comments/<id>.json`
      const stat = await fs.stat(path.join(env.dir, 'comments', `${created.id}.json`));
      expect(stat.isFile()).toBe(true);

      // Simulate an external AI agent resolving the comment without setting resolvedAt
      const raw = JSON.parse(await fs.readFile(store.filePathFor(created.id), 'utf8')) as Record<
        string,
        unknown
      >;
      raw.status = 'resolved';
      raw.resolution = 'Increased horizontal padding in Button.svelte.';
      await fs.writeFile(store.filePathFor(created.id), JSON.stringify(raw, null, 2), 'utf8');

      const repaired = await store.repairAll();
      expect(repaired).toBe(true);

      const loaded = await store.get(created.id);
      expect(loaded?.status).toBe('resolved');
      expect(loaded?.resolvedAt).not.toBeNull();
      expect(loaded?.resolution).toBe('Increased horizontal padding in Button.svelte.');

      const removed = await store.clearResolved();
      expect(removed).toEqual([created.id]);
      expect(await store.list()).toEqual([]);
    } finally {
      await env.cleanup();
    }
  });
});

describe('HTTP Host & Origin security (Tailscale-compatible)', () => {
  it('accepts localhost, IP literals, allowedHosts: true, and explicit Tailscale allowedHosts', () => {
    expect(isAllowedHost('localhost:5173')).toBe(true);
    expect(isAllowedHost('127.0.0.1:5173')).toBe(true);
    expect(isAllowedHost('100.64.12.34:5173')).toBe(true);
    expect(isAllowedHost('[fd7a:115c:a1e0::1]:5173')).toBe(true);
    expect(isAllowedHost('dev.tailnet-example.ts.net', [])).toBe(false);
    expect(isAllowedHost('dev.tailnet-example.ts.net', true)).toBe(true);
    expect(isAllowedHost('dev.tailnet-example.ts.net', ['dev.tailnet-example.ts.net'])).toBe(true);
    expect(isAllowedHost('dev.tailnet-example.ts.net', ['.ts.net'])).toBe(true);
  });

  it('requires exact Origin === Host (or allowed X-Forwarded-Host) on mutating requests', () => {
    const okReq = {
      method: 'POST',
      headers: {
        host: 'dev.tailnet-example.ts.net',
        origin: 'https://dev.tailnet-example.ts.net',
      },
    };

    const tailscaleIpReq = {
      method: 'POST',
      headers: {
        host: '100.64.12.34:5173',
        origin: 'http://100.64.12.34:5173',
      },
    };

    const tailscaleServeProxyReq = {
      method: 'POST',
      headers: {
        host: 'localhost:5173',
        'x-forwarded-host': 'dev.tailnet-example.ts.net',
        origin: 'https://dev.tailnet-example.ts.net',
      },
    };

    const csrfReq = {
      method: 'POST',
      headers: {
        host: 'dev.tailnet-example.ts.net',
        origin: 'https://evil.example',
      },
    };

    expect(isAllowedOrigin(okReq)).toBe(true);
    expect(isAllowedOrigin(tailscaleIpReq)).toBe(true);
    expect(isAllowedOrigin(tailscaleServeProxyReq, ['.ts.net'])).toBe(true);
    expect(isAllowedOrigin(tailscaleServeProxyReq, true)).toBe(true);
    expect(isAllowedOrigin(tailscaleServeProxyReq, [])).toBe(false);
    expect(isAllowedOrigin(csrfReq)).toBe(false);
  });
});

describe('AgentRunner queue & protectedFiles detection', () => {
  it('rejects when disabled, runs fake CLI to resolve comment, and flags protected file edits', async () => {
    const env = await makeTempProject();
    try {
      const store = createCommentStore({ dir: env.dir, root: env.root });
      const settings = createSettingsStore(env.dir);
      const comment = await store.create({
        text: 'Fix spacing',
        artboard: {
          boardId: 'b1',
          boardTitle: 'Board 1',
          section: 'S1',
          viewport: { width: 400, height: 300 },
          theme: null,
          xPct: 20,
          yPct: 30,
        },
        target: {
          source: null,
          componentStack: [],
          selector: 'div',
          tag: 'div',
          text: '',
          html: '',
        },
      });

      const runner = createAgentRunner({
        root: env.root,
        dir: env.dir,
        store,
        settings,
        policy: resolvePolicy({ protectedFiles: ['package.json'] }),
        onChange: () => {},
        isAvailable: async () => {
          return true;
        },
        invoke: ({ files }) => {
          // Fake node script that resolves the comment file and touches protected package.json
          const script = `
            const fs = require('node:fs');
            const f = ${JSON.stringify(files[0])};
            const data = JSON.parse(fs.readFileSync(f, 'utf8'));
            data.status = 'resolved';
            data.resolution = 'Fixed by fake agent.';
            fs.writeFileSync(f, JSON.stringify(data, null, 2));
            fs.writeFileSync('package.json', '{"name":"tampered"}\\n');
          `;
          return { command: process.execPath, args: ['-e', script], stdin: null };
        },
      });

      await runner.init();

      // Disabled by default
      const denied = await runner.run([comment.id]);
      expect(denied.ok).toBe(false);

      // Enable and run
      await runner.updateSettings({ enabled: true });
      const accepted = await runner.run([comment.id]);
      expect(accepted.ok).toBe(true);

      // Wait briefly for fake node script to finish
      for (let i = 0; i < 40; i++) {
        if (!runner.isWorking()) {
          break;
        }
        await new Promise((r) => {
          setTimeout(r, 50);
        });
      }

      const info = await runner.info();
      expect(info.state.runs[comment.id]?.status).toBe('done');
      expect(info.state.runs[comment.id]?.protectedTouched).toEqual(['package.json']);

      // Verify Hono API routes & Origin guard via app.request()
      const app = createApiApp(store, {
        agent: runner,
        allowedHosts: ['dev.tailnet-example.ts.net'],
      });
      const listRes = await app.request('/comments', {
        headers: { host: 'dev.tailnet-example.ts.net' },
      });
      expect(listRes.status).toBe(200);

      const csrfRes = await app.request('/agent/cancel', {
        method: 'POST',
        headers: {
          host: 'dev.tailnet-example.ts.net',
          origin: 'https://evil.example',
        },
      });
      expect(csrfRes.status).toBe(403);

      // Verify agent log & MCP servers API endpoints
      const runId = info.state.runs[comment.id]?.runId;
      expect(runId).toBeTruthy();
      const logRes = await app.request(`/agent/logs/${runId}`, {
        headers: { host: 'dev.tailnet-example.ts.net' },
      });
      expect(logRes.status).toBe(200);
      const logData = (await logRes.json()) as { runId: string; raw: string; active: boolean };
      expect(logData.runId).toBe(runId);
      expect(logData.active).toBe(false);

      const badLogRes = await app.request('/agent/logs/not-a-uuid', {
        headers: { host: 'dev.tailnet-example.ts.net' },
      });
      expect(badLogRes.status).toBe(400);

      const mcpRes = await app.request('/agent/mcp-servers?provider=antigravity', {
        headers: { host: 'dev.tailnet-example.ts.net' },
      });
      expect(mcpRes.status).toBe(200);

      runner.dispose();
    } finally {
      await env.cleanup();
    }
  });
});

describe('MCP allow-rules & Agent Log parser', () => {
  it('translates allowedMcp rules for antigravity and claude providers', () => {
    const rules = ['paper', 'github:list_issues', '*'];
    expect(antigravityMcpRules(rules)).toEqual([
      'mcp(paper)',
      'mcp(paper/*)',
      'mcp(github/list_issues)',
      'mcp(*)',
    ]);
    expect(claudeMcpRules(rules)).toEqual(['mcp__paper__*', 'mcp__github__list_issues', 'mcp__*']);

    const policy = resolvePolicy({ allowedCommands: ['pnpm run check'] });
    const agyInv = buildInvocation({
      provider: 'antigravity',
      prompt: 'test',
      files: [],
      model: null,
      effort: null,
      allowedMcp: ['paper'],
      policy,
    });
    const settingsIdx = agyInv.args.indexOf('--settings');
    expect(settingsIdx).toBeGreaterThan(-1);
    const parsedSettings = JSON.parse(agyInv.args[settingsIdx + 1]) as {
      permissions: { allow: string[] };
    };
    expect(parsedSettings.permissions.allow).toContain('mcp(paper)');
    expect(parsedSettings.permissions.allow).toContain('mcp(paper/*)');

    const claudeInv = buildInvocation({
      provider: 'claude',
      prompt: 'test',
      files: [],
      model: null,
      effort: null,
      allowedMcp: ['paper'],
      policy,
    });
    expect(claudeInv.args).toContain('mcp__paper__*');
  });

  it('parses antigravity stream-json logs including tool updates, stderr permission warnings, and denials', () => {
    const sample = [
      '{"event":"init","init":{"model":"gemini-4-neon-medium","cwd":"D:\\\\workspace\\\\tinypos"}}',
      '{"event":"step_update","step_update":{"step_index":2,"state":"ACTIVE","step_type":"tool","tool_name":"read_file","tool_info":{"name":"read_file","parameters":{"Path":"foo.svelte"}}}}',
      '{"event":"step_update","step_update":{"step_index":2,"state":"DONE","step_type":"tool","tool_name":"read_file","duration_seconds":0.25,"tool_info":{"name":"read_file","parameters":{"Path":"foo.svelte"},"output":"10 lines"}}}',
      'jetski: no output produced — a tool required the "mcp" permission that headless mode cannot prompt for, so it was auto-denied.',
      '{"event":"result","result":{"status":"SUCCESS","response":"","duration_seconds":17.3,"usage":{"total_tokens":25567},"denied_actions":[{"action":"mcp","display_name":"McpTool"}]}}',
    ].join('\n');

    const entries = parseAgentLog(sample);
    expect(entries).toHaveLength(4);
    expect(entries[0]).toMatchObject({
      kind: 'init',
      provider: 'agy',
      model: 'gemini-4-neon-medium',
    });
    expect(entries[1]).toMatchObject({
      kind: 'tool',
      name: 'read_file',
      status: 'done',
      output: '10 lines',
      durationSeconds: 0.25,
    });
    expect(entries[2]).toMatchObject({ kind: 'warning', isPermissionDenial: true });
    expect(entries[3]).toMatchObject({ kind: 'result', ok: true, denied: ['McpTool'] });
  });
});
