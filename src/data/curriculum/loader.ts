import type { UnitContent } from '../../types/index';

const UNIT_LOADERS: Record<string, () => Promise<UnitContent>> = {
  u01: () => import('./units/u01').then((m) => m.default),
  u02: () => import('./units/u02').then((m) => m.default),
  u03: () => import('./units/u03').then((m) => m.default),
  u04: () => import('./units/u04').then((m) => m.default),
  u05: () => import('./units/u05').then((m) => m.default),
  u06: () => import('./units/u06').then((m) => m.default),
  u07: () => import('./units/u07').then((m) => m.default),
  u08: () => import('./units/u08').then((m) => m.default),
  u09: () => import('./units/u09').then((m) => m.default),
  u10: () => import('./units/u10').then((m) => m.default),
  u11: () => import('./units/u11').then((m) => m.default),
  u12: () => import('./units/u12').then((m) => m.default),
  u13: () => import('./units/u13').then((m) => m.default),
  u14: () => import('./units/u14').then((m) => m.default),
  u15: () => import('./units/u15').then((m) => m.default),
  u16: () => import('./units/u16').then((m) => m.default),
};

export function isUnitLoadable(id: string): boolean {
  return id in UNIT_LOADERS;
}

export async function loadUnit(id: string): Promise<UnitContent> {
  const loader = UNIT_LOADERS[id];
  if (!loader) {
    throw new Error(`Unit "${id}" is not available yet.`);
  }
  return loader();
}
