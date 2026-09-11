import { supabase } from './supabase';

export type Materi = {
  id: string;
  module_id: string;
  title: string;
  url: string;
  stored_url?: string;
  content?: string;
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
    const { data: file, error: downloadError } = await supabase.storage
      .from(MATERIAL_BUCKET)
      .download(storagePath);

    if (downloadError) throw downloadError;
    return {
      ...materi,
      stored_url: materi.url,
      url: data.signedUrl,
      content: await file.text(),
    };
  }

  return { ...materi, stored_url: materi.url, url: data.signedUrl };
};

export const getMateriByModule = async (moduleId: string): Promise<Materi[]> => {
  const { data, error } = await supabase
    .from('module_materials')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
  return Promise.all((data || []).map(resolveMaterialUrl));
};

export const addMateri = async (moduleId: string, title: string, url: string): Promise<Materi | null> => {
  const { data, error } = await supabase
    .from('module_materials')
    .insert([{ module_id: moduleId, title, url }])
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
  const { error } = await supabase
    .from('module_materials')
    .delete()
    .eq('id', materi.id);
    
  if (error) {
    console.error('Error deleting material:', error);
    throw error;
  }

  const storedUrl = materi.stored_url || materi.url;
  if (storedUrl.startsWith('storage:')) {
    const storagePath = storedUrl.slice('storage:'.length);
    const { error: storageError } = await supabase.storage
      .from(MATERIAL_BUCKET)
      .remove([storagePath]);
    if (storageError) console.error('Error deleting material file:', storageError);
  }
};
