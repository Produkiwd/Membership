type SearchableMember = { name?: string | null; email?: string | null; group?: string | null };

export function filterMembers<T extends SearchableMember>(members: T[], query: string, group: string): T[] {
  const terms = query.trim().toLocaleLowerCase('id').split(/\s+/).filter(Boolean);
  return members.filter((member) => {
    if (group && member.group !== group) return false;
    const searchableText = `${member.name || ''} ${member.email || ''}`.toLocaleLowerCase('id');
    return terms.every((term) => searchableText.includes(term));
  });
}
