import { useEffect, useState } from 'react';
import { artifactStorageKey, parseOpenedArtifacts } from './artifactProgress';

function read(userId: string) {
  try { return { userId, opened: parseOpenedArtifacts(localStorage.getItem(artifactStorageKey(userId))), error: '' }; }
  catch { return { userId, opened: [] as string[], error: 'Penyimpanan browser tidak tersedia. Progres belum dapat disimpan.' }; }
}
export function useArtifactProgress(userId: string) {
  const [snapshot, setSnapshot] = useState(() => read(userId));
  useEffect(() => {
    setSnapshot(read(userId));
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === artifactStorageKey(userId)) setSnapshot(read(userId));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [userId]);
  const recordOpen = (artifactId: string) => {
    try {
      const opened = parseOpenedArtifacts(JSON.stringify([...parseOpenedArtifacts(localStorage.getItem(artifactStorageKey(userId))), artifactId]));
      localStorage.setItem(artifactStorageKey(userId), JSON.stringify(opened));
      setSnapshot({ userId, opened, error: '' });
    } catch { setSnapshot(previous => ({ ...previous, error: 'Progres gagal disimpan. Periksa izin penyimpanan browser.' })); }
  };
  return { opened: snapshot.userId === userId ? snapshot.opened : [], error: snapshot.userId === userId ? snapshot.error : '', recordOpen };
}
