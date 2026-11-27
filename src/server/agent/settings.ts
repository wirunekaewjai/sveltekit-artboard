import { promises as fs } from 'node:fs';
import path from 'node:path';

import * as v from 'valibot';

import type { AgentSettings, AgentSettingsPatch } from '#src/core/agent-state.ts';

import { AgentSettingsSchema, DEFAULT_AGENT_SETTINGS } from '#src/core/agent-state.ts';
import { writeFileAtomic } from '#src/core/atomic-write.ts';

export type SettingsStore = {
  filePath: string;
  read: () => Promise<AgentSettings>;
  update: (patch: AgentSettingsPatch) => Promise<AgentSettings>;
};

export const createSettingsStore = (dir: string): SettingsStore => {
  const filePath = path.join(dir, 'settings.json');

  const read = async (): Promise<AgentSettings> => {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = v.safeParse(AgentSettingsSchema, JSON.parse(raw) as unknown);
      return parsed.success ? parsed.output : { ...DEFAULT_AGENT_SETTINGS };
    } catch {
      return { ...DEFAULT_AGENT_SETTINGS };
    }
  };

  const update = async (patch: AgentSettingsPatch): Promise<AgentSettings> => {
    const current = await read();
    const providerChanged = patch.provider !== undefined && patch.provider !== current.provider;

    let nextModel = current.model;
    if (providerChanged) {
      nextModel = null;
    } else if (patch.model !== undefined) {
      nextModel = patch.model;
    }

    const nextAllowedMcp =
      patch.allowedMcp !== undefined
        ? [
            ...new Set(
              patch.allowedMcp
                .map((rule) => {
                  return rule.trim();
                })
                .filter((rule) => {
                  return rule.length > 0;
                }),
            ),
          ]
        : current.allowedMcp;

    const next: AgentSettings = {
      enabled: patch.enabled ?? current.enabled,
      provider: patch.provider ?? current.provider,
      model: nextModel,
      effort: patch.effort !== undefined ? patch.effort : current.effort,
      allowedMcp: nextAllowedMcp,
    };

    await writeFileAtomic(filePath, `${JSON.stringify(next, null, 2)}\n`);
    return next;
  };

  return { filePath, read, update };
};
