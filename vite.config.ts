import { cpSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import renderer from 'vite-plugin-electron-renderer';
import { fileURLToPath } from 'node:url';
import { buildDocumentationSnapshot } from './electron/documentation/buildSnapshot';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8')) as {
  version: string;
};

function createElectronEnv() {
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

function copyDatabaseAssets(outDir: string) {
  const source = path.join(__dirname, 'electron/database');
  const target = path.join(outDir, 'database');
  mkdirSync(path.join(target, 'migrations'), { recursive: true });
  mkdirSync(path.join(target, 'seed'), { recursive: true });

  for (const fileName of readdirSync(path.join(source, 'migrations'))) {
    if (fileName.endsWith('.sql')) {
      cpSync(
        path.join(source, 'migrations', fileName),
        path.join(target, 'migrations', fileName),
        { force: true },
      );
    }
  }

  cpSync(path.join(source, 'seed/seed.sql'), path.join(target, 'seed/seed.sql'), { force: true });
}

function copyDatabaseAssetsPlugin(outDir: string) {
  return {
    name: 'copy-database-assets',
    closeBundle() {
      copyDatabaseAssets(outDir);
    },
  };
}

function generateDocsCachePlugin(outDir: string) {
  return {
    name: 'generate-docs-cache',
    closeBundle() {
      const cachePath = path.join(outDir, 'documentation-cache.json');
      try {
        try {
          unlinkSync(cachePath);
        } catch {
          // cache may not exist yet
        }
        process.env.APP_ROOT = __dirname;
        const snapshot = buildDocumentationSnapshot();
        writeFileSync(cachePath, JSON.stringify(snapshot));
      } catch (error) {
        console.warn('[build] documentation cache generation failed:', error);
      }
    },
  };
}

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        onstart(args) {
          args.startup(['.', '--no-sandbox'], { env: createElectronEnv() });
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['better-sqlite3', 'electron'],
            },
          },
          plugins: [
            copyDatabaseAssetsPlugin(path.resolve(__dirname, 'dist-electron')),
            generateDocsCachePlugin(path.resolve(__dirname, 'dist-electron')),
          ],
        },
      },
      preload: {
        input: 'electron/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
          },
          define: {
            __APP_VERSION__: JSON.stringify(pkg.version),
          },
        },
      },
    }),
    renderer(),
  ],
});
