import fs from 'node:fs';
import path from 'node:path';
import { app, nativeImage } from 'electron';
import type { NativeImage } from 'electron';

function exists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function resolveAppIconPath(electronDir: string, appRoot?: string): string | null {
  const projectRoot = path.join(electronDir, '..');
  const root = appRoot ?? projectRoot;

  const candidates = [
    path.join(root, 'build', 'icon.icns'),
    path.join(projectRoot, 'build', 'icon.icns'),
    path.join(root, 'build', 'EduMost_logo.png'),
    path.join(projectRoot, 'build', 'EduMost_logo.png'),
  ];

  for (const candidate of candidates) {
    if (exists(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function loadAppIcon(electronDir: string, appRoot?: string): NativeImage | undefined {
  const iconPath = resolveAppIconPath(electronDir, appRoot);
  if (!iconPath) {
    return undefined;
  }

  const image = nativeImage.createFromPath(iconPath);
  return image.isEmpty() ? undefined : image;
}

export function applyAppIcon(electronDir: string, appRoot?: string): string | null {
  const iconPath = resolveAppIconPath(electronDir, appRoot);
  if (!iconPath) {
    return null;
  }

  const icon = loadAppIcon(electronDir, appRoot);
  if (!icon) {
    return null;
  }

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }

  return iconPath;
}
