import { supabase } from './supabase';

export type Materi = {
  id: string;
  module_id: string;
  title: string;
  url: string;
  created_at: string;
};

export const getMateriByModule = async (moduleId: string): Promise<Materi[]> => {
  const { data, error } = await supabase
    .from('module_materials')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  return data || [];
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

export const deleteMateri = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('module_materials')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};
