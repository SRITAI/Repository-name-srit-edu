"use client";

import { useEffect, useState } from "react";
import Pricing from "./pricing";
import { Aperture, ArrowRight, Bookmark, Check, ChevronDown, Clapperboard, Clock3, Compass, Download, Film, Image as ImageIcon, LayoutGrid, Menu, Play, Plus, Search, Settings2, SlidersHorizontal, Sparkles, WandSparkles, X, Zap } from "lucide-react";

type Mode = "image" | "video";
type View = "home" | "create" | "explore" | "library" | "pricing";
type Creation = { id: number; prompt: string; mode: Mode; style: string; art: number; created: string };

const examples = [
  { title: "Midnight drive", caption: "Cinematic / 16:9", art: 1, mode: "video" as Mode },
  { title: "Otherworldly bloom", caption: "Editorial / 4:5", art: 2, mode: "image" as Mode },
  { title: "Chrome dreams", caption: "Fashion / 9:16", art: 3, mode: "image" as Mode },
  { title: "Into the blue", caption: "Motion / 16:9", art: 4, mode: "video" as Mode },
  { title: "After the rain", caption: "Film still / 16:9", art: 5, mode: "video" as Mode },
  { title: "Liquid future", caption: "Abstract / 1:1", art: 6, mode: "image" as Mode },
];
const suggestions = ["A dreamlike city at golden hour", "A surreal fashion editorial", "A spaceship above the clouds"];
const styles = ["Cinematic", "Photoreal", "Editorial", "Dreamscape", "Anime", "3D Render"];

export default function Studio() {
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
  const [generating, setGenerating] = useState(false);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [exploreFilter, setExploreFilter] = useState<"all" | Mode>("all");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setCreations(JSON.parse(localStorage.getItem("veyra-creations") || "[]"));
        setSaved(JSON.parse(localStorage.getItem("veyra-saved") || "[]"));
      } catch { /* a fresh demo library is fine */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (notice) { const t = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(t); } }, [notice]);

  function navigate(next: View, nextMode?: Mode) {
    if (nextMode) setMode(nextMode);
    setView(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function generate() {
    if (!prompt.trim()) { setNotice("Write a prompt to create a sample preview."); return; }
    if (generating) return;
    setGenerating(true);
    setTimeout(() => {
      const item: Creation = { id: Date.now(), prompt: prompt.trim(), mode, style, art: (Date.now() % 6) + 1, created: "Just now" };
      setCreations(current => { const next = [item, ...current]; localStorage.setItem("veyra-creations", JSON.stringify(next)); return next; });
      setGenerating(false); setNotice("Sample preview added to your library."); setView("library");
    }, 1700);
  }
  function toggleSaved(index: number) {
    setSaved(current => { const next = current.includes(index) ? current.filter(x => x !== index) : [...current, index]; localStorage.setItem("veyra-saved", JSON.stringify(next)); return next; });
  }
  function downloadPoster(item: Creation) {
    const colors = [["#373863", "#e9ab80"], ["#173d56", "#7ecaca"], ["#482247", "#f0adbf"], ["#0c354f", "#8dc0d9"], ["#523e52", "#b2a1c9"], ["#473145", "#f4b79c"]][(item.art - 1) % 6];
    const safe = item.prompt.replace(/[<>&"']/g, "").slice(0, 70);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient><radialGradient id="r"><stop stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="830" cy="300" r="350" fill="url(#r)"/><path d="M0 650 Q290 460 570 650 T1200 570 V800 H0" fill="#090d1b" opacity=".55"/><text x="65" y="710" fill="white" font-family="Arial" font-size="42">${safe}</text><text x="65" y="760" fill="white" opacity=".7" font-family="Arial" font-size="24">VEYRA AI · SAMPLE PREVIEW</text></svg>`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); a.download = "veyra-sample-preview.svg"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <button className="brand" onClick={() => navigate("home")} aria-label="Veyra AI home"><span className="brand-symbol"><Aperture size={23} strokeWidth={2.1} /></span><span>veyra<span className="brand-dot">.</span><small>AI</small></span></button>
      <div className="side-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        <button className={view === "home" ? "nav-item active" : "nav-item"} onClick={() => navigate("home")}><LayoutGrid size={18}/> Home</button>
        <button className={view === "create" && mode === "image" ? "nav-item active" : "nav-item"} onClick={() => navigate("create", "image")}><ImageIcon size={18}/> Create image <span className="nav-plus"><Plus size={14}/></span></button>
        <button className={view === "create" && mode === "video" ? "nav-item active" : "nav-item"} onClick={() => navigate("create", "video")}><Clapperboard size={18}/> Create video <span className="nav-plus"><Plus size={14}/></span></button>
        <button className={view === "explore" ? "nav-item active" : "nav-item"} onClick={() => navigate("explore")}><Compass size={18}/> Explore</button>
        <button className={view === "library" ? "nav-item active" : "nav-item"} onClick={() => navigate("library")}><Bookmark size={18}/> My library {creations.length > 0 && <span className="nav-count">{creations.length}</span>}</button>
        <button className={view === "pricing" ? "nav-item active" : "nav-item"} onClick={() => navigate("pricing")}><Zap size={18}/> Pricing</button>
      </nav>
      <div className="side-spacer"/>
      <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Ideas look better here.</strong><p>Find the right plan for your next big idea.</p><button onClick={() => navigate("pricing")}>See plans <ArrowRight size={15}/></button></div>
      <div className="side-bottom"><span className="avatar">V</span><span><strong>Veyra Studio</strong><small>Creative workspace</small></span><Settings2 size={17}/></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>{view === "home" ? "Home" : view === "create" ? `Create ${mode}` : view === "explore" ? "Explore" : view === "pricing" ? "Pricing" : "My library"}</strong></div><div className="top-actions"><button className="top-create" onClick={() => navigate("create", "image")}><Plus size={16}/> New creation</button></div></header>
      {view === "home" && <div className="content home-content">
        <section className="hero"><div className="hero-noise"/><div className="hero-copy"><span className="eyebrow"><Sparkles size={14}/> MAKE THE IMPOSSIBLE VISIBLE</span><h1>Create anything.<br/><em>Make it move.</em></h1><p>Your ideas deserve more than a moodboard. Shape striking images and cinematic motion in one creative studio.</p><div className="hero-actions"><button className="primary-btn" onClick={() => navigate("create", "image")}><WandSparkles size={17}/> Create an image <ArrowRight size={17}/></button><button className="secondary-btn" onClick={() => navigate("create", "video")}><Play size={16} fill="currentColor"/> Make a video</button></div><span className="hero-foot">One prompt. Endless directions.</span></div><div className="hero-art"><div className="hero-orb"/><div className="hero-ring ring-one"/><div className="hero-ring ring-two"/><div className="hero-figure"/><div className="hero-art-caption"><span>✦</span> CREATE WITHOUT LIMITS</div></div></section>
        <div className="section-title"><div><span className="section-kicker">CREATE WITH VEYRA</span><h2>Choose your creative playground</h2></div></div>
        <div className="tool-grid"><button className="tool-card image-tool" onClick={() => navigate("create", "image")}><div className="tool-visual art art-2"><span className="visual-shape flower"/></div><div className="tool-body"><span className="tool-icon"><ImageIcon size={20}/></span><span><strong>AI Image</strong><small>Make every idea a visual statement</small></span><ArrowRight size={18}/></div></button><button className="tool-card video-tool" onClick={() => navigate("create", "video")}><div className="tool-visual art art-1"><span className="visual-shape city"/><span className="visual-play"><Play size={17} fill="currentColor"/></span></div><div className="tool-body"><span className="tool-icon"><Film size={20}/></span><span><strong>AI Video</strong><small>Take your story from still to moving</small></span><ArrowRight size={18}/></div></button></div>
        <div className="section-title inspiration-title"><div><span className="section-kicker">THE CREATIVE FEED</span><h2>Find your next direction</h2></div><button className="text-link" onClick={() => navigate("explore")}>Explore gallery <ArrowRight size={16}/></button></div>
        <div className="gallery-grid home-gallery">{examples.slice(0,4).map((item,i)=><GalleryCard key={item.title} item={item} index={i} saved={saved.includes(i)} onSave={() => toggleSaved(i)} onUse={() => {setMode(item.mode);setPrompt(`Create a ${item.title.toLowerCase()} scene with cinematic detail`);navigate("create",item.mode);}}/>)}</div>
      </div>}
      {view === "create" && <div className="content create-content"><div className="page-heading"><span className="section-kicker">THE STUDIO</span><h1>Create {mode === "image" ? "an image" : "a video"}<span className="heading-spark">✳</span></h1><p>Pick a direction. Write the scene. See what takes shape.</p></div><div className="mode-switch"><button className={mode === "image" ? "selected" : ""} onClick={() => setMode("image")}><ImageIcon size={17}/> Image</button><button className={mode === "video" ? "selected" : ""} onClick={() => setMode("video")}><Film size={17}/> Video</button></div><div className="studio-grid"><div className="control-panel"><div className="panel-heading"><span><Sparkles size={17}/> Your prompt</span><small>DESCRIBE YOUR IDEA</small></div><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={mode === "image" ? "A surreal portrait of a woman surrounded by luminous flowers, soft cinematic light..." : "A cinematic aerial shot of a futuristic city at sunset, slow camera movement..."} maxLength={500}/><div className="prompt-footer"><span>Be as specific or as wild as you like.</span><span>{prompt.length}/500</span></div><div className="suggestions"><span>TRY AN IDEA</span>{suggestions.map(s=><button key={s} onClick={() => setPrompt(s)}>{s} <ArrowRight size={13}/></button>)}</div><div className="divider"/><div className="setting-heading"><SlidersHorizontal size={17}/> Customize</div><label className="field-label">Style <ChevronDown size={15}/></label><div className="style-options">{styles.map(s=><button className={style===s?"chosen":""} key={s} onClick={()=>setStyle(s)}>{s}</button>)}</div><label className="field-label">Aspect ratio <ChevronDown size={15}/></label><div className="ratio-options">{["1:1","4:5","16:9","9:16"].map(r=><button className={ratio===r?"chosen":""} key={r} onClick={()=>setRatio(r)}>{r}</button>)}</div>{mode === "video" && <><label className="field-label">Duration <ChevronDown size={15}/></label><div className="ratio-options">{["5s","10s"].map(d=><button className={duration===d?"chosen":""} key={d} onClick={()=>setDuration(d)}>{d}</button>)}</div></>}<button className="generate-btn" onClick={generate} disabled={generating}><Sparkles size={18}/>{generating ? "Creating preview..." : `Generate ${mode} preview`}<ArrowRight size={17}/></button><p className="demo-note">Illustrative preview only · AI generation and video rendering are not connected.</p></div><div className="preview-panel"><div className="preview-head"><span>PREVIEW SPACE</span><span><span className="live-dot"/> {generating ? "CREATING" : "READY WHEN YOU ARE"}</span></div><div className={`preview-art art art-${mode === "video" ? 1 : 3}`}><span className="preview-glow"/>{generating ? <div className="preview-overlay"><span className="spinner"/><strong>Bringing your idea into focus...</strong><small>Preview artwork is illustrative</small></div> : <div className="preview-overlay"><span className="preview-icon"><Aperture size={27}/></span><strong>Your imagination goes here.</strong><small>Write a prompt and see a sample preview.</small></div>}</div><div className="preview-meta"><span><Clock3 size={15}/> Sample preview</span><span>{ratio} {mode === "video" ? ` · ${duration}` : ""}</span></div></div></div></div>}
      {view === "explore" && <div className="content explore-content"><div className="page-heading"><span className="section-kicker">EXPLORE THE CREATIVE FEED</span><h1>Explore creations<span className="heading-spark">✳</span></h1><p>Find a look you love, then make the next one yours.</p></div><div className="explore-toolbar"><div className="filter-tabs">{(["all","image","video"] as const).map(f=><button key={f} className={exploreFilter===f?"selected":""} onClick={()=>setExploreFilter(f)}>{f === "all" ? "All creations" : f === "image" ? "Images" : "Videos"}</button>)}</div><span><Search size={15}/> Curated for you</span></div><div className="gallery-grid explore-gallery">{examples.map((item,i)=>exploreFilter==="all"||item.mode===exploreFilter?<GalleryCard key={item.title} item={item} index={i} saved={saved.includes(i)} onSave={()=>toggleSaved(i)} onUse={()=>{setPrompt(`Create a ${item.title.toLowerCase()} scene with cinematic detail`);navigate("create",item.mode);}}/>:null)}</div></div>}
      {view === "library" && <div className="content library-content"><div className="page-heading"><span className="section-kicker">YOUR VISUAL WORLD</span><h1>My library<span className="heading-spark">✳</span></h1><p>Your creations and saved inspiration live here.</p></div>{creations.length===0 && saved.length===0 ? <div className="empty-library"><span><Bookmark size={31}/></span><h2>A blank canvas looks good on you.</h2><p>Create your first sample preview or save something inspiring from Explore.</p><button className="primary-btn" onClick={()=>navigate("create","image")}><Plus size={17}/> Start creating</button></div> : <><div className="library-heading"><h2>My creations <span>{creations.length}</span></h2><button onClick={()=>navigate("create","image")}><Plus size={16}/> New creation</button></div>{creations.length>0 && <div className="gallery-grid library-grid">{creations.map(item=><div className="gallery-card creation-card" key={item.id}><div className={`gallery-art art art-${item.art}`}><span className="art-grain"/>{item.mode==="video" && <span className="card-play"><Play size={17} fill="currentColor"/></span>}<span className="card-tag">SAMPLE {item.mode.toUpperCase()}</span></div><div className="gallery-info"><div><strong>{item.prompt}</strong><small>{item.style} · {item.created}</small></div><button onClick={()=>downloadPoster(item)} title="Download sample poster" aria-label="Download sample poster"><Download size={17}/></button></div></div>)}</div>}{saved.length>0 && <><div className="library-heading saved-heading"><h2>Saved inspiration <span>{saved.length}</span></h2></div><div className="gallery-grid library-grid">{examples.map((item,i)=>saved.includes(i)?<GalleryCard key={item.title} item={item} index={i} saved onSave={()=>toggleSaved(i)} onUse={()=>{setPrompt(`Create a ${item.title.toLowerCase()} scene with cinematic detail`);navigate("create",item.mode);}}/>:null)}</div></>}</>}</div>}
      {view === "pricing" && <Pricing onSelect={(plan) => setNotice(`${plan === "max" ? "Max" : "Creator"} checkout will open once payment setup is complete.`)} />}
      <footer className="footer"><span>© 2026 Veyra AI</span><span>Made for imagination. Illustrative previews only.</span></footer>
    </main>
    {notice && <div className="toast"><Check size={16}/>{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>;
}

function GalleryCard({ item, saved, onSave, onUse }: { item: typeof examples[number]; index: number; saved: boolean; onSave: () => void; onUse: () => void }) {
  return <div className="gallery-card"><div className={`gallery-art art art-${item.art}`}><span className="art-grain"/>{item.mode === "video" && <span className="card-play"><Play size={17} fill="currentColor"/></span>}<span className="card-tag">{item.mode.toUpperCase()}</span><button className={`save-btn ${saved?"saved":""}`} onClick={onSave} aria-label={saved?`Remove ${item.title} from saved`:`Save ${item.title}`}><Bookmark size={16} fill={saved?"currentColor":"none"}/></button></div><div className="gallery-info"><div><strong>{item.title}</strong><small>{item.caption}</small></div><button onClick={onUse} aria-label={`Use ${item.title} as inspiration`}><ArrowRight size={18}/></button></div></div>;
}
