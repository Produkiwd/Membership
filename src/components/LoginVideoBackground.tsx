import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const videoUrl = 'https://uyqgionbubycyfdmweai.supabase.co/storage/v1/object/public/Asset%20WEB/Animate_image_into_looping_video_20261008170406.mp4';

export default function LoginVideoBackground() {
  const [enabled, setEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setEnabled(!preference.matches); setReady(false); };
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return <>
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      {enabled && !failed && <video
        className={`h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        src={videoUrl}
        autoPlay muted loop playsInline preload="metadata" tabIndex={-1}
        onPlaying={() => setReady(true)}
        onError={() => { setFailed(true); setReady(false); }}
      />}
      <div className="absolute inset-0 bg-[#001E3C]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001E3C]/80 via-transparent to-[#001E3C]/20" />
    </div>
    {!failed && <button type="button" onClick={() => { setEnabled(previous => !previous); setReady(false); }} aria-pressed={enabled} className="fixed bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#001E3C]/80 px-4 py-2 font-body text-xs text-[#F7F9FC] backdrop-blur-md hover:border-[#00AACC] focus-visible:outline-2 focus-visible:outline-[#00AACC]">
      {enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      {enabled ? 'Jeda background' : 'Putar background'}
    </button>}
  </>;
}
