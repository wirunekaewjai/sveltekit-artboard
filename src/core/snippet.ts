import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { SourceLocation } from '#src/core/schema.ts';

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  '.svelte',
  '.ts',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.html',
  '.json',
]);

const isInsideRoot = (root: string, target: string): boolean => {
  const rel = path.relative(root, target);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};

const hasHiddenOrIgnoredSegment = (relativePath: string): boolean => {
  const parts = relativePath.replaceAll('\\', '/').split('/');
  return parts.some((seg) => {
    return seg === 'node_modules' || seg.startsWith('.');
  });
};

export const normalizeProjectPath = (root: string, rawFile: string): string | null => {
  if (!rawFile) {
    return null;
  }
  const cleaned = rawFile.replace(/^\/@fs\//, '').replace(/^file:\/\//, '');
  const resolved = path.isAbsolute(cleaned) ? path.resolve(cleaned) : path.resolve(root, cleaned);

  if (!isInsideRoot(root, resolved)) {
    return null;
  }

  const relative = path.relative(root, resolved).replaceAll('\\', '/');
  if (hasHiddenOrIgnoredSegment(relative)) {
    return null;
  }

  return relative;
};

export const readSourceSnippet = async (
  root: string,
  source: SourceLocation,
): Promise<{ start: number; text: string } | undefined> => {
  const relative = normalizeProjectPath(root, source.file);
  if (!relative) {
    return undefined;
  }

  const ext = path.extname(relative).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return undefined;
  }

  const fullPath = path.resolve(root, relative);
  try {
    const stat = await fs.stat(fullPath);
    if (!stat.isFile() || stat.size > MAX_FILE_BYTES) {
      return undefined;
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const lineIndex = Math.floor(source.line) - 1;
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return undefined;
    }

    const startIdx = Math.max(0, lineIndex - 2);
    const endIdx = Math.min(lines.length - 1, lineIndex + 2);
    const slice = lines.slice(startIdx, endIdx + 1).join('\n');

    return {
      start: startIdx + 1,
      text: slice.slice(0, 1000),
    };
  } catch {
    return undefined;
  }
};
