import * as v from 'valibot';

export const COMMENT_STATUSES = ['open', 'resolved'] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export const COMMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (
  max: number,
): v.SchemaWithPipe<
  readonly [v.StringSchema<undefined>, v.MaxLengthAction<string, number, undefined>]
> => {
  return v.pipe(v.string(), v.maxLength(max));
};

const num = v.pipe(v.number(), v.finite());

export const SourceSnippetSchema = v.object({
  start: num,
  text: str(1000),
});

export const SourceLocationSchema = v.object({
  file: str(500),
  line: num,
  column: num,
  inherited: v.boolean(),
  snippet: v.optional(SourceSnippetSchema),
});

export const StackFrameSchema = v.object({
  name: v.nullable(str(200)),
  file: str(500),
  line: num,
  column: num,
});

export const TargetSchema = v.object({
  source: v.nullable(SourceLocationSchema),
  componentStack: v.pipe(v.array(StackFrameSchema), v.maxLength(50)),
  selector: str(1000),
  tag: str(50),
  text: str(300),
  html: str(2000),
});

export const ArtboardContextSchema = v.object({
  boardId: str(200),
  boardTitle: str(300),
  section: str(300),
  viewport: v.object({
    width: num,
    height: num,
    label: v.optional(str(200)),
  }),
  theme: v.nullable(
    v.object({
      id: str(100),
      label: str(200),
    }),
  ),
  xPct: v.pipe(num, v.minValue(0), v.maxValue(100)),
  yPct: v.pipe(num, v.minValue(0), v.maxValue(100)),
  pinXPct: v.optional(v.pipe(num, v.minValue(0), v.maxValue(100))),
  pinYPct: v.optional(v.pipe(num, v.minValue(0), v.maxValue(100))),
});

const CommentText = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(5000));

export const CommentInputSchema = v.object({
  text: CommentText,
  author: v.optional(str(120)),
  artboard: ArtboardContextSchema,
  target: TargetSchema,
});

export const CommentPatchSchema = v.object({
  status: v.optional(v.picklist(COMMENT_STATUSES)),
  text: v.optional(CommentText),
  resolution: v.optional(v.nullable(str(2000))),
  pinXPct: v.optional(v.pipe(num, v.minValue(0), v.maxValue(100))),
  pinYPct: v.optional(v.pipe(num, v.minValue(0), v.maxValue(100))),
});

export const ArtboardCommentSchema = v.looseObject({
  version: v.literal(1),
  id: v.pipe(v.string(), v.regex(COMMENT_ID_PATTERN)),
  status: v.picklist(COMMENT_STATUSES),
  text: CommentText,
  author: v.optional(str(120), 'Reviewer'),
  createdAt: v.string(),
  resolvedAt: v.optional(v.nullable(v.string()), null),
  resolution: v.optional(v.nullable(str(2000)), null),
  artboard: ArtboardContextSchema,
  target: TargetSchema,
});

export type SourceLocation = v.InferOutput<typeof SourceLocationSchema>;
export type StackFrame = v.InferOutput<typeof StackFrameSchema>;
export type CommentTarget = v.InferOutput<typeof TargetSchema>;
export type ArtboardContext = v.InferOutput<typeof ArtboardContextSchema>;
export type CommentInput = v.InferOutput<typeof CommentInputSchema>;
export type CommentPatch = v.InferOutput<typeof CommentPatchSchema>;
export type ArtboardComment = v.InferOutput<typeof ArtboardCommentSchema>;
