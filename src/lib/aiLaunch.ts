// Membuka prompt langsung di aplikasi AI. ChatGPT dan Claude menerima prompt lewat parameter ?q=.
// Gemini belum punya parameter resmi, jadi prompt disalin lalu Gemini dibuka.

export type AiProvider = 'chatgpt' | 'claude' | 'gemini';

export const AI_PROVIDERS: { id: AiProvider; label: string; home: string; query?: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT', home: 'https://chatgpt.com/', query: 'https://chatgpt.com/?q=' },
  { id: 'claude', label: 'Claude', home: 'https://claude.ai/new', query: 'https://claude.ai/new?q=' },
  { id: 'gemini', label: 'Gemini', home: 'https://gemini.google.com/app' },
];

// Prompt panjang bisa terpotong di URL, jadi di atas batas ini pengguna menempel sendiri.
export const MAX_URL_LENGTH = 7000;

export function aiLaunch(provider: AiProvider, text: string): { url: string; prefilled: boolean } {
  const target = AI_PROVIDERS.find(item => item.id === provider)!;
  const prompt = text.trim();
  if (target.query && prompt) {
    const url = target.query + encodeURIComponent(prompt);
    if (url.length <= MAX_URL_LENGTH) return { url, prefilled: true };
  }
  return { url: target.home, prefilled: false };
}
