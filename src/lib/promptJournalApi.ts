import { supabase } from './supabase';
import { cleanFields, compilePrompt, type Framework, type FormulaFields, type JournalEntry, type PromptMaterial } from './promptJournal';

const rpcError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export async function listJournal(materialKey?: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase.rpc('prompt_journal_list', { p_material_key: materialKey ?? null });
  rpcError(error);
  return (data || []) as JournalEntry[];
}

export async function saveJournalEntry(input: { material: PromptMaterial; framework: Framework; fields: FormulaFields; notes: string }): Promise<JournalEntry> {
  const fields = cleanFields(input.fields, input.framework);
  const { data, error } = await supabase.rpc('prompt_journal_save', {
    p_material_key: input.material.key,
    p_material_title: input.material.title,
    p_framework: input.framework,
    p_fields: fields,
    p_prompt_text: compilePrompt(fields, input.framework),
    p_notes: input.notes.trim() || null,
  });
  rpcError(error);
  return data as JournalEntry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.rpc('prompt_journal_delete', { p_entry_id: id });
  rpcError(error);
}
