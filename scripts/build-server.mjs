#!/usr/bin/env node
import { context } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const watchMode = process.argv.includes('--watch');

const buildConfig = {
  entryPoints: [join(rootDir, 'server/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: join(rootDir, 'dist/server.mjs'),
  external: [
    'pg',
    'pg-hstore',
    'postgres',
    'better-auth',
    'drizzle-orm',
    'dotenv',
    'express',
    'cors',
  ],
  banner: {
    js: `import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { fileURLToPath } from 'url';
import { dirname } from 'path';`,
  },
  sourcemap: true,
  logLevel: 'info',
};

if (watchMode) {
  const ctx = await context(buildConfig);
  await ctx.watch();
  console.log('Watching for server file changes...');
} else {
  const { context: buildContext } = await import('esbuild');
  const ctx = await buildContext(buildConfig);
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Server build complete!');
}
