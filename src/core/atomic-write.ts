import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const writeFileAtomic = async (filePath: string, content: string): Promise<void> => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tempPath = path.join(dir, `.tmp-${process.pid}-${randomBytes(6).toString('hex')}`);

  try {
    await fs.writeFile(tempPath, content, 'utf8');
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await fs.rename(tempPath, filePath);
        return;
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if ((code === 'EPERM' || code === 'EBUSY') && attempt < 3) {
          await new Promise((r) => {
            setTimeout(r, 20 * (attempt + 1));
          });
          continue;
        }
        throw err;
      }
    }
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => {
      // Ignore cleanup errors
    });
    throw error;
  }
};
