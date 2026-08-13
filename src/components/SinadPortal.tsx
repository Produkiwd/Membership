import React, { useState, useEffect, useRef } from 'react';
import { LucideIcon, ArrowRight, MonitorUp, BookOpen, Presentation, Sparkles, ExternalLink, Users, BrainCircuit, Compass, ClipboardCheck, FileQuestion, PenTool, Hand, ScreenShare } from 'lucide-react';

export default function SinadPortal() {
  const [activePage, setActivePage] = useState<'home' | 'materials' | 'apps'>('home');
  const [activeTool, setActiveTool] = useState<'pen' | 'touch' | 'share'>('pen');
  const [showToast, setShowToast] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  
  const handleLaunch = () => {
    setShowToast(true);
    if (toastRef.current) {
      toastRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div id="sinad-ecosystem" className="w-full">
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/satoshi@5.2.6/index.css');
        @import url('https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap');
        #sinad-ecosystem {
          --se-page: #f5f8fa;
          --se-surface: #ffffff;
          --se-soft: #f5f7f8;
          --se-text: #101820;
          --se-muted: #6a6a6a;
          --se-border: #dfe7eb;
          --se-gold: #fcb528;
          --se-gold-soft: #fff5dc;
          --se-green: #258245;
          --se-green-soft: #e8f5eb;
          --se-blue: #005287;
          --se-blue-dark: #002d69;
          --se-blue-soft: #e9f3f8;
          --se-orange: #ff9900;
          --se-red: #a30101;
          --se-purple: #1a0157;
          --se-shadow: 0 14px 40px rgba(0, 45, 105, .10);
          color: var(--se-text);
          background: transparent;
          font-family: "Carlito", Arial, sans-serif;
        }
        #sinad-ecosystem * { box-sizing: border-box; }
        #sinad-ecosystem button, #sinad-ecosystem input { font: inherit; }
        #sinad-ecosystem .se-shell { position: relative; isolation: isolate; background: transparent; border: 1px solid var(--se-border); border-radius: 18px; overflow: hidden; box-shadow: var(--se-shadow); text-align: left; }
        #sinad-ecosystem .se-video-wall { position: absolute; inset: 0; z-index: -3; overflow: hidden; background: var(--se-blue-dark); }
        #sinad-ecosystem .se-site-video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: contain; object-position: center; }
        #sinad-ecosystem .se-site-overlay { position: absolute; inset: 0; z-index: -2; background: linear-gradient(180deg, rgba(245,248,250,.84), rgba(245,248,250,.93) 45%, rgba(245,248,250,.88)); pointer-events: none; }
        #sinad-ecosystem .se-topbar { min-height: 68px; padding: 0 26px; display: grid; grid-template-columns: 1fr; align-items: center; background: var(--se-surface); border-bottom: 1px solid var(--se-border); }
        #sinad-ecosystem .se-logo { display: flex; align-items: center; gap: 8px; font-weight: 500; letter-spacing: -.03em; font-size: 18px; }
        #sinad-ecosystem .se-logo-dot { width: 8px; height: 8px; background: var(--se-gold); border-radius: 50%; }
        #sinad-ecosystem .se-nav { display: flex; justify-content: center; gap: 4px; }
        #sinad-ecosystem .se-nav button { border: 0; background: transparent; color: var(--se-muted); padding: 9px 11px; border-radius: 9px; font-size: 14px; cursor: pointer; }
        #sinad-ecosystem .se-nav button.is-current { background: var(--se-gold-soft); color: var(--se-text); font-weight: 700; }
        #sinad-ecosystem .se-user { display: flex; align-items: center; gap: 9px; }
        #sinad-ecosystem .se-avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: var(--se-gold-soft); color: var(--se-gold); font-weight: 700; font-size: 12px; }
        #sinad-ecosystem .se-user-copy { line-height: 1.25; }
        #sinad-ecosystem .se-user-copy strong { display: block; font-size: 12px; font-weight: 700; }
        #sinad-ecosystem .se-user-copy span { color: var(--se-muted); font-size: 11px; }
        #sinad-ecosystem .se-main { position: relative; z-index: 1; max-width: 1160px; margin: 0 auto; padding: 30px 28px 40px; }
        #sinad-ecosystem .se-page { display: none; }
        #sinad-ecosystem .se-page.is-visible { display: block; }
        #sinad-ecosystem .se-hero { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px; }
        #sinad-ecosystem .se-welcome { position: relative; overflow: hidden; background: linear-gradient(125deg, light-dark(#f8dc91, #dfaa36), light-dark(#eaba50, #b97815)); color: #251d10; border-radius: 16px; padding: 26px; }
        #sinad-ecosystem .se-welcome::after { content: ""; position: absolute; width: 220px; height: 220px; border-radius: 50%; border: 42px solid rgba(255,255,255,.17); right: -65px; top: -110px; }
        #sinad-ecosystem .se-eyebrow { margin: 0 0 7px; text-transform: uppercase; letter-spacing: .14em; font-size: 12px; font-weight: 700; opacity: .68; }
        #sinad-ecosystem h1 { margin: 0 0 8px; max-width: 610px; font-family: "Satoshi Variable", "Arial Black", sans-serif; font-size: clamp(24px, 3vw, 34px); line-height: 1.1; letter-spacing: -.035em; font-weight: 500; }
        #sinad-ecosystem .se-lead { margin: 0 0 21px; max-width: 580px; font-size: 15px; line-height: 1.55; opacity: .77; }
        #sinad-ecosystem .se-actions { display: flex; flex-wrap: wrap; gap: 9px; position: relative; z-index: 1; }
        #sinad-ecosystem .se-primary, #sinad-ecosystem .se-secondary { border-radius: 9px; padding: 10px 14px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; border: 1px solid transparent; }
        #sinad-ecosystem .se-primary { border: 1px solid #282219; background: #282219; color: #fffaf0; }
        #sinad-ecosystem .se-secondary { border: 1px solid rgba(37,29,16,.25); background: rgba(255,255,255,.24); color: #251d10; }
        #sinad-ecosystem .se-progress { background: var(--se-surface); border: 1px solid var(--se-border); border-radius: 16px; padding: 22px; display: flex; flex-direction: column; justify-content: center; }
        #sinad-ecosystem .se-progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
        #sinad-ecosystem .se-progress-head span { color: var(--se-muted); font-size: 12px; }
        #sinad-ecosystem .se-progress-head strong { font-size: 26px; font-weight: 700; letter-spacing: -.04em; }
        #sinad-ecosystem .se-track { height: 7px; background: var(--se-border); border-radius: 99px; overflow: hidden; margin: 11px 0 16px; }
        #sinad-ecosystem .se-track span { display: block; height: 100%; width: 62%; border-radius: inherit; background: var(--se-gold); }
        #sinad-ecosystem .se-stats { display: grid; grid-template-columns: repeat(3,1fr); }
        #sinad-ecosystem .se-stat { border-right: 1px solid var(--se-border); padding-right: 8px; }
        #sinad-ecosystem .se-stat:last-child { border: 0; padding-left: 10px; }
        #sinad-ecosystem .se-stat:nth-child(2) { padding-left: 10px; }
        #sinad-ecosystem .se-stat strong { display: block; font-size: 18px; font-weight: 700; }
        #sinad-ecosystem .se-stat span { color: var(--se-muted); font-size: 10px; }
        #sinad-ecosystem .se-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(250px, .7fr); gap: 20px; }
        #sinad-ecosystem .se-stack { display: grid; gap: 20px; align-content: start; }
        #sinad-ecosystem .se-panel { background: rgba(255,255,255,.91); border: 1px solid rgba(223,231,235,.92); border-radius: 15px; padding: 20px; box-shadow: 0 8px 24px rgba(0,45,105,.055); backdrop-filter: blur(12px); }
        #sinad-ecosystem .se-panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        #sinad-ecosystem h2 { margin: 0 0 4px; font-family: "Satoshi Variable", Arial, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -.02em; }
        #sinad-ecosystem .se-caption { margin: 0; color: var(--se-muted); font-size: 11px; line-height: 1.45; }
        #sinad-ecosystem .se-text-action { border: 0; background: transparent; color: var(--se-gold); padding: 3px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        #sinad-ecosystem .se-course-list { display: grid; gap: 9px; }
        #sinad-ecosystem .se-course { border: 1px solid var(--se-border); background: var(--se-soft); color: var(--se-text); border-radius: 11px; padding: 12px; display: grid; grid-template-columns: 38px 1fr auto; gap: 11px; align-items: center; text-align: left; cursor: pointer; }
        #sinad-ecosystem .se-course:hover { border-color: var(--se-gold); }
        #sinad-ecosystem .se-icon { width: 38px; height: 38px; border-radius: 9px; display: grid; place-items: center; background: var(--se-gold-soft); color: var(--se-gold); }
        #sinad-ecosystem .se-icon svg { width: 18px; height: 18px; }
        #sinad-ecosystem .se-course strong { display: block; margin-bottom: 4px; font-size: 14px; font-weight: 700; }
        #sinad-ecosystem .se-course-info { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; color: var(--se-muted); font-size: 10px; }
        #sinad-ecosystem .se-source { border: 1px solid var(--se-border); border-radius: 99px; padding: 2px 6px; background: var(--se-surface); }
        #sinad-ecosystem .se-course-state { color: var(--se-muted); font-size: 12px; white-space: nowrap; font-weight: 700; }
        #sinad-ecosystem .se-course-state.is-done { color: var(--se-green); }
        #sinad-ecosystem .se-ai { background: linear-gradient(145deg, var(--se-blue-soft), var(--se-surface)); border-color: light-dark(#cfdeea, #31506a); }
        #sinad-ecosystem .se-ai-mark { width: 42px; height: 42px; border-radius: 11px; display: grid; place-items: center; color: var(--se-blue); background: var(--se-surface); margin-bottom: 13px; }
        #sinad-ecosystem .se-ai h2 { font-size: 18px; }
        #sinad-ecosystem .se-ai p { color: var(--se-muted); font-size: 13px; line-height: 1.55; margin: 7px 0 15px; }
        #sinad-ecosystem .se-ai-button { width: 100%; justify-content: center; border: 1px solid var(--se-blue); background: var(--se-blue); color: var(--se-surface); }
        #sinad-ecosystem .se-event-list { display: grid; gap: 13px; }
        #sinad-ecosystem .se-event { display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: start; }
        #sinad-ecosystem .se-date { padding: 6px 3px; border-radius: 9px; text-align: center; background: var(--se-gold-soft); color: var(--se-gold); font-size: 16px; font-weight: 700; }
        #sinad-ecosystem .se-date small { display: block; font-size: 9px; text-transform: uppercase; }
        #sinad-ecosystem .se-event strong { display: block; margin: 1px 0 3px; font-size: 13px; font-weight: 700; }
        #sinad-ecosystem .se-event span { color: var(--se-muted); font-size: 11px; }
        #sinad-ecosystem .se-partners { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        #sinad-ecosystem .se-partner { border: 1px solid var(--se-border); border-radius: 11px; background: var(--se-soft); color: var(--se-text); padding: 12px; text-align: left; cursor: pointer; }
        #sinad-ecosystem .se-partner strong { display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
        #sinad-ecosystem .se-partner span { color: var(--se-muted); font-size: 10px; }
        #sinad-ecosystem .se-page-head { margin-bottom: 20px; }
        #sinad-ecosystem .se-page-head h1 { font-size: 32px; color: var(--se-text); margin-bottom: 8px; }
        #sinad-ecosystem .se-page-head .se-lead { color: var(--se-muted); opacity: 1; margin-bottom: 0; font-size: 15px; }
        #sinad-ecosystem .se-breadcrumb { color: var(--se-muted); font-size: 11px; margin-bottom: 14px; }
        #sinad-ecosystem .se-values { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        #sinad-ecosystem .se-value { background: var(--se-soft); border: 1px solid var(--se-border); border-radius: 11px; padding: 13px; }
        #sinad-ecosystem .se-value span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: var(--se-gold-soft); color: var(--se-gold); font-weight: 700; font-size: 12px; margin-bottom: 10px; }
        #sinad-ecosystem .se-value strong { display: block; font-size: 12px; font-weight: 700; margin-bottom: 3px; }
        #sinad-ecosystem .se-value p { margin: 0; color: var(--se-muted); font-size: 10px; line-height: 1.4; }
        #sinad-ecosystem .se-catalog { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        #sinad-ecosystem .se-catalog-item { border: 1px solid var(--se-border); background: var(--se-surface); border-radius: 12px; overflow: hidden; }
        #sinad-ecosystem .se-thumb { height: 90px; display: flex; align-items: flex-end; padding: 11px; background: linear-gradient(135deg, var(--se-gold-soft), var(--se-soft)); color: var(--se-gold); }
        #sinad-ecosystem .se-thumb svg { width: 24px; height: 24px; }
        #sinad-ecosystem .se-catalog-body { padding: 14px; }
        #sinad-ecosystem .se-catalog-body strong { display: block; font-size: 14px; font-weight: 700; margin: 7px 0 5px; }
        #sinad-ecosystem .se-catalog-body p { margin: 0 0 10px; color: var(--se-muted); font-size: 11px; line-height: 1.4; }
        #sinad-ecosystem .se-catalog-body button { border: 0; background: transparent; padding: 0; color: var(--se-gold); font-size: 12px; font-weight: 700; cursor: pointer; }
        #sinad-ecosystem .se-app-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
        #sinad-ecosystem .se-app { border: 1px solid var(--se-border); background: var(--se-surface); border-radius: 14px; padding: 19px; }
        #sinad-ecosystem .se-app .se-ai-mark { margin-bottom: 11px; }
        #sinad-ecosystem .se-app strong { display: block; font-weight: 700; font-size: 15px; margin-bottom: 5px; }
        #sinad-ecosystem .se-app p { margin: 0 0 14px; color: var(--se-muted); font-size: 12px; line-height: 1.5; }
        #sinad-ecosystem .se-toast { display: none; margin-top: 14px; padding: 10px 12px; border-radius: 9px; background: var(--se-green-soft); color: var(--se-green); font-size: 12px; }
        #sinad-ecosystem .se-toast.is-shown { display: block; animation: slideIn 0.3s ease-out forwards; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        #sinad-ecosystem .se-shell::before { content: ""; display: block; height: 7px; background: linear-gradient(90deg, var(--se-gold) 0 58%, var(--se-blue) 58% 80%, var(--se-green) 80% 100%); }
        #sinad-ecosystem .se-topbar { background: var(--se-blue); border-bottom: 0; }
        #sinad-ecosystem .se-logo { color: #ffffff; font-family: "Satoshi Variable", Arial, sans-serif; font-size: 20px; font-weight: 700;}
        #sinad-ecosystem .se-logo-dot { background: var(--se-gold); }
        #sinad-ecosystem .se-nav button { color: rgba(255,255,255,.72); }
        #sinad-ecosystem .se-nav button.is-current { background: var(--se-gold); color: #16212a; }
        #sinad-ecosystem .se-user-copy strong { color: #ffffff; }
        #sinad-ecosystem .se-user-copy span, #sinad-ecosystem .se-user > svg { color: rgba(255,255,255,.68); }
        #sinad-ecosystem .se-avatar { background: rgba(255,255,255,.16); color: #ffffff; border: 1px solid rgba(255,255,255,.22); }
        #sinad-ecosystem .se-welcome { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(260px, .95fr); gap: 24px; align-items: center; background: rgba(0,45,105,.86); color: #ffffff; padding: 28px; isolation: isolate; backdrop-filter: blur(5px); }
        #sinad-ecosystem .se-welcome::before { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(0,45,105,.96) 0%, rgba(0,82,135,.82) 47%, rgba(0,45,105,.38) 100%); }
        #sinad-ecosystem .se-welcome::after { width: 260px; height: 260px; right: -80px; top: -150px; z-index: -1; border-color: rgba(252,181,40,.18); }
        #sinad-ecosystem .se-welcome-copy { position: relative; z-index: 2; }
        #sinad-ecosystem .se-welcome .se-eyebrow { color: var(--se-gold); opacity: 1; }
        #sinad-ecosystem .se-welcome .se-lead { color: rgba(255,255,255,.76); opacity: 1; }
        #sinad-ecosystem .se-welcome .se-primary { background: var(--se-gold); color: #15222b; border-color: var(--se-gold); }
        #sinad-ecosystem .se-welcome .se-secondary { color: #ffffff; border-color: rgba(255,255,255,.34); background: rgba(255,255,255,.08); }
        #sinad-ecosystem .se-progress { border-top: 4px solid var(--se-gold); }
        #sinad-ecosystem .se-primary { background: var(--se-blue); border-color: var(--se-blue); color: #ffffff; }
        #sinad-ecosystem .se-ai-button { background: var(--se-gold); border-color: var(--se-gold); color: #18242d; }
        #sinad-ecosystem .se-icon { background: var(--se-blue-soft); color: var(--se-blue); }
        #sinad-ecosystem .se-text-action, #sinad-ecosystem .se-catalog-body button { color: var(--se-blue); }
        #sinad-ecosystem .se-ifp-wrap { position: relative; z-index: 2; padding: 5px 5px 17px; border-radius: 12px; background: #111820; box-shadow: 0 18px 30px rgba(0,0,0,.28); }
        #sinad-ecosystem .se-ifp-wrap::after { content: ""; position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); width: 36px; height: 3px; border-radius: 9px; background: #5e6770; }
        #sinad-ecosystem .se-ifp-screen { min-height: 190px; border-radius: 8px; overflow: hidden; color: var(--se-text); background: #f6f8f9; border: 1px solid #34424d; position: relative; }
        #sinad-ecosystem .se-ifp-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; background: #ffffff; border-bottom: 1px solid #dae4e8; font-family: "Satoshi Variable", Arial, sans-serif; font-size: 11px; color: var(--se-blue); font-weight: 700; }
        #sinad-ecosystem .se-live { display: inline-flex; align-items: center; gap: 4px; border-radius: 99px; padding: 3px 7px; color: #ffffff; background: var(--se-red); font-family: "Carlito", Arial, sans-serif; font-weight: 700; }
        #sinad-ecosystem .se-board { position: relative; min-height: 160px; padding: 15px 16px 34px 45px; overflow: hidden; background: linear-gradient(145deg, #ffffff, #edf6fa); }
        #sinad-ecosystem .se-board-kicker { margin: 0 0 5px; color: var(--se-orange); text-transform: uppercase; letter-spacing: .12em; font-size: 9px; font-weight: 700; }
        #sinad-ecosystem .se-board h3 { margin: 0; width: 78%; color: var(--se-blue); font-family: "Satoshi Variable", Arial, sans-serif; font-size: 20px; line-height: 1.1; font-weight: 700; }
        #sinad-ecosystem .se-board p { width: 68%; margin: 7px 0 0; color: var(--se-muted); font-size: 11px; line-height: 1.35; }
        #sinad-ecosystem .se-board-visual { position: absolute; right: 13px; bottom: 14px; width: 72px; height: 72px; border-radius: 50%; background: var(--se-gold); }
        #sinad-ecosystem .se-board-visual::before { content: ""; position: absolute; width: 43px; height: 43px; left: -17px; top: 17px; border-radius: 50%; background: var(--se-blue); opacity: .94; }
        #sinad-ecosystem .se-board-visual::after { content: ""; position: absolute; width: 23px; height: 23px; right: 0; top: -6px; border-radius: 50%; background: var(--se-orange); }
        #sinad-ecosystem .se-ifp-tools { position: absolute; left: 8px; top: 12px; display: grid; gap: 5px; }
        #sinad-ecosystem .se-ifp-tool { width: 32px; height: 32px; border: 1px solid #dce5e9; border-radius: 7px; display: grid; place-items: center; padding: 0; color: var(--se-blue); background: #ffffff; cursor: pointer; box-shadow: 0 3px 8px rgba(0,45,105,.09); }
        #sinad-ecosystem .se-ifp-tool svg { width: 16px; height: 16px; }
        #sinad-ecosystem .se-ifp-tool.is-active { color: #17232c; background: var(--se-gold); border-color: var(--se-gold); }
        #sinad-ecosystem .se-annotation { position: absolute; left: 47%; top: 83px; width: 75px; height: 29px; border: 3px solid var(--se-orange); border-color: var(--se-orange) transparent transparent var(--se-orange); border-radius: 50%; transform: rotate(-8deg); opacity: 0; transition: opacity .18s ease; }
        #sinad-ecosystem .se-ifp-screen.show-annotation .se-annotation { opacity: 1; }
        #sinad-ecosystem .se-touch-dot { position: absolute; left: 51%; top: 70px; width: 13px; height: 13px; border-radius: 50%; border: 2px solid var(--se-gold); box-shadow: 0 0 0 5px rgba(252,181,40,.2); opacity: 0; transition: opacity .18s ease; }
        #sinad-ecosystem .se-ifp-screen.show-touch .se-touch-dot { opacity: 1; }
        #sinad-ecosystem .se-ifp-label { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; color: rgba(255,255,255,.62); font-size: 10px; }
        #sinad-ecosystem .se-ifp-label strong { color: var(--se-gold); font-weight: 700; }
        #sinad-ecosystem .se-ifp-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin: 0 0 20px; }
        #sinad-ecosystem .se-ifp-feature { display: flex; align-items: center; gap: 10px; padding: 11px 13px; border-radius: 11px; background: var(--se-surface); border: 1px solid var(--se-border); }
        #sinad-ecosystem .se-ifp-feature svg { color: var(--se-blue); width: 20px; height: 20px; }
        #sinad-ecosystem .se-ifp-feature strong { display: block; font-family: "Satoshi Variable", Arial, sans-serif; font-size: 12px; font-weight: 700; }
        #sinad-ecosystem .se-ifp-feature span { color: var(--se-muted); font-size: 10px; }
        #sinad-ecosystem .se-source { border-color: #cddde6; color: var(--se-blue); font-weight: 700; }
        #sinad-ecosystem .se-ai { background: linear-gradient(145deg, var(--se-blue-soft), var(--se-surface)); border-color: #c7dce8; }
        #sinad-ecosystem .se-ai-mark { color: var(--se-blue); }
        #sinad-ecosystem .se-ai-mark svg { width: 20px; height: 20px; }
        #sinad-ecosystem .se-page-head .se-eyebrow { color: var(--se-blue); }
        @media (max-width: 800px) {
          #sinad-ecosystem .se-topbar { padding: 0 18px; }
          #sinad-ecosystem .se-nav { justify-content: flex-start; overflow-x: auto; }
          #sinad-ecosystem .se-main { padding: 23px 17px 32px; }
          #sinad-ecosystem .se-hero, #sinad-ecosystem .se-layout { grid-template-columns: 1fr; }
          #sinad-ecosystem .se-partners { grid-template-columns: repeat(2,1fr); }
          #sinad-ecosystem .se-welcome { grid-template-columns: 1fr; }
          #sinad-ecosystem .se-ifp-strip { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          #sinad-ecosystem .se-welcome { padding: 21px; }
          #sinad-ecosystem .se-course { grid-template-columns: 38px 1fr; }
          #sinad-ecosystem .se-course-state { grid-column: 2; }
          #sinad-ecosystem .se-values, #sinad-ecosystem .se-catalog, #sinad-ecosystem .se-app-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="se-shell" aria-label="Mockup portal Sinad">
        <div className="se-video-wall" aria-hidden="true">
          <video className="se-site-video" autoPlay muted loop playsInline><source src="https://uyqgionbubycyfdmweai.supabase.co/storage/v1/object/sign/sinautech/sinad-ifp-background.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82YWNiNjAwMS1hOGJjLTQxYzktYmVlZS1hMTlhODljYjI2NjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaW5hdXRlY2gvc2luYWQtaWZwLWJhY2tncm91bmQubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NjYwNTEzNiwiZXhwIjoxODE4MTQxMTM2fQ.QNnAvU1Kk12KoB0bVJ_2Fy-ShzVyJCV35l5DL6cbt9I" type="video/mp4" /></video>
        </div>
        <div className="se-site-overlay" aria-hidden="true"></div>
        <header className="se-topbar">
          <nav className="se-nav" aria-label="Navigasi utama">
            <button type="button" className={activePage === 'home' ? 'is-current' : ''} onClick={() => setActivePage('home')}>Beranda</button>
            <button type="button" className={activePage === 'materials' ? 'is-current' : ''} onClick={() => setActivePage('materials')}>Materi</button>
            <button type="button" className={activePage === 'apps' ? 'is-current' : ''} onClick={() => setActivePage('apps')}>Aplikasi AI</button>
          </nav>
        </header>

        <main className="se-main">
          {/* Home Page */}
          <section className={`se-page ${activePage === 'home' ? 'is-visible' : ''}`} data-view="home">
            <div className="se-hero">
              <div className="se-welcome">
                <div className="se-welcome-copy">
                  <p className="se-eyebrow">Sinad × Interactive Flat Panel</p>
                  <h1>Hidupkan pembelajaran di setiap sentuhan</h1>
                  <p className="se-lead">Pelajari penggunaan IFP, rancang aktivitas kelas interaktif, dan manfaatkan AI dalam satu ekosistem pembelajaran guru.</p>
                  <div className="se-actions">
                    <button type="button" className="se-primary" onClick={() => setActivePage('materials')}>Mulai belajar IFP <ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
                    <button type="button" className="se-secondary" onClick={() => setActivePage('apps')}>Coba Asisten AI</button>
                  </div>
                </div>
                <div className="se-ifp-wrap" aria-label="Simulasi tampilan Interactive Flat Panel">
                  <div className={`se-ifp-screen ${activeTool === 'pen' ? 'show-annotation' : ''} ${activeTool === 'touch' ? 'show-touch' : ''}`}>
                    <div className="se-ifp-top"><span>SinaD Classroom</span><span className="se-live">● Live class</span></div>
                    <div className="se-board">
                      <div className="se-ifp-tools" aria-label="Alat interaktif IFP">
                        <button type="button" className={`se-ifp-tool ${activeTool === 'pen' ? 'is-active' : ''}`} onClick={() => setActiveTool('pen')} aria-label="Pena"><PenTool aria-hidden="true" /></button>
                        <button type="button" className={`se-ifp-tool ${activeTool === 'touch' ? 'is-active' : ''}`} onClick={() => setActiveTool('touch')} aria-label="Mode sentuh"><Hand aria-hidden="true" /></button>
                        <button type="button" className={`se-ifp-tool ${activeTool === 'share' ? 'is-active' : ''}`} onClick={() => setActiveTool('share')} aria-label="Berbagi layar"><ScreenShare aria-hidden="true" /></button>
                      </div>
                      <p className="se-board-kicker">Kelas Interaktif</p>
                      <h3>Eksplorasi Energi Terbarukan</h3>
                      <p>Sentuh, anotasi, dan diskusikan materi bersama siswa secara langsung.</p>
                      <span className="se-annotation" aria-hidden="true"></span>
                      <span className="se-touch-dot" aria-hidden="true"></span>
                      <span className="se-board-visual" aria-hidden="true"></span>
                    </div>
                  </div>
                  <div className="se-ifp-label"><span>4K UHD · 20 touch points</span><strong>IFP Ready</strong></div>
                </div>
              </div>
            </div>

            <div className="se-layout">
              <div className="se-stack">
                <section className="se-panel">
                  <div className="se-panel-head">
                    <div>
                      <h2>Materi SinaD</h2>
                      <p className="se-caption">Pilih rangkaian materi pembelajaran yang tersedia</p>
                    </div>
                    <button type="button" className="se-text-action" onClick={() => setActivePage('materials')}>Lihat semua</button>
                  </div>
                  <div className="se-course-list">
                    <button type="button" className="se-course" onClick={() => window.open('/SinaD_materi/sinadsj43.html', '_blank')}>
                      <span className="se-icon"><MonitorUp aria-hidden="true" /></span>
                      <span><strong>SinaD 7</strong><span className="se-course-info"><span className="se-source">SinaD</span><span>Materi pembelajaran terbaru</span></span></span>
                      <span className="se-course-state">Buka →</span>
                    </button>
                    <button type="button" className="se-course" onClick={() => window.open('/SinaD_materi/SinaD L 1 - 2.html', '_blank')}>
                      <span className="se-icon"><BookOpen aria-hidden="true" /></span>
                      <span><strong>SinaD 1 &amp; 2</strong><span className="se-course-info"><span className="se-source">SinaD</span><span>Materi pembelajaran dasar</span></span></span>
                      <span className="se-course-state">Buka →</span>
                    </button>
                    <button type="button" className="se-course" onClick={() => window.open('https://sinau-digital-level-3-4.ai.studio/', '_blank')}>
                      <span className="se-icon"><Presentation aria-hidden="true" /></span>
                      <span><strong>SinaD 3 &amp; 4</strong><span className="se-course-info"><span className="se-source">SinaD</span><span>Materi pembelajaran lanjutan</span></span></span>
                      <span className="se-course-state">Buka →</span>
                    </button>
                  </div>
                </section>
                <section className="se-panel">
                  <div className="se-panel-head"><div><h2>Informasi IFP</h2><p className="se-caption">Panduan dan spesifikasi Interactive Flat Panel</p></div></div>
                  <div className="se-partners">
                    <button type="button" className="se-partner" onClick={() => window.open('/SinaD_IFP/ifp-panduan.html', '_blank')}><strong>Panduan IFP</strong><span>Buku panduan digital</span></button>
                    <button type="button" className="se-partner" onClick={() => window.open('/SinaD_IFP/ifp-spesifikasi.html', '_blank')}><strong>Spesifikasi IFP</strong><span>Informasi teknis</span></button>
                  </div>
                </section>
              </div>
              <aside className="se-stack">
                <section className="se-panel se-ai">
                  <div className="se-ai-mark"><Sparkles aria-hidden="true" /></div>
                  <h2>Asisten Guru AI</h2>
                  <p>Buat rancangan pembelajaran dan ide aktivitas kelas lebih cepat melalui AIS.</p>
                  <button type="button" className="se-primary se-ai-button" onClick={() => window.open('https://chatgpt.com/g/g-68a6bdafe47881918b71fa838bba1870-how-who-digital-teacher-berkarya-berkembang', '_blank')}>Buka aplikasi <ExternalLink className="w-4 h-4" aria-hidden="true" /></button>
                </section>
                <section className="se-panel">
                  <div className="se-panel-head"><div><h2>Exercise</h2></div></div>
                  <div className="se-event-list">
                    <div className="se-event" style={{ cursor: 'pointer' }} onClick={() => window.open('https://papan-penilaian-sinad.ai.studio', '_blank')} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                      <div className="se-date" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
                        <ClipboardCheck size={18} aria-hidden="true" />
                      </div>
                      <div style={{ alignSelf: 'center' }}><strong>Papan Penilaian</strong><span>SinaD AI Studio</span></div>
                    </div>
                    <div className="se-event" style={{ cursor: 'pointer' }} onClick={() => window.open('/SinaD_exercise/SinaD Ceklis.html', '_blank')} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                      <div className="se-date" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
                        <FileQuestion size={18} aria-hidden="true" />
                      </div>
                      <div style={{ alignSelf: 'center' }}><strong>Ceklis Guru Digital</strong><span>Latihan mandiri</span></div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </section>

          {/* Materials Page */}
          <section className={`se-page ${activePage === 'materials' ? 'is-visible' : ''}`} data-view="materials">
            <div className="se-page-head">
              <p className="se-eyebrow">Katalog Sinad</p>
              <h1>Jelajahi materi pembelajaran</h1>
              <p className="se-lead">Materi dari Sinad dan berbagai program mitra, tersusun dalam satu katalog.</p>
            </div>
            <div className="se-catalog">
              <article className="se-catalog-item"><div className="se-thumb"><MonitorUp aria-hidden="true" /></div><div className="se-catalog-body"><span className="se-source">SinaD</span><strong>SinaD 7</strong><p>Materi pembelajaran terbaru.</p><button type="button" onClick={() => window.open('/SinaD_materi/sinadsj43.html', '_blank')}>Mulai belajar →</button></div></article>
              <article className="se-catalog-item"><div className="se-thumb"><BookOpen aria-hidden="true" /></div><div className="se-catalog-body"><span className="se-source">SinaD</span><strong>SinaD 1 &amp; 2</strong><p>Materi pembelajaran dasar.</p><button type="button" onClick={() => window.open('/SinaD_materi/SinaD L 1 - 2.html', '_blank')}>Mulai belajar →</button></div></article>
              <article className="se-catalog-item"><div className="se-thumb"><Presentation aria-hidden="true" /></div><div className="se-catalog-body"><span className="se-source">SinaD</span><strong>SinaD 3 &amp; 4</strong><p>Materi pembelajaran lanjutan.</p><button type="button" onClick={() => window.open('https://sinau-digital-level-3-4.ai.studio/', '_blank')}>Mulai belajar →</button></div></article>
              <article className="se-catalog-item" style={{ opacity: 0.6 }}><div className="se-thumb"><Compass aria-hidden="true" /></div><div className="se-catalog-body"><span className="se-source">SinaD</span><strong>SinaD 5 &amp; 6</strong><p>Materi pembelajaran tambahan.</p><button type="button" disabled style={{ cursor: 'not-allowed', color: '#999', borderColor: '#ccc' }}>🔒 Terkunci</button></div></article>
              <article className="se-catalog-item" style={{ opacity: 0.6 }}><div className="se-thumb"><ClipboardCheck aria-hidden="true" /></div><div className="se-catalog-body"><span className="se-source">SinaD</span><strong>SinaD 8</strong><p>Uji Kompetensi dan Evaluasi.</p><button type="button" disabled style={{ cursor: 'not-allowed', color: '#999', borderColor: '#ccc' }}>🔒 Terkunci</button></div></article>
            </div>
          </section>

          {/* Apps Page */}
          <section className={`se-page ${activePage === 'apps' ? 'is-visible' : ''}`} data-view="apps">
            <div className="se-page-head">
              <p className="se-eyebrow">Sinad AI Hub</p>
              <h1>Aplikasi AI untuk mendukung guru</h1>
              <p className="se-lead">Akses alat bantu praktis yang terhubung ke ekosistem Sinad.</p>
            </div>
            <div className="se-app-grid">
              <article className="se-app">
                <div className="se-ai-mark"><Sparkles aria-hidden="true" /></div>
                <strong>Asisten Guru AI</strong>
                <p>Buat rancangan pembelajaran dan ide aktivitas kelas lebih cepat melalui AIS.</p>
                <button type="button" className="se-primary se-launch" onClick={() => window.open('https://chatgpt.com/g/g-68a6bdafe47881918b71fa838bba1870-how-who-digital-teacher-berkarya-berkembang', '_blank')}>Buka aplikasi <ExternalLink className="w-4 h-4 ml-1" aria-hidden="true" /></button>
              </article>
              <article className="se-app">
                <div className="se-ai-mark"><FileQuestion aria-hidden="true" /></div>
                <strong>SinaD Interactive Game</strong>
                <p>Game edukasi interaktif untuk simulasi pembelajaran yang menyenangkan.</p>
                <button type="button" className="se-primary se-launch" onClick={() => window.open('/SinaD_aplikasi/SinaD Interactive Game.html', '_blank')}>Coba aplikasi <ExternalLink className="w-4 h-4 ml-1" aria-hidden="true" /></button>
              </article>
            </div>
            <div className={`se-toast ${showToast ? 'is-shown' : ''}`} role="status" ref={toastRef}>Simulasi: aplikasi AIS akan dibuka melalui tautan terintegrasi dari Sinad.</div>
          </section>
        </main>
      </section>
    </div>
  );
}
