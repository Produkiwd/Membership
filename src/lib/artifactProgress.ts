// `load` fetches large built-in HTML on demand so it stays out of the main bundle.
export type LearningArtifact = { id: string; title: string; content?: string; url?: string; images?: string[]; load?: () => Promise<string> };
export type RemoteArtifact = { id: string; title: string; url: string; content?: string; load?: () => Promise<string> };

const remoteSource = (item: RemoteArtifact) => item.content ? { content: item.content } : item.load ? { load: item.load } : { url: item.url };

export function buildArtifactList(moduleId: string, sections: any[], remote: RemoteArtifact[]): LearningArtifact[] {
  const visuals = remote.filter(item => /^Materi Visual \d+$/.test(item.title)).sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true })).map(item => item.url);
  const reserved = new Set<string>();
  for (const section of sections) {
    if (section.title) reserved.add(section.title);
    for (const item of section.htmls || []) if (item.title) reserved.add(item.title);
  }
  // A remote row titled exactly like a built-in material replaces its file but keeps its id and position,
  // so progress and Prompt Journal links survive. Without the row, the repo copy is used.
  const overrides = new Map(remote.map(item => [item.title, item]));
  const builtIn = sections.flatMap(section => section.htmls || [section.html ? { title: section.title, content: section.html } : section])
    .map(item => {
      const override = (item.content || item.load) && overrides.get(item.title);
      return { ...(override ? { title: item.title, ...remoteSource(override) } : item), id: `${moduleId}:builtin:${item.title}`, ...(item.title === 'Materi Visual' && visuals.length ? { images: visuals } : {}) };
    });
  const extra = remote.filter(item => !reserved.has(item.title) && !/^Materi Visual \d+$/.test(item.title))
    .map(item => ({ id: `${moduleId}:remote:${item.id}`, title: item.title, ...remoteSource(item) }));
  return [...builtIn, ...extra].filter(item => item.content || item.url || item.load || item.images?.length);
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
