#!/usr/bin/env node
import { build } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

await build({
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
});

console.log('Server build complete!');
