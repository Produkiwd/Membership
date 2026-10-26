import { supabase } from './supabase';
import { checkSkillMarkdown, isZipSkill, type SkillItem } from './skills';

// Skills are module_materials rows with module_id 'skills'; the file sits in the module-materials bucket.
const SKILL_MODULE = 'skills';
const MATERIAL_BUCKET = 'module-materials';

export async function listSkills(): Promise<SkillItem[]> {
  const { data, error } = await supabase.from('module_materials')
    .select('id,module_id,title,description,url,created_at').eq('module_id', SKILL_MODULE).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function uploadSkill(file: File, title: string, description: string): Promise<void> {
  const zip = isZipSkill(file.name);
  if (!zip && !/\.md$/i.test(file.name)) throw new Error('Pilih file SKILL.md, .zip, atau .skill.');
  if (!zip) {
    const problem = checkSkillMarkdown(await file.text());
    if (problem) throw new Error(problem);
  }
  const path = `skills/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const { error } = await supabase.storage.from(MATERIAL_BUCKET)
    .upload(path, file, { contentType: zip ? 'application/zip' : 'text/markdown' });
  if (error) throw error;
  const { error: insertError } = await supabase.from('module_materials')
    .insert([{ module_id: SKILL_MODULE, title, description: description || null, url: `storage:${path}` }]);
  if (insertError) {
    await supabase.storage.from(MATERIAL_BUCKET).remove([path]);
    throw insertError;
  }
}

// Signed on click so the link never expires on an open page; `download` names the saved file.
export async function downloadSkillUrl(skill: SkillItem): Promise<string> {
  const path = skill.url.slice('storage:'.length);
  const fileName = isZipSkill(path) ? path.split('/').pop()!.replace(/^[0-9a-f-]{36}-/, '') : 'SKILL.md';
  const { data, error } = await supabase.storage.from(MATERIAL_BUCKET).createSignedUrl(path, 60, { download: fileName });
  if (error) throw error;
  return data.signedUrl;
}
