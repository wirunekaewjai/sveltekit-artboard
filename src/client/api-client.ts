import type {
  AgentInfo,
  AgentSettings,
  AgentSettingsPatch,
  Provider,
} from '#src/core/agent-state.ts';
import type { ArtboardComment, CommentInput, CommentPatch } from '#src/core/schema.ts';

export type ModelOption = {
  id: string;
  label: string;
};

export type ArtboardApiClient = {
  listComments: () => Promise<ArtboardComment[]>;
  createComment: (input: CommentInput) => Promise<ArtboardComment>;
  patchComment: (id: string, patch: CommentPatch) => Promise<ArtboardComment>;
  deleteComment: (id: string) => Promise<void>;
  clearResolved: () => Promise<string[]>;
  getAgentInfo: () => Promise<AgentInfo>;
  getAgentModels: (provider: Provider) => Promise<ModelOption[] | null>;
  updateAgentSettings: (patch: AgentSettingsPatch) => Promise<AgentSettings>;
  runAgent: (ids: string[]) => Promise<{ runId: string; accepted: string[] }>;
  cancelAgent: () => Promise<void>;
  resumeAgent: () => Promise<void>;
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = (await res.json().catch(() => {
    return {};
  })) as Record<string, unknown>;

  if (!res.ok) {
    let code = `HTTP ${res.status}`;
    if (typeof data.error === 'string') {
      code = data.error;
    } else if (typeof data.code === 'string') {
      code = data.code;
    }
    throw new Error(code);
  }

  return data as T;
};

export const createApiClient = (apiBase: string): ArtboardApiClient => {
  const base = apiBase.replace(/\/+$/, '');

  return {
    listComments: async (): Promise<ArtboardComment[]> => {
      const data = await requestJson<{ comments: ArtboardComment[] }>(`${base}/comments`);
      return data.comments;
    },
    createComment: async (input: CommentInput): Promise<ArtboardComment> => {
      const data = await requestJson<{ comment: ArtboardComment }>(`${base}/comments`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data.comment;
    },
    patchComment: async (id: string, patch: CommentPatch): Promise<ArtboardComment> => {
      const data = await requestJson<{ comment: ArtboardComment }>(`${base}/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return data.comment;
    },
    deleteComment: async (id: string): Promise<void> => {
      await requestJson(`${base}/comments/${id}`, { method: 'DELETE' });
    },
    clearResolved: async (): Promise<string[]> => {
      const data = await requestJson<{ removed: string[] }>(`${base}/comments?status=resolved`, {
        method: 'DELETE',
      });
      return data.removed;
    },
    getAgentInfo: async (): Promise<AgentInfo> => {
      return requestJson<AgentInfo>(`${base}/agent`);
    },
    getAgentModels: async (provider: Provider): Promise<ModelOption[] | null> => {
      const data = await requestJson<{ models: ModelOption[] | null }>(
        `${base}/agent/models?provider=${encodeURIComponent(provider)}`,
      );
      return data.models;
    },
    updateAgentSettings: async (patch: AgentSettingsPatch): Promise<AgentSettings> => {
      const data = await requestJson<{ settings: AgentSettings }>(`${base}/agent/settings`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      return data.settings;
    },
    runAgent: async (ids: string[]): Promise<{ runId: string; accepted: string[] }> => {
      return requestJson<{ runId: string; accepted: string[] }>(`${base}/agent/run`, {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
    cancelAgent: async (): Promise<void> => {
      await requestJson(`${base}/agent/cancel`, { method: 'POST' });
    },
    resumeAgent: async (): Promise<void> => {
      await requestJson(`${base}/agent/resume`, { method: 'POST' });
    },
  };
};
