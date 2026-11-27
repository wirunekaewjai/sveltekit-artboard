import { promises as fs } from 'node:fs';
import path from 'node:path';

import { v7 as uuidv7 } from 'uuid';
import * as v from 'valibot';

import type { ArtboardComment, CommentInput, CommentPatch } from '#src/core/schema.ts';

import { writeFileAtomic } from '#src/core/atomic-write.ts';
import { ArtboardCommentSchema, COMMENT_ID_PATTERN } from '#src/core/schema.ts';
import { normalizeProjectPath, readSourceSnippet } from '#src/core/snippet.ts';

export const COMMENTS_SUBDIR = 'comments';

export type CommentStoreOptions = {
  /** Base artboard directory (e.g. `<root>/.artboard`). Comments live in `<dir>/comments/`. */
  dir: string;
  root: string;
  warn?: (message: string) => void;
  now?: () => string;
};

export type CommentStore = {
  commentsDir: string;
  filePathFor: (id: string) => string;
  relativePathFor: (id: string) => string;
  list: () => Promise<ArtboardComment[]>;
  get: (id: string) => Promise<ArtboardComment | null>;
  create: (input: CommentInput) => Promise<ArtboardComment>;
  patch: (id: string, patch: CommentPatch) => Promise<ArtboardComment | null>;
  remove: (id: string) => Promise<boolean>;
  clearResolved: () => Promise<string[]>;
  repairAll: () => Promise<boolean>;
};

export const isCommentFileName = (filename: string): boolean => {
  if (!filename.endsWith('.json')) {
    return false;
  }
  const stem = filename.slice(0, -5);
  return COMMENT_ID_PATTERN.test(stem);
};

export const createCommentStore = (options: CommentStoreOptions): CommentStore => {
  const commentsDir = path.join(options.dir, COMMENTS_SUBDIR);
  const now =
    options.now ??
    ((): string => {
      return new Date().toISOString();
    });

  let queue: Promise<unknown> = Promise.resolve();

  const serialize = <T>(fn: () => Promise<T>): Promise<T> => {
    const next = queue.then(fn, fn);
    queue = next.then(
      () => {
        return undefined;
      },
      () => {
        return undefined;
      },
    );
    return next;
  };

  const filePathFor = (id: string): string => {
    return path.join(commentsDir, `${id}.json`);
  };

  const relativePathFor = (id: string): string => {
    return path.relative(options.root, filePathFor(id)).replaceAll('\\', '/');
  };

  const readCommentFile = async (
    filePath: string,
  ): Promise<{ comment: ArtboardComment; mtimeIso: string } | null> => {
    try {
      const [raw, stat] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);
      const json: unknown = JSON.parse(raw);
      const parsed = v.safeParse(ArtboardCommentSchema, json);
      if (!parsed.success) {
        options.warn?.(`Invalid comment schema in ${path.basename(filePath)}`);
        return null;
      }
      return { comment: parsed.output, mtimeIso: stat.mtime.toISOString() };
    } catch {
      return null;
    }
  };

  const listInternal = async (): Promise<ArtboardComment[]> => {
    let entries: string[];
    try {
      entries = await fs.readdir(commentsDir);
    } catch {
      return [];
    }

    const files = entries.filter(isCommentFileName).sort();
    const results: ArtboardComment[] = [];

    for (const file of files) {
      const loaded = await readCommentFile(path.join(commentsDir, file));
      if (loaded) {
        results.push(loaded.comment);
      }
    }

    results.sort((a, b) => {
      return a.createdAt.localeCompare(b.createdAt);
    });
    return results;
  };

  const getInternal = async (id: string): Promise<ArtboardComment | null> => {
    if (!COMMENT_ID_PATTERN.test(id)) {
      return null;
    }
    const loaded = await readCommentFile(filePathFor(id));
    return loaded ? loaded.comment : null;
  };

  const repairAllInternal = async (): Promise<boolean> => {
    let entries: string[];
    try {
      entries = await fs.readdir(commentsDir);
    } catch {
      return false;
    }

    let repairedAny = false;
    const nowMs = Date.now();

    for (const file of entries.filter(isCommentFileName)) {
      const fullPath = path.join(commentsDir, file);
      const loaded = await readCommentFile(fullPath);
      if (!loaded) {
        continue;
      }

      const { comment, mtimeIso } = loaded;
      if (comment.status !== 'resolved') {
        continue;
      }

      const createdMs = Date.parse(comment.createdAt);
      const resolvedMs = comment.resolvedAt ? Date.parse(comment.resolvedAt) : Number.NaN;
      const needsFix =
        !comment.resolvedAt ||
        Number.isNaN(resolvedMs) ||
        (!Number.isNaN(createdMs) && resolvedMs < createdMs) ||
        resolvedMs > nowMs + 60_000;

      if (needsFix) {
        const updated: ArtboardComment = { ...comment, resolvedAt: mtimeIso };
        await writeFileAtomic(fullPath, `${JSON.stringify(updated, null, 2)}\n`);
        repairedAny = true;
      }
    }

    return repairedAny;
  };

  return {
    commentsDir,
    filePathFor,
    relativePathFor,
    list: async (): Promise<ArtboardComment[]> => {
      return listInternal();
    },
    get: async (id: string): Promise<ArtboardComment | null> => {
      return getInternal(id);
    },
    create: async (input: CommentInput): Promise<ArtboardComment> => {
      return serialize(async () => {
        const id = uuidv7();
        const createdAt = now();

        let normalizedSource = input.target.source;
        if (normalizedSource) {
          const normalizedFile = normalizeProjectPath(options.root, normalizedSource.file);
          if (normalizedFile) {
            const snippet = await readSourceSnippet(options.root, {
              ...normalizedSource,
              file: normalizedFile,
            });
            normalizedSource = {
              ...normalizedSource,
              file: normalizedFile,
              snippet,
            };
          } else {
            normalizedSource = null;
          }
        }

        const normalizedStack = input.target.componentStack
          .map((frame) => {
            const normalizedFile = normalizeProjectPath(options.root, frame.file);
            if (!normalizedFile) {
              return null;
            }
            return { ...frame, file: normalizedFile };
          })
          .filter((frame): frame is NonNullable<typeof frame> => {
            return frame !== null;
          });

        const comment: ArtboardComment = {
          version: 1,
          id,
          status: 'open',
          text: input.text,
          author: input.author ?? 'Reviewer',
          createdAt,
          resolvedAt: null,
          resolution: null,
          artboard: input.artboard,
          target: {
            ...input.target,
            source: normalizedSource,
            componentStack: normalizedStack,
          },
        };

        await writeFileAtomic(filePathFor(id), `${JSON.stringify(comment, null, 2)}\n`);
        return comment;
      });
    },
    patch: async (id: string, patchData: CommentPatch): Promise<ArtboardComment | null> => {
      return serialize(async () => {
        const existing = await getInternal(id);
        if (!existing) {
          return null;
        }

        const nextStatus = patchData.status ?? existing.status;
        let resolvedAt = existing.resolvedAt;
        if (patchData.status === 'resolved') {
          resolvedAt = existing.resolvedAt ?? now();
        } else if (patchData.status === 'open') {
          resolvedAt = null;
        }

        let resolution = existing.resolution;
        if (patchData.resolution !== undefined) {
          resolution = patchData.resolution;
        } else if (patchData.status === 'open') {
          resolution = null;
        }

        const updated: ArtboardComment = {
          ...existing,
          status: nextStatus,
          text: patchData.text ?? existing.text,
          resolvedAt,
          resolution,
          artboard: {
            ...existing.artboard,
            pinXPct: patchData.pinXPct ?? existing.artboard.pinXPct,
            pinYPct: patchData.pinYPct ?? existing.artboard.pinYPct,
          },
        };

        await writeFileAtomic(filePathFor(id), `${JSON.stringify(updated, null, 2)}\n`);
        return updated;
      });
    },
    remove: async (id: string): Promise<boolean> => {
      return serialize(async () => {
        if (!COMMENT_ID_PATTERN.test(id)) {
          return false;
        }
        try {
          await fs.unlink(filePathFor(id));
          return true;
        } catch {
          return false;
        }
      });
    },
    clearResolved: async (): Promise<string[]> => {
      return serialize(async () => {
        const all = await listInternal();
        const removed: string[] = [];
        for (const item of all) {
          if (item.status === 'resolved') {
            try {
              await fs.unlink(filePathFor(item.id));
              removed.push(item.id);
            } catch {
              // Ignore race conditions
            }
          }
        }
        return removed;
      });
    },
    repairAll: async (): Promise<boolean> => {
      return serialize(async () => {
        return repairAllInternal();
      });
    },
  };
};
