import type { CommentTarget, SourceLocation, StackFrame } from '#src/core/schema.ts';

type DevStackEntry = {
  type: string;
  file: string;
  line: number;
  column: number;
  parent: DevStackEntry | null;
  componentTag?: string;
};

type SvelteMeta = {
  loc?: { file: string; line: number; column: number };
  parent?: DevStackEntry | null;
};

const MAX_STACK_FRAMES = 30;

const isProjectFile = (file: string): boolean => {
  return Boolean(file) && !file.includes('node_modules');
};

const readSvelteStack = (meta: SvelteMeta): StackFrame[] => {
  const frames: StackFrame[] = [];
  let entry = meta.parent ?? null;

  while (entry && frames.length < MAX_STACK_FRAMES) {
    if (entry.type === 'component' && isProjectFile(entry.file)) {
      frames.push({
        name: entry.componentTag ?? null,
        file: entry.file,
        line: entry.line,
        column: entry.column,
      });
    }
    entry = entry.parent;
  }

  return frames;
};

const readSvelteMeta = (
  el: Element,
  stopAt: Element,
): { source: SourceLocation | null; componentStack: StackFrame[] } => {
  let cursor: Element | null = el;
  let inherited = false;

  while (cursor && cursor !== stopAt) {
    const meta = (cursor as Element & { __svelte_meta?: SvelteMeta }).__svelte_meta;
    if (meta?.loc && isProjectFile(meta.loc.file)) {
      return {
        source: {
          file: meta.loc.file,
          line: meta.loc.line,
          column: meta.loc.column,
          inherited,
        },
        componentStack: readSvelteStack(meta),
      };
    }
    inherited = true;
    cursor = cursor.parentElement;
  }

  return { source: null, componentStack: [] };
};

const buildSelector = (el: Element, stopAt: Element): string => {
  const testId = el.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }
  if (el.id) {
    return `#${el.id}`;
  }

  const parts: string[] = [];
  let cursor: Element | null = el;
  while (cursor && cursor !== stopAt && parts.length < 5) {
    const tag = cursor.tagName.toLowerCase();
    const parent: Element | null = cursor.parentElement;
    if (parent) {
      const sameTag = [...parent.children].filter((child) => {
        return child.tagName === cursor?.tagName;
      });
      if (sameTag.length > 1) {
        const index = sameTag.indexOf(cursor) + 1;
        parts.unshift(`${tag}:nth-of-type(${index})`);
      } else {
        parts.unshift(tag);
      }
    } else {
      parts.unshift(tag);
    }
    cursor = parent;
  }

  return parts.join(' > ').slice(0, 1000);
};

export const formatSourceBadge = (source: SourceLocation | null): string | null => {
  if (!source) {
    return null;
  }
  const normalized = source.file.replaceAll('\\', '/');
  const base = normalized.split('/').pop() ?? normalized;
  return `${base}:${source.line}`;
};

export const inspectElement = (el: Element, boundary: Element): CommentTarget => {
  const { source, componentStack } = readSvelteMeta(el, boundary);
  const tag = el.tagName.toLowerCase().slice(0, 50);
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
  const html = (el.outerHTML ?? '').slice(0, 2000);
  const selector = buildSelector(el, boundary);

  return {
    source,
    componentStack,
    selector,
    tag,
    text,
    html,
  };
};
