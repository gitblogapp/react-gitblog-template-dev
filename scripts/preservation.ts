import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
export function snapshot(root: string, paths: string[]) {
  const result: Record<string, string> = {};
  function visit(relative: string) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) return;
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) result[relative] = `symlink:${fs.readlinkSync(file)}`;
    else if (stat.isDirectory()) {
      result[`${relative}/`] = 'directory';
      fs.readdirSync(file)
        .sort()
        .forEach((child) => visit(path.join(relative, child)));
    } else result[relative] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  paths.forEach(visit);
  return result;
}
