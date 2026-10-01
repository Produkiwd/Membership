export const MODULE_IDS = ['01', '02', '03', '04', '05', '06', '07'] as const;

export function progressStorageKey(userId: string): string {
  return `sinau.module-progress.v1:${userId}`;
}

export function parseModuleProgress(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return [];
    return MODULE_IDS.filter((id) => parsed.includes(id));
  } catch {
    return [];
  }
}

export function toggleModuleProgress(completed: string[], moduleId: string): string[] {
  if (!MODULE_IDS.some((id) => id === moduleId)) return completed;
  const updated = new Set(completed);
  if (updated.has(moduleId)) updated.delete(moduleId);
  else updated.add(moduleId);
  return MODULE_IDS.filter((id) => updated.has(id));
}
