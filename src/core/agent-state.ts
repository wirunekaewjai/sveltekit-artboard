import * as v from 'valibot';

export const PROVIDERS = ['claude', 'antigravity'] as const;
export type Provider = (typeof PROVIDERS)[number];

export const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

export const hasEffortSuffix = (model: string | null | undefined): boolean => {
  if (!model) {
    return false;
  }
  return EFFORT_LEVELS.some((level) => {
    return model.endsWith(`-${level}`);
  });
};

const McpRuleSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200));

export const AgentSettingsSchema = v.object({
  enabled: v.boolean(),
  provider: v.picklist(PROVIDERS),
  model: v.nullable(v.pipe(v.string(), v.maxLength(200))),
  effort: v.nullable(v.picklist(EFFORT_LEVELS)),
  allowedMcp: v.optional(v.array(McpRuleSchema), []),
});

export const AgentSettingsPatchSchema = v.strictObject({
  enabled: v.optional(v.boolean()),
  provider: v.optional(v.picklist(PROVIDERS)),
  model: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(200)))),
  effort: v.optional(v.nullable(v.picklist(EFFORT_LEVELS))),
  allowedMcp: v.optional(v.array(McpRuleSchema)),
});

export type AgentSettings = v.InferOutput<typeof AgentSettingsSchema>;
export type AgentSettingsPatch = v.InferOutput<typeof AgentSettingsPatchSchema>;

export type McpServerOption = {
  name: string;
  source: string;
};

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  enabled: false,
  provider: 'claude',
  model: null,
  effort: null,
  allowedMcp: [],
};

export const COMMENT_RUN_STATUSES = [
  'queued',
  'running',
  'done',
  'needs_attention',
  'failed',
  'cancelled',
] as const;
export type CommentRunStatus = (typeof COMMENT_RUN_STATUSES)[number];

export const CommentRunSchema = v.object({
  commentId: v.string(),
  runId: v.string(),
  status: v.picklist(COMMENT_RUN_STATUSES),
  summary: v.nullable(v.string()),
  error: v.nullable(v.string()),
  protectedTouched: v.array(v.string()),
  updatedAt: v.string(),
});

export type CommentRun = v.InferOutput<typeof CommentRunSchema>;

export const QueueRoundSchema = v.object({
  runId: v.string(),
  commentIds: v.array(v.string()),
  createdAt: v.string(),
});

export type QueueRound = v.InferOutput<typeof QueueRoundSchema>;

export const PauseReasonSchema = v.object({
  kind: v.picklist(['rate_limit', 'error', 'restart']),
  message: v.string(),
  resetsAt: v.nullable(v.number()),
});

export type PauseReason = v.InferOutput<typeof PauseReasonSchema>;

export const AgentStateSchema = v.object({
  version: v.literal(1),
  activeRunId: v.nullable(v.string()),
  activeCommentIds: v.array(v.string()),
  queue: v.array(QueueRoundSchema),
  paused: v.nullable(PauseReasonSchema),
  runs: v.record(v.string(), CommentRunSchema),
});

export type AgentState = v.InferOutput<typeof AgentStateSchema>;

export const emptyAgentState = (): AgentState => {
  return {
    version: 1,
    activeRunId: null,
    activeCommentIds: [],
    queue: [],
    paused: null,
    runs: {},
  };
};

export type AgentInfo = {
  settings: AgentSettings;
  available: Record<Provider, boolean>;
  state: AgentState;
};
