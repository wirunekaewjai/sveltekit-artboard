import { ArtboardComponent, ArtboardItem, ArtboardRenderContext, ArtboardSection, ArtboardTheme, ArtboardViewport, StudioTheme, defineArtboards } from "./registry.mjs";
import * as v from "valibot";
import { Plugin } from "vite";
declare const PROVIDERS: readonly ["claude", "antigravity"];
type Provider = (typeof PROVIDERS)[number];
declare const EFFORT_LEVELS: readonly ["low", "medium", "high", "xhigh", "max"];
type EffortLevel = (typeof EFFORT_LEVELS)[number];
declare const AgentSettingsSchema: v.ObjectSchema<{
  readonly enabled: v.BooleanSchema<undefined>;
  readonly provider: v.PicklistSchema<readonly ["claude", "antigravity"], undefined>;
  readonly model: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, 200, undefined>]>, undefined>;
  readonly effort: v.NullableSchema<v.PicklistSchema<readonly ["low", "medium", "high", "xhigh", "max"], undefined>, undefined>;
  readonly allowedMcp: v.OptionalSchema<v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.TrimAction, v.MinLengthAction<string, 1, undefined>, v.MaxLengthAction<string, 200, undefined>]>, undefined>, readonly []>;
}, undefined>;
declare const AgentSettingsPatchSchema: v.StrictObjectSchema<{
  readonly enabled: v.OptionalSchema<v.BooleanSchema<undefined>, undefined>;
  readonly provider: v.OptionalSchema<v.PicklistSchema<readonly ["claude", "antigravity"], undefined>, undefined>;
  readonly model: v.OptionalSchema<v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, 200, undefined>]>, undefined>, undefined>;
  readonly effort: v.OptionalSchema<v.NullableSchema<v.PicklistSchema<readonly ["low", "medium", "high", "xhigh", "max"], undefined>, undefined>, undefined>;
  readonly allowedMcp: v.OptionalSchema<v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.TrimAction, v.MinLengthAction<string, 1, undefined>, v.MaxLengthAction<string, 200, undefined>]>, undefined>, undefined>;
}, undefined>;
type AgentSettings = v.InferOutput<typeof AgentSettingsSchema>;
type AgentSettingsPatch = v.InferOutput<typeof AgentSettingsPatchSchema>;
declare const COMMENT_RUN_STATUSES: readonly ["queued", "running", "done", "needs_attention", "failed", "cancelled"];
type CommentRunStatus = (typeof COMMENT_RUN_STATUSES)[number];
declare const CommentRunSchema: v.ObjectSchema<{
  readonly commentId: v.StringSchema<undefined>;
  readonly runId: v.StringSchema<undefined>;
  readonly status: v.PicklistSchema<readonly ["queued", "running", "done", "needs_attention", "failed", "cancelled"], undefined>;
  readonly summary: v.NullableSchema<v.StringSchema<undefined>, undefined>;
  readonly error: v.NullableSchema<v.StringSchema<undefined>, undefined>;
  readonly protectedTouched: v.ArraySchema<v.StringSchema<undefined>, undefined>;
  readonly updatedAt: v.StringSchema<undefined>;
}, undefined>;
type CommentRun = v.InferOutput<typeof CommentRunSchema>;
declare const AgentStateSchema: v.ObjectSchema<{
  readonly version: v.LiteralSchema<1, undefined>;
  readonly activeRunId: v.NullableSchema<v.StringSchema<undefined>, undefined>;
  readonly activeCommentIds: v.ArraySchema<v.StringSchema<undefined>, undefined>;
  readonly queue: v.ArraySchema<v.ObjectSchema<{
    readonly runId: v.StringSchema<undefined>;
    readonly commentIds: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly createdAt: v.StringSchema<undefined>;
  }, undefined>, undefined>;
  readonly paused: v.NullableSchema<v.ObjectSchema<{
    readonly kind: v.PicklistSchema<["rate_limit", "error", "restart"], undefined>;
    readonly message: v.StringSchema<undefined>;
    readonly resetsAt: v.NullableSchema<v.NumberSchema<undefined>, undefined>;
  }, undefined>, undefined>;
  readonly runs: v.RecordSchema<v.StringSchema<undefined>, v.ObjectSchema<{
    readonly commentId: v.StringSchema<undefined>;
    readonly runId: v.StringSchema<undefined>;
    readonly status: v.PicklistSchema<readonly ["queued", "running", "done", "needs_attention", "failed", "cancelled"], undefined>;
    readonly summary: v.NullableSchema<v.StringSchema<undefined>, undefined>;
    readonly error: v.NullableSchema<v.StringSchema<undefined>, undefined>;
    readonly protectedTouched: v.ArraySchema<v.StringSchema<undefined>, undefined>;
    readonly updatedAt: v.StringSchema<undefined>;
  }, undefined>, undefined>;
}, undefined>;
type AgentState = v.InferOutput<typeof AgentStateSchema>;
type AgentInfo = {
  settings: AgentSettings;
  available: Record<Provider, boolean>;
  state: AgentState;
};
declare const COMMENT_STATUSES: readonly ["open", "resolved"];
type CommentStatus = (typeof COMMENT_STATUSES)[number];
declare const SourceLocationSchema: v.ObjectSchema<{
  readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
  readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
  readonly inherited: v.BooleanSchema<undefined>;
  readonly snippet: v.OptionalSchema<v.ObjectSchema<{
    readonly start: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  }, undefined>, undefined>;
}, undefined>;
declare const StackFrameSchema: v.ObjectSchema<{
  readonly name: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
  readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
  readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
}, undefined>;
declare const TargetSchema: v.ObjectSchema<{
  readonly source: v.NullableSchema<v.ObjectSchema<{
    readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    readonly inherited: v.BooleanSchema<undefined>;
    readonly snippet: v.OptionalSchema<v.ObjectSchema<{
      readonly start: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    }, undefined>, undefined>;
  }, undefined>, undefined>;
  readonly componentStack: v.SchemaWithPipe<readonly [v.ArraySchema<v.ObjectSchema<{
    readonly name: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
    readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
  }, undefined>, undefined>, v.MaxLengthAction<{
    name: string | null;
    file: string;
    line: number;
    column: number;
  }[], 50, undefined>]>;
  readonly selector: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly tag: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly html: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
}, undefined>;
declare const ArtboardContextSchema: v.ObjectSchema<{
  readonly boardId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly boardTitle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly section: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  readonly viewport: v.ObjectSchema<{
    readonly width: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    readonly height: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    readonly label: v.OptionalSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
  }, undefined>;
  readonly theme: v.NullableSchema<v.ObjectSchema<{
    readonly id: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly label: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  }, undefined>, undefined>;
  readonly xPct: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>;
  readonly yPct: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>;
  readonly pinXPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
  readonly pinYPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
}, undefined>;
declare const CommentInputSchema: v.ObjectSchema<{
  readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.TrimAction, v.MinLengthAction<string, 1, undefined>, v.MaxLengthAction<string, 5000, undefined>]>;
  readonly author: v.OptionalSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
  readonly artboard: v.ObjectSchema<{
    readonly boardId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly boardTitle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly section: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly viewport: v.ObjectSchema<{
      readonly width: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly height: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly label: v.OptionalSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
    }, undefined>;
    readonly theme: v.NullableSchema<v.ObjectSchema<{
      readonly id: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      readonly label: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    }, undefined>, undefined>;
    readonly xPct: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>;
    readonly yPct: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>;
    readonly pinXPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
    readonly pinYPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
  }, undefined>;
  readonly target: v.ObjectSchema<{
    readonly source: v.NullableSchema<v.ObjectSchema<{
      readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly inherited: v.BooleanSchema<undefined>;
      readonly snippet: v.OptionalSchema<v.ObjectSchema<{
        readonly start: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
        readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly componentStack: v.SchemaWithPipe<readonly [v.ArraySchema<v.ObjectSchema<{
      readonly name: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
      readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    }, undefined>, undefined>, v.MaxLengthAction<{
      name: string | null;
      file: string;
      line: number;
      column: number;
    }[], 50, undefined>]>;
    readonly selector: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly tag: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly html: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  }, undefined>;
}, undefined>;
declare const CommentPatchSchema: v.ObjectSchema<{
  readonly status: v.OptionalSchema<v.PicklistSchema<readonly ["open", "resolved"], undefined>, undefined>;
  readonly text: v.OptionalSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.TrimAction, v.MinLengthAction<string, 1, undefined>, v.MaxLengthAction<string, 5000, undefined>]>, undefined>;
  readonly resolution: v.OptionalSchema<v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>, undefined>;
  readonly pinXPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
  readonly pinYPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
}, undefined>;
declare const ArtboardCommentSchema: v.LooseObjectSchema<{
  readonly version: v.LiteralSchema<1, undefined>;
  readonly id: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
  readonly status: v.PicklistSchema<readonly ["open", "resolved"], undefined>;
  readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.TrimAction, v.MinLengthAction<string, 1, undefined>, v.MaxLengthAction<string, 5000, undefined>]>;
  readonly author: v.OptionalSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, "Reviewer">;
  readonly createdAt: v.StringSchema<undefined>;
  readonly resolvedAt: v.OptionalSchema<v.NullableSchema<v.StringSchema<undefined>, undefined>, null>;
  readonly resolution: v.OptionalSchema<v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>, null>;
  readonly artboard: v.ObjectSchema<{
    readonly boardId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly boardTitle: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly section: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly viewport: v.ObjectSchema<{
      readonly width: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly height: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly label: v.OptionalSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
    }, undefined>;
    readonly theme: v.NullableSchema<v.ObjectSchema<{
      readonly id: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      readonly label: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    }, undefined>, undefined>;
    readonly xPct: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>;
    readonly yPct: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>;
    readonly pinXPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
    readonly pinYPct: v.OptionalSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 100, undefined>]>, undefined>;
  }, undefined>;
  readonly target: v.ObjectSchema<{
    readonly source: v.NullableSchema<v.ObjectSchema<{
      readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly inherited: v.BooleanSchema<undefined>;
      readonly snippet: v.OptionalSchema<v.ObjectSchema<{
        readonly start: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
        readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly componentStack: v.SchemaWithPipe<readonly [v.ArraySchema<v.ObjectSchema<{
      readonly name: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>, undefined>;
      readonly file: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
      readonly line: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
      readonly column: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>]>;
    }, undefined>, undefined>, v.MaxLengthAction<{
      name: string | null;
      file: string;
      line: number;
      column: number;
    }[], 50, undefined>]>;
    readonly selector: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly tag: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
    readonly html: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]>;
  }, undefined>;
}, undefined>;
type SourceLocation = v.InferOutput<typeof SourceLocationSchema>;
type StackFrame = v.InferOutput<typeof StackFrameSchema>;
type CommentTarget = v.InferOutput<typeof TargetSchema>;
type ArtboardContext = v.InferOutput<typeof ArtboardContextSchema>;
type CommentInput = v.InferOutput<typeof CommentInputSchema>;
type CommentPatch = v.InferOutput<typeof CommentPatchSchema>;
type ArtboardComment = v.InferOutput<typeof ArtboardCommentSchema>;
type AgentPolicy = {
  allowedCommands: readonly string[];
  protectedFiles: readonly string[];
  timeoutMs: number;
  commands: Partial<Record<Provider, string>>;
  prompt: (context: {
    files: readonly string[];
    allowedCommands: readonly string[];
  }) => string;
};
type AgentPolicyOptions = Partial<AgentPolicy>;
export declare const DEFAULT_PROTECTED_FILES: readonly string[];
type ArtboardPluginOptions = {
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
export declare const artboard: (options?: ArtboardPluginOptions) => Plugin;
export { type AgentInfo, type AgentPolicy, type AgentPolicyOptions, type AgentSettings, type AgentSettingsPatch, type AgentState, type ArtboardComment, type ArtboardComponent, type ArtboardContext, type ArtboardItem, type ArtboardPluginOptions, type ArtboardRenderContext, type ArtboardSection, type ArtboardTheme, type ArtboardViewport, type CommentInput, type CommentPatch, type CommentRun, type CommentRunStatus, type CommentStatus, type CommentTarget, type EffortLevel, type Provider, type SourceLocation, type StackFrame, type StudioTheme, defineArtboards };