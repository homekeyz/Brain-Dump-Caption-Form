import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Globe, 
  Sliders, 
  Send, 
  Info, 
  Eye, 
  BookOpen, 
  PenSquare, 
  User, 
  ExternalLink, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  Share2 
} from 'lucide-react';
import { 
  StructuredCaptionResult, 
  PlatformConfig,
  DraftItem
} from './types';

// Supported Tones with helpful metadata
const TONES = [
  { value: 'witty', label: '🧠 Witty', description: 'Clever, smart wordplay, slightly punchy or provocative' },
  { value: 'informative', label: '📚 Informative', description: 'Educational, detailed, clear facts, highly authoritative' },
  { value: 'urgent', label: '🚨 Urgent', description: 'High priority, time-sensitive, clear FOMO or necessity' },
  { value: 'inspiring', label: '✨ Inspirational', description: 'Storytelling-anchored, motivational, and aspirational' },
  { value: 'casual', label: '☕ Casual', description: 'Friendly, relatable, down-to-earth, and written with simple vocabulary' }
];

// Target platforms list
const PLATFORMS: PlatformConfig[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', charLimit: 3000, hashtagDensity: 'moderate' },
  { id: 'twitter', name: 'X / Twitter', icon: 'twitter', charLimit: 280, hashtagDensity: 'none' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', charLimit: 2200, hashtagDensity: 'high' },
  { id: 'threads', name: 'Threads', icon: 'threads', charLimit: 500, hashtagDensity: 'low' },
  { id: 'general', name: 'Universal', icon: 'general', charLimit: 2000, hashtagDensity: 'low' }
];

// Pre-defined templates of chaotic thoughts to help users immediately test
const PRESETS = [
  {
    title: "🚀 Caption-Builder Project",
    category: "Product Launch",
    text: "omg finally built my copywriting formatter app after a huge coding session over the weekend. it takes messy brain streams and turns them into clean hook value cta. i built it using react, typescript and gemini 3.5. it has copy helpers, a tone slider, mock posts. wanted to make writing social posts easy since i have super blank page syndrome all the time. please register and try it out!",
    toneIndex: 0, // Witty
    platform: "linkedin",
    cta: "Sign up and try it out for free in bio"
  },
  {
    title: "💡 Honest Startup Rant",
    category: "Thought Leadership",
    text: "so sick of perfect linkedin posts where everyone says they work 100 hours and never fail. building a business is just a mess. we had some database connection issues yesterday which ruined staging and we had a demo to a top client. but we came clean, explained the code bug, fixed it under 15 mins. the client actually praised our urgency and honesty. transparency is the best cheat code.",
    toneIndex: 3, // Inspirational
    platform: "threads",
    cta: "Comment below with your thoughts"
  },
  {
    title: "📈 Dynamic Growth Engine",
    category: "Marketing Insight",
    text: "heres an insane marketing truth we discovered. we literally paused all cold outreach emails and directed 100% of our capacity towards drafting comprehensive tutorial writeups and technical guides for developers. our high-quality organic trials shot up by 250% in standard inbound traffic. nobody wants canned sales. they want to learn from practitioners. let me know if you want the pdf report, just comment below.",
    toneIndex: 1, // Informative
    platform: "linkedin",
    cta: "Reply with 'INBOUND' to receive my step-by-step PDF"
  }
];

const CTA_PRESETS = [
  "Click the link in my bio to read",
  "Comment below with your thoughts",
  "Reply with 'GROWTH' to receive the PDF guide",
  "Join our free early access community list",
  "Save this post for your next project session",
  "Register for the upcoming beta webinar"
];

export default function App() {
  // Input form state
  const [brainDump, setBrainDump] = useState('');
  const [toneIndex, setToneIndex] = useState(1); // Default Confident
  const [selectedPlatform, setSelectedPlatform] = useState<string>('linkedin');
  const [customCta, setCustomCta] = useState('');
  
  // Custom Profile state for preview
  const [profileName, setProfileName] = useState('My Digital Avatar');
  const [profileTitle, setProfileTitle] = useState('Founder & Tech Creator');
  const [avatarColor, setAvatarColor] = useState('#FF3E00'); // Default Orange-Red matching Bold Typography theme

  // Execution states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StructuredCaptionResult | null>(null);

  // Active Draft state / swapping tracking
  const [activeCaptionText, setActiveCaptionText] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  // Load drafts on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hvc_drafts');
      if (stored) {
        setDrafts(JSON.parse(stored));
      }
    } catch(e) {
      console.error("Failed to load local drafts", e);
    }
  }, []);

  // Save drafts when changing
  const saveToLocal = (newDrafts: DraftItem[]) => {
    try {
      localStorage.setItem('hvc_drafts', JSON.stringify(newDrafts));
      setDrafts(newDrafts);
    } catch(e) {
      console.error("Failed to save drafts to local storage", e);
    }
  };

  // Dynamic loading message progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setBrainDump(preset.text);
    setToneIndex(preset.toneIndex);
    setSelectedPlatform(preset.platform);
    setCustomCta(preset.cta);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brainDump.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brainDump,
          tone: TONES[toneIndex].label + " - " + TONES[toneIndex].description,
          platform: selectedPlatform,
          ctaText: customCta || "A welcoming invitation to engage"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data: StructuredCaptionResult = await response.json();
      setResult(data);
      // Initialize active output text that they can live-modify or copy
      setActiveCaptionText(data.caption.fullFormattedText);
    } catch (err: any) {
      console.error("Fetch generation error:", err);
      setError(err.message || "Something went wrong. Please confirm your API key setup in the settings.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSaveDraft = () => {
    if (!result) return;
    const newItem: DraftItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString(),
      brainDump: brainDump,
      platform: selectedPlatform,
      tone: TONES[toneIndex].label,
      ctaText: customCta,
      result: {
        ...result,
        caption: {
          ...result.caption,
          fullFormattedText: activeCaptionText // save dynamic modifications
        }
      }
    };
    const updated = [newItem, ...drafts];
    saveToLocal(updated);
  };

  const loadSavedDraft = (draft: DraftItem) => {
    setBrainDump(draft.brainDump);
    // Find tone index
    const index = TONES.findIndex(t => t.label === draft.tone || draft.tone.includes(t.label));
    if (index !== -1) setToneIndex(index);
    setSelectedPlatform(draft.platform);
    setCustomCta(draft.ctaText);
    setResult(draft.result);
    setActiveCaptionText(draft.result.caption.fullFormattedText);
    setError(null);
  };

  const deleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = drafts.filter(d => d.id !== id);
    saveToLocal(filtered);
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const copySpreadsheetTSV = () => {
    if (!result) return;
    const headers = ["Platform", "Tone", "Hook", "Value", "CTA", "Suggested Hashtags", "Full Caption"];
    
    // Excel/Google Sheets standard escaping so multi-line text resides beautifully in a single cell
    const escapeForCell = (text: string) => {
      const formatted = text.replace(/"/g, '""');
      return `"${formatted}"`;
    };

    const rowData = [
      selectedPlatform.toUpperCase(),
      TONES[toneIndex].label,
      escapeForCell(result.caption.hook),
      escapeForCell(result.caption.value),
      escapeForCell(result.caption.cta),
      escapeForCell((result.suggestedHashtags || []).join(', ')),
      escapeForCell(activeCaptionText)
    ];

    const tsvContent = `${headers.join("\t")}\n${rowData.join("\t")}`;
    copyToClipboard(tsvContent, 'spreadsheet_form');
  };

  // Swaps the active preview hook with one of the alternatives!
  const swapHookInCaption = (newHook: string) => {
    if (!result) return;
    
    // Split combined string or re-compile based on the result structure.
    // Replace the hook content with the new choice.
    const cleanNewHook = newHook.trim();
    
    // Attempt dynamic update on formatted text
    // Replace the original hook text with new hook text
    const oldHook = result.caption.hook.trim();
    
    let updatedFormattedText = activeCaptionText;
    if (updatedFormattedText.startsWith(oldHook)) {
      updatedFormattedText = updatedFormattedText.replace(oldHook, cleanNewHook);
    } else {
      // Fallback: join with value and cta again
      updatedFormattedText = `${cleanNewHook}\n\n${result.caption.value}\n\n${result.caption.cta}`;
    }

    setResult({
      ...result,
      caption: {
        ...result.caption,
        hook: cleanNewHook,
        fullFormattedText: updatedFormattedText
      }
    });
    setActiveCaptionText(updatedFormattedText);
  };

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-[#FF3E00]" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-[#FF3E00]" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-[#FF3E00]" />;
      default:
        return <Globe className="w-4 h-4 text-[#FF3E00]" />;
    }
  };

  const loadingMessages = [
    "Distilling chaotic notes and ideas...",
    "Engineering high-converting scroll-stopping hooks...",
    "Formulating spacing, paragraphs, and lists for readability...",
    "Generating alternative psychological angles..."
  ];

  const currentPlatformLimit = PLATFORMS.find(p => p.id === selectedPlatform)?.charLimit || 2200;
  const isOverLimit = activeCaptionText.length > currentPlatformLimit;

  return (
    <div className="min-h-screen bg-black text-[#F0F0F0] flex flex-col font-sans overflow-x-hidden border-t-8 border-[#FF3E00] selection:bg-[#FF3E00] selection:text-black">
      
      {/* Elegant Bold Typography header */}
      <header className="border-b-2 border-[#222121] bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tighter leading-none italic uppercase">
              CAPTION.CRAFT<span className="text-[#FF3E00]">_</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-black tracking-[0.2em] uppercase opacity-75 hidden sm:flex">
            <div>V2.5.0_ROBUST</div>
            <div className="text-[#FF3E00]">// ZERO BLANK PAGES</div>
          </div>
          <div className="flex sm:hidden">
            <span className="text-[10px] font-black text-[#FF3E00] tracking-widest uppercase bg-[#151515] px-2 py-1 border border-[#333]">HVC_FRAME</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8">
        
        {/* Intro Tagline Card */}
        <div className="bg-[#111111] border-2 border-[#222] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3E00]">01. Overview</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight">
              Destroy Blank Page Syndrome
            </h1>
            <p className="text-sm opacity-80 max-w-2xl font-serif italic">
              "Input a chaotic brain-dump paragraph, adjust the target platform tone, and render a structured, scroll-stopping copy with validated value sections and custom actionable directives."
            </p>
          </div>
          <div className="flex gap-4 z-10">
            <a 
              href="#how-it-works" 
              className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#252525] text-white border-2 border-[#333] text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              Understand Framework
            </a>
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-zinc-900/10 rounded-full border-2 border-dashed border-[#FF3E00]/10 pointer-events-none"></div>
        </div>

        {/* Helper Presets Bar */}
        <section className="mb-0" id="presets-panel">
          <div className="bg-[#111] border-2 border-[#222] p-6 relative">
            <p className="text-xs font-black text-[#FF3E00] uppercase tracking-wider mb-4 flex items-center gap-2">
              <PenSquare className="w-4 h-4 text-[#FF3E00]" />
              Struggling with what to write? Click a raw draft dump pattern:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  id={`preset-btn-${index}`}
                  onClick={() => loadPreset(preset)}
                  className="text-left bg-[#151515] border border-[#2d2d2d] hover:border-[#FF3E00] p-4 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black tracking-tight text-white group-hover:text-[#FF3E00] uppercase">{preset.title}</span>
                    <span className="text-[9px] bg-[#222] border border-[#333] tracking-wider text-slate-300 font-mono py-0.5 px-2 font-medium uppercase">{preset.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 italic font-serif">
                    "{preset.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Draft inputs column */}
          <section className="lg:col-span-5 space-y-8">
            <div className="bg-[#111111] border-2 border-[#222] p-6 relative shadow-[4px_4px_0px_#000]">
              
              <div className="mb-6 border-b border-[#222] pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3E00]">02. Configurator</span>
                <h2 className="text-2xl font-extrabold tracking-tight uppercase flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#FF3E00]" />
                  Configure Post Ingredients
                </h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6" id="formatter-form">
                
                {/* 1. Brand Profile customizing (Makes preview extra rich) */}
                <div className="bg-[#151515] border border-[#2c2c2c] p-4 relative">
                  <span className="text-xs font-black tracking-wider uppercase text-[#FF3E00] mb-3 block border-b border-[#222] pb-1">Set Mock Feed Profile</span>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label htmlFor="p_name" className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Author Name</label>
                      <input
                        id="p_name"
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-xs bg-[#1F1F1F] text-white border border-[#333] p-2 focus:outline-none focus:border-[#FF3E00] font-sans font-semibold"
                      />
                    </div>
                    <div>
                      <label htmlFor="p_title" className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Headline/Title</label>
                      <input
                        id="p_title"
                        type="text"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        className="w-full text-xs bg-[#1F1F1F] text-white border border-[#333] p-2 focus:outline-none focus:border-[#FF3E00] font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Avatar Tint Accent:</span>
                    <div className="flex gap-1.5 bg-[#1F1F1F] p-1.5 border border-[#2d2d2d]">
                      {['#FF3E00', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setAvatarColor(col)}
                          className={`w-3.5 h-3.5 border transition-transform ${avatarColor === col ? 'scale-125 border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Textarea Chaotic Brain Dump */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="brain_dump_input" className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <span>1. The Brain Dump Pool</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-[#222] px-1.5 py-0.5 rounded-none font-bold">({brainDump.length} CHARS)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setBrainDump('')}
                      className="text-[9px] text-slate-300 hover:text-[#FF3E00] flex items-center gap-1 font-black uppercase bg-[#1c1c1c] border border-[#2c2c2c] py-1 px-2.5 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-[#FF3E00]" /> Reset Area
                    </button>
                  </div>
                  <textarea
                    id="brain_dump_input"
                    className="w-full min-h-[150px] bg-[#151515] border border-[#2d2d2d] focus:border-[#FF3E00] p-4 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-sans leading-relaxed"
                    placeholder="E.g. Paste your messy notes without filtering. 'i solved that really hard database configuration bug but i wasted almost half a day doing list lookups. it turned out to be an accidental recursive function in user verification. developers should really use local caches. view the guide details here link...'"
                    value={brainDump}
                    onChange={(e) => setBrainDump(e.target.value)}
                    required
                  />
                </div>

                {/* 3. Social Platform Tabs */}
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white block mb-2">2. Desired Format Feed Layout</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {PLATFORMS.map((plat) => {
                      const isActive = selectedPlatform === plat.id;
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          id={`platform-tab-${plat.id}`}
                          onClick={() => setSelectedPlatform(plat.id)}
                          className={`flex flex-col items-center justify-center py-2.5 px-1 bg-[#151515] text-center border transition-all cursor-pointer ${
                            isActive 
                              ? 'border-[#FF3E00] bg-[#FF3E00]/10 text-[#FF3E00] font-black' 
                              : 'border-[#2d2d2d] hover:border-[#3d3d3d] text-slate-400 hover:text-white'
                          }`}
                        >
                          {getPlatformIcon(plat.id)}
                          <span className="text-[9px] font-black uppercase mt-1.5 tracking-tight">{plat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Tone Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white block">
                    3. Caption Tone Accent (Select a perspective vibe)
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {TONES.map((t, idx) => {
                      const isSelected = toneIndex === idx;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          id={`tone-option-${t.value}`}
                          onClick={() => setToneIndex(idx)}
                          className={`w-full text-left p-3 border transition-all flex items-start gap-3.5 cursor-pointer active:scale-[0.99] ${
                            isSelected
                              ? 'border-[#FF3E00] bg-[#FF3E00]/10 text-white font-bold'
                              : 'border-[#2d2d2d] hover:border-[#444] bg-[#151515] text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 text-base">{t.label.split(' ')[0]}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-black uppercase tracking-wide block ${isSelected ? 'text-[#FF3E00]' : 'text-slate-200'}`}>
                                {t.label.split(' ').slice(1).join(' ')}
                              </span>
                              {isSelected && (
                                <span className="text-[8px] bg-[#FF3E00] text-black font-black uppercase px-2 py-0.5 tracking-wider">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-serif italic mt-0.5">
                              {t.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Custom Call to Action Objective */}
                <div>
                  <label htmlFor="custom_cta" className="text-xs font-black uppercase tracking-wider text-white block mb-2">
                    4. Post CTA Target (Desired conversion call)
                  </label>
                  <input
                    id="custom_cta"
                    type="text"
                    value={customCta}
                    onChange={(e) => setCustomCta(e.target.value)}
                    placeholder="e.g. Comment 'SEND GUIDE' below, Register at link in bio"
                    className="w-full text-xs bg-[#151515] border border-[#2d2d2d] placeholder-slate-500 p-3 text-white focus:outline-none focus:border-[#FF3E00] font-sans"
                  />
                  
                  {/* Quick CTAs chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {CTA_PRESETS.slice(0, 4).map((ctaStr, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setCustomCta(ctaStr)}
                        className="text-[9px] bg-[#1a1a1a] border border-[#2c2c2c] hover:border-[#FF3E00] text-slate-300 hover:text-[#FF3E00] font-black uppercase py-1 px-2.5 transition-colors cursor-pointer"
                      >
                        + {ctaStr.split(' ')[0]}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Generate action button */}
                <button
                  type="submit"
                  id="generate-button"
                  disabled={loading || !brainDump.trim()}
                  className="w-full bg-[#FF3E00] hover:bg-orange-600 disabled:bg-[#222] disabled:text-[#444] disabled:cursor-not-allowed disabled:shadow-none text-black font-black text-sm py-4 uppercase tracking-wider shadow-[6px_6px_0px_rgba(255,62,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-none animate-spin"></div>
                      <span className="font-extrabold uppercase tracking-widest">Converting Stream...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Refine Chaos & Restructure</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Error view */}
            {error && (
              <div className="bg-red-950 border-2 border-red-800 p-4 text-xs text-red-200">
                <p className="font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400 mb-1">
                  <span>🚨 Prompt Formatting Failed</span>
                </p>
                <p className="leading-relaxed font-mono">{error}</p>
              </div>
            )}

            {/* Bottom Saved Drafts Drawer */}
            <div className="bg-[#111111] border-2 border-[#222] p-6 relative">
              <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3E00] flex items-center gap-1.5">
                    <FolderHeartIcon />
                    Saved Caption Drawer
                  </h3>
                  <p className="text-[10px] text-slate-400">Local draft repository ({drafts.length} total)</p>
                </div>
                {drafts.length > 0 && (
                  <button
                    onClick={() => { if(confirm('Clear all local saved drafts?')) saveToLocal([]); }}
                    className="text-[9px] text-[#FF3E00] hover:text-orange-400 flex items-center gap-1 font-black uppercase bg-[#1a1a1a] border border-[#2c2c2c] py-1 px-2.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Reset All
                  </button>
                )}
              </div>

              {drafts.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-[#2d2d2d] bg-[#151515]/30">
                  <BookOpen className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your saved drawer is dry.</p>
                  <p className="text-[10px] text-slate-500 font-serif italic mt-1">Generate captions then save to persist on this browser session.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => loadSavedDraft(draft)}
                      className="group/draft bg-[#151515] hover:bg-[#1a1a1a] hover:border-[#FF3E00] border-2 border-[#222] p-3.5 transition-all cursor-pointer flex items-start gap-3.5 text-left active:scale-[0.99]"
                    >
                      <div className="mt-0.5 bg-[#1F1F1F] p-1.5 border border-[#333] shrink-0">
                        {getPlatformIcon(draft.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-white hover:text-[#FF3E00] uppercase tracking-wide truncate max-w-[130px]">
                            {draft.result.caption.hook}
                          </span>
                          <span className="text-[9px] bg-[#222] border border-[#2d2d2d] text-[#FF3E00] py-0.5 px-2 font-mono font-bold shrink-0">
                            {draft.tone.split(' ')[1] || draft.tone}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic font-serif mb-1.5">
                          "{draft.brainDump}"
                        </p>
                        <div className="flex items-center justify-between border-t border-[#1c1c1c] pt-2 mt-2">
                          <span className="text-[9px] text-[#FF3E00] font-mono font-black uppercase">
                            {draft.timestamp.split(',')[1]?.trim() || draft.timestamp}
                          </span>
                          <button
                            onClick={(e) => deleteDraft(draft.id, e)}
                            className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider opacity-0 group-hover/draft:opacity-100 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          {/* RIGHT: Results and analytical previews */}
          <section className="lg:col-span-7 space-y-8">
            
            {/* Loading placeholder skeleton */}
            {loading && (
              <div className="bg-[#111111] border-2 border-[#FF3E00] p-8 text-center min-h-[500px] flex flex-col justify-center items-center space-y-6 shadow-[8px_8px_0px_rgba(255,62,0,0.2)]">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#222] border-t-[#FF3E00] rounded-none animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-[#FF3E00] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="max-w-md space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3E00] bg-[#1a1a1a] px-3 py-1 border border-[#2d2d2d]">PROCESSED BY AI ENGINE</span>
                  <h3 className="text-xl font-extrabold text-white tracking-tight uppercase leading-none">Structuring chaotic thoughts...</h3>
                  
                  {/* Progressive indicator message */}
                  <div className="h-8 overflow-hidden flex justify-center items-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingStep}
                        initial={{ y: 20, opacity: 0 }}
                        indigo={{ y: 0, opacity: 1 }}
                        className="text-xs text-[#FF3E00] font-black uppercase tracking-wider"
                      >
                        {loadingMessages[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-xs text-slate-400 font-serif leading-relaxed italic max-w-sm mx-auto">
                    "Filtering jargon, positioning structural whitespaces, and aligning hook mechanisms to lock in engagement ratios."
                  </p>
                </div>
              </div>
            )}

            {/* Empty view */}
            {!loading && !result && (
              <div className="bg-[#111111] border-2 border-[#222] p-12 text-center min-h-[500px] flex flex-col justify-center items-center shadow-[4px_4px_0px_#000]">
                <div className="w-16 h-16 bg-[#151515] text-[#FF3E00] rounded-none flex items-center justify-center border-2 border-[#222] mb-4">
                  <Eye className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3E00] bg-[#1a1a1a] px-3 py-1 border border-[#222]">READY FOR DUMP</span>
                  <h3 className="text-2xl font-black tracking-tight uppercase">Structure Studio Capsule</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif italic">
                    "Submit your raw notes, configure the desired social platform delivery format, and watch as Gemini splits it into perfect scroll-stopping pieces ready for copy-paste action."
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => loadPreset(PRESETS[0])}
                      className="text-xs bg-[#FF3E00] hover:bg-orange-600 text-black font-black uppercase tracking-wider py-3 px-5 transition-colors cursor-pointer"
                    >
                      Use Demo Caption Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrainDump("we scaled organic page views from nothing to eighty-thousand per week simply by simplifying our layout structure and ensuring there are zero popups or login paywalls. honestly users are highly smart and they appreciate speed above all else.");
                        setToneIndex(1); // Confident
                        setSelectedPlatform('linkedin');
                        setCustomCta("Check our structural architecture guide");
                      }}
                      className="text-xs bg-[#1A1A1A] hover:bg-[#252525] hover:border-[#444] text-white font-bold py-3 px-5 border-2 border-[#333] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Autofill Founder Insight
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active structured preview */}
            {result && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-8"
              >
                
                {/* 1. Header Toolbar (Copy / Save actions) */}
                <div className="bg-[#111] border-2 border-[#FF3E00] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_#000]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-white block">Conversion Structure Built!</span>
                      <span className="text-[10px] text-slate-400 font-mono">MODEL INSTANCE: GEMINI-3.5-FLASH</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => copyToClipboard(activeCaptionText, 'full_form')}
                      id="copy-full-text-btn"
                      className="flex-1 sm:flex-none text-xs bg-[#FF3E00] hover:bg-orange-600 text-black font-black py-2.5 px-4 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copiedSection === 'full_form' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied OK!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Caption</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => copySpreadsheetTSV()}
                      id="copy-spreadsheet-btn"
                      className="flex-1 sm:flex-none text-xs bg-white hover:bg-slate-200 text-black font-black py-2.5 px-4 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border-2 border-white"
                      title="Copy all structured pieces to clipboard to easily paste in spreadsheet columns"
                    >
                      {copiedSection === 'spreadsheet_form' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pasting Ready!</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheetIcon className="w-3.5 h-3.5" />
                          <span>Spreadsheet Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={triggerSaveDraft}
                      id="save-draft-btn"
                      className="flex-1 sm:flex-none text-xs bg-[#1A1A1A] hover:bg-[#222] border-2 border-[#333] hover:border-[#FF3E00] text-slate-200 font-black py-2 px-4 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </button>
                  </div>
                </div>

                {/* 2. Platform Feed Mockup Preview Card */}
                <div className="bg-[#111111] border-2 border-[#222] shadow-[6px_6px_0px_#000] overflow-hidden">
                  
                  {/* Simulated platform header */}
                  <div className="bg-[#161616] px-6 py-4 border-b-2 border-[#222] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#FF3E00] inline-block animate-pulse"></span>
                      <span className="text-xs font-black text-white tracking-widest uppercase">
                        {PLATFORMS.find(p => p.id === selectedPlatform)?.name || 'Universal'} Mock Feed Sandbox
                      </span>
                    </div>
                    <span className="text-[9px] bg-[#222] text-slate-400 font-mono px-2 py-0.5 border border-[#333] uppercase font-bold">WYSIWYG</span>
                  </div>

                  {/* Interactive Post Body */}
                  <div className="p-6 space-y-4 bg-[#111]">
                    
                    {/* Simulated user info header inside mock feed */}
                    <div className="flex items-start justify-between pb-3 border-b border-[#1C1C1C]">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-none flex items-center justify-center text-black font-black text-xs shadow-inner uppercase shrink-0 border-2 border-white"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {profileName.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate leading-tight">{profileName}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{profileTitle}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-[#FF3E00] font-mono font-semibold uppercase tracking-wider">Active Stream •</span>
                            <Globe className="w-2.5 h-2.5 text-slate-500" />
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono bg-[#1A1A1A] border border-[#2d2d2d] px-2 py-0.5 uppercase tracking-tight shrink-0">
                        {selectedPlatform === 'twitter' ? 'X CAPTION' : 'PREVIEW FEED'}
                      </div>
                    </div>

                    {/* Formatted Text Box with dynamic modification */}
                    <div className="space-y-3 pt-2">
                      
                      <div className="relative">
                        <textarea
                          id="active_text_editor"
                          value={activeCaptionText}
                          onChange={(e) => setActiveCaptionText(e.target.value)}
                          className="w-full min-h-[220px] bg-[#151515] focus:bg-[#181818] border-2 border-[#222] focus:border-[#FF3E00] p-4 text-xs font-mono leading-relaxed text-slate-200 focus:outline-none transition-all placeholder-slate-500"
                          placeholder="No formatted text generated yet."
                        />
                        <div className="absolute right-3 bottom-3 bg-[#FF3E00] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                          ACTIVE LIVE EDITOR
                        </div>
                      </div>

                      {/* Character limit feedback progress */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-[#1C1C1C]">
                        <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                          <span className="uppercase font-mono font-bold tracking-wider text-[10px]">Characters count: </span>
                          <span className={`font-mono font-black ${isOverLimit ? 'text-[#FF3E00]' : 'text-emerald-500'}`}>
                            {activeCaptionText.length}
                          </span>
                          <span className="text-[#333]">/</span>
                          <span className="font-mono text-slate-400">
                            {currentPlatformLimit} Max Recommended
                          </span>
                        </div>
                        {isOverLimit ? (
                          <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 py-0.5 px-2.5 font-bold uppercase tracking-wider">
                            ⚠️ Over proposed capacity! Trim ideas.
                          </span>
                        ) : (
                          <span className="text-[10px] bg-[#222] text-[#FF3E00] py-0.5 px-2.5 border border-[#333] font-black uppercase tracking-widest">
                            ⚡ OPTIMAL POST BOUNDS
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* 3. The exact Hook, Value, CTA Highlighted Segments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* HOOK CARD */}
                  <div className="bg-[#111] border-l-4 border-[#FF3E00] p-5 relative flex flex-col justify-between border-2 border-y-[#222] border-r-[#222] shadow-[4px_4px_0px_transparent] hover:border-[#333] transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1c1c1c]">
                        <span className="text-[9px] font-black text-[#FF3E00] uppercase tracking-widest">
                          [01__HOOK]
                        </span>
                        <button
                          onClick={() => copyToClipboard(result.caption.hook, 'hook_sec')}
                          className="text-slate-400 hover:text-[#FF3E00] transition-colors"
                          title="Copy Hook Only"
                        >
                          {copiedSection === 'hook_sec' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white tracking-tight leading-snug mb-4">
                        "{result.caption.hook}"
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider block bg-[#151515] p-2 border border-[#222]">
                      <strong>GOAL:</strong> Stop user's thumb under 1.5 seconds.
                    </span>
                  </div>

                  {/* VALUE CARD */}
                  <div className="bg-[#111] border-l-4 border-white p-5 relative flex flex-col justify-between border-2 border-y-[#222] border-r-[#222] hover:border-[#333] transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1c1c1c]">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">
                          [02__VALUE]
                        </span>
                        <button
                          onClick={() => copyToClipboard(result.caption.value, 'val_sec')}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Copy Value Section"
                        >
                          {copiedSection === 'val_sec' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-serif italic line-clamp-5 mb-4 whitespace-pre-wrap">
                        {result.caption.value}
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider block bg-[#151515] p-2 border border-[#222]">
                      <strong>GOAL:</strong> Drop structural double line breaks.
                    </span>
                  </div>

                  {/* CTA CARD */}
                  <div className="bg-[#111] border-l-4 border-[#FF3E00] p-5 relative flex flex-col justify-between border-2 border-y-[#222] border-r-[#222] hover:border-[#333] transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1c1c1c]">
                        <span className="text-[9px] font-black text-[#FF3E00] uppercase tracking-widest">
                          [03__CTA]
                        </span>
                        <button
                          onClick={() => copyToClipboard(result.caption.cta, 'cta_sec')}
                          className="text-slate-400 hover:text-[#FF3E00] transition-colors"
                          title="Copy CTA Only"
                        >
                          {copiedSection === 'cta_sec' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white tracking-tight leading-snug mb-4">
                        "{result.caption.cta}"
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider block bg-[#151515] p-2 border border-[#222]">
                      <strong>GOAL:</strong> Drive specific comment keyword triggers.
                    </span>
                  </div>

                </div>

                {/* 4. Swappable hook variations panel */}
                <div className="bg-[#111] border-2 border-[#222] p-6 shadow-[4px_4px_0px_#000]">
                  <div className="mb-4 border-b border-[#222] pb-3">
                    <span className="text-[9px] font-black text-[#FF3E00] uppercase tracking-widest block mb-1">
                      🔬 ALTERNATIVE HOOK MATRIX
                    </span>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      Iterate Hook Angles on the Fly
                    </h3>
                    <p className="text-[11px] text-slate-400 font-serif italic mt-1">
                      "Not vibing with the current hook? Tap any psychological angle variation below to automatically swap it out inside the active editor block."
                    </p>
                  </div>

                  <div className="space-y-3">
                    {result.alternativeHooks?.map((alternative, index) => {
                      const isCurrentlyUsed = activeCaptionText.includes(alternative.trim());
                      return (
                        <button
                          key={index}
                          type="button"
                          id={`alternative-hook-${index}`}
                          onClick={() => swapHookInCaption(alternative)}
                          className={`w-full text-left p-4 border transition-all flex items-start gap-4 group relative cursor-pointer ${
                            isCurrentlyUsed 
                              ? 'border-[#FF3E00] bg-[#FF3E00]/10 text-white font-bold' 
                              : 'border-[#222] hover:border-[#FF3E00] bg-[#151515] text-slate-300'
                          }`}
                        >
                          <span className="w-6 h-6 bg-[#222] border border-[#333] group-hover:bg-[#FF3E00] group-hover:text-black group-hover:border-transparent text-slate-400 shrink-0 flex items-center justify-center font-mono font-black text-[10px] transition-colors">
                            {index + 1}
                          </span>
                          <span className="flex-1 pr-16 text-xs leading-relaxed">{alternative}</span>
                          <span className="text-[9px] bg-[#FF3E00] text-black font-black uppercase tracking-wider py-1 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                            Apply Hook ⚡
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Copywriting Analysis & Psychology */}
                <div className="bg-black border-2 border-[#222] p-6 shadow-xl text-[#F0F0F0]">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#222]">
                    <div className="bg-[#FF3E00]/20 text-[#FF3E00] p-1.5 border border-[#FF3E00]/30">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3E00]">
                        Conversion Psychology Breakdown
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">FRAMEWORK PERFORMANCE EVALUATIONS</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-sans">
                    <div className="space-y-4">
                      <div>
                        <span className="font-black uppercase tracking-widest text-white text-[10px] block mb-1">🧠 Hook Archetype Classification:</span>
                        <p className="text-slate-300 bg-[#111] p-3 border border-[#222] font-semibold">
                          {result.analysis.hookStrength}
                        </p>
                      </div>
                      <div>
                        <span className="font-black uppercase tracking-widest text-white text-[10px] block mb-1">🎯 Conversion Logic:</span>
                        <p className="text-slate-400 font-serif italic">
                          {result.analysis.whyItWorks}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#222] md:border-t-0 md:border-l md:border-[#222] md:pl-6 space-y-4">
                      <div>
                        <span className="font-black uppercase tracking-widest text-white text-[10px] block mb-1">📢 Recommended Delivery Strategy:</span>
                        <ul className="space-y-2 text-slate-300">
                          {result.analysis.readabilityTips.split('\n').filter(Boolean).map((tip, tIdx) => (
                            <li key={tIdx} className="flex gap-2">
                              <span className="text-[#FF3E00] shrink-0 font-bold">//</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Multi-Platform Hashtag Suggestions */}
                <div className="bg-[#111111] border-2 border-dashed border-[#FF3E00] p-6 shadow-[4px_4px_0px_#000]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#222] gap-3 mb-4">
                    <div>
                      <span className="text-[9px] font-black text-[#FF3E00] uppercase tracking-widest block mb-1">
                        #️⃣ MULTI-PLATFORM HASHTAG SUGGESTIONS
                      </span>
                      <h3 className="text-xs font-black uppercase text-white tracking-wider">
                        Trending & Niche Hashtags
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard((result.suggestedHashtags || []).join(' '), 'hashtags_sec')}
                      id="copy-hashtags-btn"
                      className="text-[10px] bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] hover:border-[#FF3E00] text-slate-200 py-1.5 px-3 uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-95"
                    >
                      {copiedSection === 'hashtags_sec' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied Hashtags!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy All Hashtags</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {result.suggestedHashtags && result.suggestedHashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedHashtags.map((hashtag, hIdx) => {
                        const isAppended = activeCaptionText.includes(hashtag);
                        return (
                          <button
                            key={hIdx}
                            type="button"
                            onClick={() => {
                              if (!isAppended) {
                                setActiveCaptionText(prev => {
                                  const trimmed = prev.trim();
                                  return `${trimmed}\n\n${hashtag}`;
                                });
                              }
                            }}
                            className={`text-xs font-mono py-1.5 px-3 border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                              isAppended 
                                ? 'bg-[#FF3E00]/10 border-[#FF3E00] text-white font-bold' 
                                : 'bg-[#151515] hover:bg-[#FF3E00]/20 border-[#2d2d2d] hover:border-[#FF3E00] text-slate-300'
                            }`}
                            title={isAppended ? "Hashtag already present in your content" : "Tap to append hashtag to caption"}
                          >
                            <span>{hashtag}</span>
                            {!isAppended && <span className="text-[#FF3E00] font-black font-sans text-[10px]">+</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No hashtag recommendations generated for this caption.</p>
                  )}
                  
                  <p className="text-[10px] text-slate-400 font-serif italic mt-3">
                    "Tip: Click any hashtag button above to automatically append it to the bottom of your live caption editor."
                  </p>
                </div>

              </motion.div>
            )}

          </section>

        </div>

        {/* Detailed Explanation Section for UX Completeness */}
        <section id="how-it-works" className="mt-16 bg-[#111111] p-8 border-2 border-[#222] max-w-4xl mx-auto shadow-[4px_4px_0px_#000]">
          <h3 className="text-md font-black uppercase tracking-wider text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF3E00]" />
            About the Hook, Value, CTA Copywriting Standard
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6 font-serif italic">
            "Social readers scan posts in under 2 seconds. Slabs of block paragraph text are immediately ignored. The structured Hook, Value, CTA methodology partitions core copy into isolated, scannable nodes designed to create high feedback engagement."
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
            <div className="space-y-2 bg-[#151515] p-5 border border-[#222] hover:border-[#FF3E00] transition-colors">
              <span className="font-black text-[#FF3E00] uppercase tracking-widest text-[9px] block">01 / The Hook (Scroll Stopper)</span>
              <p className="text-slate-400 leading-relaxed font-serif italic">"Locks in absolute cognitive dissonance or heavy curiosity. It represents the single critical hurdle in the social ecosystem."</p>
            </div>
            <div className="space-y-2 bg-[#151515] p-5 border border-[#222] hover:border-white transition-colors">
              <span className="font-black text-white uppercase tracking-widest text-[9px] block">02 / The Value (Payload Core)</span>
              <p className="text-slate-400 leading-relaxed font-serif italic">"Utilizes double line-breaks, strict spacing grids, and lists. Makes the insight payload quick to harvest and easy to remember."</p>
            </div>
            <div className="space-y-2 bg-[#151515] p-5 border border-[#222] hover:border-[#FF3E00] transition-colors">
              <span className="font-black text-[#FF3E00] uppercase tracking-widest text-[9px] block">03 / The CTA (Directive Point)</span>
              <p className="text-slate-400 leading-relaxed font-serif italic">"Directly calls on the reader to action with low-friction inputs. Keeps conversational flow direct and conversions high."</p>
            </div>
          </div>
        </section>

      </main>

      {/* Repeating Marquee Tickers inside bright orange bar */}
      <footer className="h-16 bg-[#FF3E00] flex items-center overflow-hidden border-y-2 border-black mt-20">
        <div className="animate-marquee whitespace-nowrap text-black font-black text-xs uppercase tracking-[0.3em] flex gap-20">
          <span>⚡ ELIMINATE FRICTION / MAXIMIZE CONVERSION / DESTROY THE BLANK PAGE / REFINE THE CHAOS / BUILD THE BRAND // ELIMINATE FRICTION / MAXIMIZE CONVERSION / DESTROY THE BLANK PAGE / REFINE THE CHAOS / BUILD THE BRAND</span>
          <span>⚡ ELIMINATE FRICTION / MAXIMIZE CONVERSION / DESTROY THE BLANK PAGE / REFINE THE CHAOS / BUILD THE BRAND // ELIMINATE FRICTION / MAXIMIZE CONVERSION / DESTROY THE BLANK PAGE / REFINE THE CHAOS / BUILD THE BRAND</span>
        </div>
      </footer>

      {/* Footer metadata */}
      <footer className="bg-[#0A0A0A] border-t border-[#1C1C1C] py-8 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} CAPTION.CRAFT STUDIO. Power-built using Gemini-3.5-Flash.</p>
          <div className="flex gap-4">
            <span className="text-[#FF3E00] font-mono tracking-wider font-semibold uppercase">PROUDLY BUILT OF COMPACT INFRASTRUCTURE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Simple Icon Helpers to prevent import errors or empty components
function FolderHeartIcon() {
  return (
    <svg className="w-4 h-4 text-[#FF3E00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function FileSpreadsheetIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
