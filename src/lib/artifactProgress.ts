export type LearningArtifact = { id: string; title: string; content?: string; url?: string; load?: () => Promise<string> };
export type RemoteArtifact = { id: string; title: string; url: string; content?: string; load?: () => Promise<string>; legacy_key?: string | null };

const remoteSource = (item: RemoteArtifact) => item.content ? { content: item.content } : item.load ? { load: item.load } : { url: item.url };

// Every material comes from module_materials, already sorted. Rows moved from the old built-in list keep
// their old id through legacy_key, so opened progress and Prompt Journal links survive the move.
export function buildArtifactList(moduleId: string, remote: RemoteArtifact[]): LearningArtifact[] {
  return remote.map(item => ({ id: `${moduleId}:${item.legacy_key ? `builtin:${item.legacy_key}` : `remote:${item.id}`}`, title: item.title, ...remoteSource(item) }));
}

export function artifactStorageKey(userId: string) { return `sinau.artifact-progress.v1:${userId}`; }
export function parseOpenedArtifacts(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && /^(0[1-7]):(builtin|remote):.+$/.test(id)))] : [];
  } catch { return []; }
}
export function artifactStats(artifacts: LearningArtifact[], opened: string[]) {
  const ids = new Set(artifacts.map(item => item.id));
  const count = [...new Set(opened)].filter(id => ids.has(id)).length;
  return { opened: count, total: ids.size, percent: ids.size ? Math.round(count / ids.size * 100) : 0 };
}
