import { supabase } from './supabase';

export type Materi = {
  id: string;
  module_id: string;
  title: string;
  url: string;
  section?: string | null;
  sort_order?: number | null;
  legacy_key?: string | null;
  stored_url?: string;
  content?: string;
  load?: () => Promise<string>;
  created_at: string;
};

const MATERIAL_BUCKET = 'module-materials';
const MATERIAL_FOLDERS: Record<string, string> = {
  '01': 'strategize',
  '02': 'prompt',
  '03': 'create',
  '04': 'think',
  '05': 'build',
  '06': 'act',
  '07': 'ai-os',
};

const resolveMaterialUrl = async (materi: Materi): Promise<Materi> => {
  if (!materi.url.startsWith('storage:')) return materi;

  const storagePath = materi.url.slice('storage:'.length);
  const { data, error } = await supabase.storage
    .from(MATERIAL_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) throw error;

  if (/\.html?$/i.test(storagePath)) {
    // Download when opened, not when the module opens: some materials are ~9 MB.
    const load = async () => {
      const { data: file, error: downloadError } = await supabase.storage
        .from(MATERIAL_BUCKET)
        .download(storagePath);

      if (downloadError) throw downloadError;
      return file.text();
    };
    return { ...materi, stored_url: materi.url, url: data.signedUrl, load };
  }

  return { ...materi, stored_url: materi.url, url: data.signedUrl };
};

export const getMateriByModule = async (moduleId: string): Promise<Materi[]> => {
  const { data, error } = await supabase
    .from('module_materials')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
  return Promise.all((data || []).map(resolveMaterialUrl));
};

// Fetch only catalog metadata for the progress denominator, without downloading files.
export const getMateriCatalog = async (moduleIds: string[]): Promise<Materi[]> => {
  const { data, error } = await supabase.from('module_materials')
    .select('id,module_id,title,url,section,sort_order,legacy_key,created_at').in('module_id', moduleIds)
    .order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const addMateri = async (moduleId: string, title: string, url: string, section?: string | null): Promise<Materi | null> => {
  const { data: last, error: lastError } = await supabase.from('module_materials')
    .select('sort_order').eq('module_id', moduleId).not('sort_order', 'is', null)
    .order('sort_order', { ascending: false }).limit(1).maybeSingle();
  if (lastError) throw lastError;
  const { data, error } = await supabase
    .from('module_materials')
    .insert([{ module_id: moduleId, title, url, section: section || null, sort_order: (last?.sort_order ?? 0) + 1 }])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding material:', error);
    throw error;
  }
  return data;
};

export const uploadMateriFile = async (moduleId: string, file: File): Promise<string> => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const moduleFolder = MATERIAL_FOLDERS[moduleId] || `module-${moduleId}`;
  const storagePath = `${moduleFolder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from(MATERIAL_BUCKET)
    .upload(storagePath, file, { contentType: file.type || 'application/octet-stream' });

  if (error) throw error;
  return `storage:${storagePath}`;
};

export const deleteMateri = async (materi: Materi): Promise<void> => {
  const { data, error } = await supabase
    .from('module_materials')
    .delete()
    .eq('id', materi.id)
    .select('id');
    
  if (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
  // RLS turns a forbidden delete into zero rows without an error.
  if (!data?.length) throw new Error('Materi tidak terhapus. Pastikan akun ini admin.');

  const storedUrl = materi.stored_url || materi.url;
  if (storedUrl.startsWith('storage:')) {
    const storagePath = storedUrl.slice('storage:'.length);
    const { error: storageError } = await supabase.storage
      .from(MATERIAL_BUCKET)
      .remove([storagePath]);
    if (storageError) console.error('Error deleting material file:', storageError);
  }
};

// Saves the whole module order as 1..n, which also repairs gaps left by deletes and rows without sort_order.
export const saveMateriOrder = async (ordered: Materi[]): Promise<void> => {
  const results = await Promise.all(ordered.map((materi, index) =>
    supabase.from('module_materials').update({ sort_order: index + 1 }).eq('id', materi.id).select('id')));
  const failed = results.find(result => result.error || !result.data?.length);
  if (failed) throw failed.error || new Error('Urutan tidak tersimpan. Pastikan akun ini admin.');
};
