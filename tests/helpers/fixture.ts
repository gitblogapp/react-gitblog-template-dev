import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import { sourceHash } from '../../scripts/lib/authoring.mjs';

export const fixtureSlug = 'fixture-글 공백';
export const fixtureId = '6b7958a2-6dc4-49f2-b10b-afae1a1c1c78';
export const cleanEnv = () =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^(PUBLIC_|DEEPL_|GITHUB_|GITBLOG_|SITE_BASE_PATH|POST_IDS_ROOT)/.test(key),
    ),
  );
export function run(root: string, command: string, args: string[], env = {}, success = true) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...cleanEnv(), ...env },
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  assert.equal(
    result.status === 0,
    success,
    `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`,
  );
  return result.stdout;
}
export function seedContent(root: string) {
  const write = (file: string, value: string) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), value);
  };
  write(
    '.env.production',
    'PUBLIC_SITE_URL=https://fixture.github.io/blog\nPUBLIC_SITE_REPOSITORY=fixture/blog\nPUBLIC_SOURCE_LOCALE=ko\nPUBLIC_TRANSLATION_LOCALES=en\nPUBLIC_HUB_ENABLED=true\nPUBLIC_GISCUS_ENABLED=false\n',
  );
  write(
    'content/site.json',
    JSON.stringify({
      title: 'Fixture blog',
      author: 'Fixture author',
      tagline: 'Static contract',
      description: 'Fixture description',
      footer: 'Fixture footer',
    }),
  );
  write(
    'static/uploads/fixture.svg',
    '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
  );
  const data = {
    id: fixtureId,
    title: '검증 글',
    description: '정적 계약 검사',
    date: '2026-01-01T10:00:00+09:00',
    updated: '2026-01-02T10:00:00+09:00',
    published: true,
    category: 'Notes',
    tags: ['build'],
    cover: '/uploads/fixture.svg',
  };
  const protectedBody =
    '\n\n```js\nconst value = 1;\n```\n\n[Documentation](https://example.com/docs)\n\n![Fixture](/uploads/fixture.svg)\n';
  const source = matter.stringify(
    '## 검증\n\nSTATIC_PUBLIC_SENTINEL 검증 본문.\n' + protectedBody,
    data,
  );
  write(`content/posts/${fixtureSlug}.md`, source);
  write(
    'content/posts/draft.md',
    matter.stringify('PRIVATE_DRAFT_SENTINEL', {
      ...data,
      id: '985e96e1-ef70-4753-99a1-dee03c81046a',
      title: 'Draft',
      published: false,
    }),
  );
  write('.gitblog/authoring.json', '{"schemaVersion":1,"translationMode":"manual"}');
  write(
    '.gitblog/work/en.md',
    matter.stringify(
      '## Contract\n\nSTATIC_PUBLIC_SENTINEL searchablebody boundaries.\n' + protectedBody,
      { title: 'Contract fixture', description: 'Static contract verification' },
    ),
  );
  return sourceHash(source);
}
export function templateFixture() {
  const root = process.cwd();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'react-standard-'));
  const excluded = new Set([
    'node_modules',
    '.preview',
    'dist',
    'build',
    '.vite',
    '.cache',
    '.git',
    'test-results',
    'playwright-report',
  ]);
  for (const entry of fs.readdirSync(root)) {
    if (excluded.has(entry) || /^\.env.*\.local$/.test(entry)) continue;
    fs.cpSync(path.join(root, entry), path.join(temp, entry), {
      recursive: true,
      filter: (file) => !file.includes(`${path.sep}.gitblog${path.sep}work`),
    });
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(temp, 'node_modules'), 'dir');
  fs.rmSync(path.join(temp, 'content'), { recursive: true, force: true });
  const hash = seedContent(temp);
  run(temp, process.execPath, [
    'scripts/authoring.mjs',
    'translation',
    fixtureSlug,
    'en',
    '--from',
    '.gitblog/work/en.md',
    '--source-hash',
    hash,
  ]);
  return temp;
}
