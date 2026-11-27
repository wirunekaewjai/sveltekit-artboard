// Installs the git hook when working in this repository. When the package is installed as a
// dependency (for example from a GitHub URL) there is no .git folder and nothing must run.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

if (existsSync(path.join(root, '.git'))) {
  const result = spawnSync('vp', ['config'], { cwd: root, stdio: 'inherit', shell: true });
  process.exit(result.status ?? 0);
}
