import { buildWithCoverImages } from '@gitblogapp/cli/cover-images';

await buildWithCoverImages({
  command: process.execPath,
  args: ["node_modules/tsx/dist/cli.mjs", "scripts/build.tsx"].concat(process.argv.slice(2))
});
