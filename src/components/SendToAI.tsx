import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { AI_PROVIDERS, aiLaunch, type AiProvider } from '../lib/aiLaunch';

interface SendToAIProps {
  text: string;
  className?: string;
}

// Satu klik: prompt disalin, lalu ChatGPT, Claude, atau Gemini terbuka di tab baru.
export const SendToAI: React.FC<SendToAIProps> = ({ text, className = '' }) => {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const open = (provider: AiProvider, label: string) => {
    const { url, prefilled } = aiLaunch(provider, text);
    navigator.clipboard?.writeText(text).catch(() => {});
    window.open(url, '_blank', 'noopener,noreferrer');
    setNotice(prefilled
      ? `${label} terbuka di tab baru dengan prompt Anda. Kalau kotak chat masih kosong, tekan Ctrl+V (Cmd+V di Mac).`
      : `Prompt sudah disalin. Di ${label}, klik kotak chat lalu tekan Ctrl+V (Cmd+V di Mac).`);
  };

  const disabled = !text.trim();

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-500 mr-0.5">Buka di</span>
        {AI_PROVIDERS.map(item => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => open(item.id, item.label)}
            title={`Salin prompt dan buka ${item.label}`}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-[#D4A84B] hover:bg-amber-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-40"
          >
            {item.label} <ExternalLink size={10} className="text-slate-400" />
          </button>
        ))}
      </div>
      {notice && <p role="status" className="mt-1.5 text-[11px] text-slate-600 leading-snug">{notice}</p>}
    </div>
  );
};
