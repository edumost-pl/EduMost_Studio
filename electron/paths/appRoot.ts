import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

export function resolveAppRoot(electronDir: string): string {
  if (process.env.APP_ROOT) {
    return process.env.APP_ROOT;
  }

  const unpackedRoot =
    typeof process.resourcesPath === 'string'
      ? path.join(process.resourcesPath, 'app.asar.unpacked')
      : null;

  if (unpackedRoot && fs.existsSync(path.join(unpackedRoot, 'package.json'))) {
    return unpackedRoot;
  }

  return path.join(electronDir, '..');
}

export function readPackageVersion(appRoot: string): string {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(appRoot, 'package.json'), 'utf-8'),
    ) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function loadNativeModule<T>(moduleName: string, appRoot: string): T {
  const asarPackageJson =
    typeof process.resourcesPath === 'string'
      ? path.join(process.resourcesPath, 'app.asar', 'package.json')
      : null;

  if (asarPackageJson && fs.existsSync(asarPackageJson)) {
    try {
      const require = createRequire(asarPackageJson);
      return require(moduleName) as T;
    } catch {
      // fall back to explicit module paths below
    }
  }

  const moduleCandidates = [
    typeof process.resourcesPath === 'string'
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', moduleName)
      : null,
    path.join(appRoot, 'node_modules', moduleName),
    path.join(appRoot, '..', 'app.asar.unpacked', 'node_modules', moduleName),
  ].filter((value): value is string => value != null);

  for (const modulePath of moduleCandidates) {
    const modulePkg = path.join(modulePath, 'package.json');
    if (!fs.existsSync(modulePkg)) continue;

    try {
      const require = createRequire(modulePkg);
      return require(modulePath) as T;
    } catch {
      // try next candidate
    }
  }

  const requireRoots = [
    typeof process.resourcesPath === 'string'
      ? path.join(process.resourcesPath, 'app.asar.unpacked')
      : null,
    appRoot,
    path.join(appRoot, '..'),
  ].filter((value): value is string => value != null);

  for (const root of requireRoots) {
    const pkgJson = path.join(root, 'package.json');
    if (!fs.existsSync(pkgJson)) continue;

    try {
      const require = createRequire(pkgJson);
      return require(moduleName) as T;
    } catch {
      // try next root
    }
  }

  throw new Error(
    `Failed to load native module "${moduleName}". Checked: ${moduleCandidates.join(', ')}`,
  );
}
