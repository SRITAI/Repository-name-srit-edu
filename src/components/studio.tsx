"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, Check, ChevronDown, Download, Film, Image as ImageIcon, Menu, Play, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

type Mode = "image" | "video";
type View = "home" | "create" | "explore" | "library";
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
      } catch { /* fresh demo */ }
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
    const colors = [["#1a1a1a", "#555"], ["#111", "#888"], ["#222", "#666"], ["#0d0d0d", "#777"], ["#1c1c1c", "#444"], ["#191919", "#999"]][(item.art - 1) % 6];
    const safe = item.prompt.replace(/[<>&"']/g, "").slice(0, 70);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="65" y="710" fill="white" font-family="Arial Black" font-size="52" font-weight="900">${safe}</text><text x="65" y="762" fill="white" opacity=".5" font-family="Arial" font-size="22">VEYRA AI · SAMPLE PREVIEW</text></svg>`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); a.download = "veyra-sample-preview.svg"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="app-shell">
      {/* ── TOP NAVIGATION ── */}
      <header className="topnav">
        <button className="brand-logo" onClick={() => navigate("home")} aria-label="Veyra AI home">
          <span className="brand-icon">✦✦</span>
          <span className="brand-name">Veyra<br /><small>studio</small></span>
        </button>

        <button className="mobile-menu-btn" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu">
          {mobileNav ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`main-nav ${mobileNav ? "nav-open" : ""}`} aria-label="Main navigation">
          <button className={view === "home" ? "nav-link active" : "nav-link"} onClick={() => navigate("home")}>main</button>
          <button className={view === "create" && mode === "image" ? "nav-link active" : "nav-link"} onClick={() => navigate("create", "image")}>image</button>
          <button className={view === "create" && mode === "video" ? "nav-link active" : "nav-link"} onClick={() => navigate("create", "video")}>video</button>
          <button className={view === "explore" ? "nav-link active" : "nav-link"} onClick={() => navigate("explore")}>explore</button>
          <button className={view === "library" ? "nav-link active" : "nav-link"} onClick={() => navigate("library")}>
            library{creations.length > 0 && <span className="nav-badge">{creations.length}</span>}
          </button>
        </nav>

        <div className="studio-id">studio id · 001.AI</div>
      </header>

      {mobileNav && <div className="nav-scrim" onClick={() => setMobileNav(false)} />}

      {/* ── MAIN CONTENT ── */}
      <main className="main-wrap">

        {/* HOME */}
        {view === "home" && (
          <div className="home-view">
            {/* Full-screen hero — Aura Store style */}
            <section className="brutalist-hero">
              <div className="hero-word hero-word-left">VEYRA</div>
              <div className="hero-center">
                <div className="hero-art-block">
                  <div className="hero-figure-wrap">
                    <div className="art art-3 hero-art-inner" />
                  </div>
                </div>
              </div>
              <div className="hero-word hero-word-right">AI</div>

              {/* Bottom left tagline */}
              <div className="hero-tagline">
                <span className="tagline-icon">✦</span>
                <div>
                  <strong>Visuals without limits.<br />Only imagination.</strong>
                  <p>Describe anything. Generate striking images and cinematic motion in seconds.</p>
                </div>
              </div>

              {/* Bottom right card */}
              <div className="hero-card">
                <div className="art art-2 hero-card-art" />
                <div className="hero-card-footer">
                  <span>2026</span>
                  <button className="new-creation-btn" onClick={() => navigate("create", "image")}>
                    new creation <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* Gallery strip */}
            <section className="home-strip">
              <div className="strip-header">
                <span className="strip-label">THE CREATIVE FEED</span>
                <button className="strip-link" onClick={() => navigate("explore")}>Explore all <ArrowUpRight size={14} /></button>
              </div>
              <div className="strip-grid">
                {examples.slice(0, 4).map((item, i) => (
                  <GalleryCard key={item.title} item={item} index={i} saved={saved.includes(i)} onSave={() => toggleSaved(i)} onUse={() => { setMode(item.mode); setPrompt(`Create a ${item.title.toLowerCase()} scene with cinematic detail`); navigate("create", item.mode); }} />
                ))}
              </div>
            </section>

            {/* Two tool cards */}
            <section className="tool-section">
              <button className="big-tool-card" onClick={() => navigate("create", "image")}>
                <div className="art art-2 big-tool-art" />
                <div className="big-tool-body">
                  <ImageIcon size={22} />
                  <div>
                    <strong>AI Image</strong>
                    <small>Make every idea a visual statement</small>
                  </div>
                  <ArrowUpRight size={22} className="ml-auto" />
                </div>
              </button>
              <button className="big-tool-card" onClick={() => navigate("create", "video")}>
                <div className="art art-1 big-tool-art">
                  <span className="play-badge"><Play size={16} fill="currentColor" /></span>
                </div>
                <div className="big-tool-body">
                  <Film size={22} />
                  <div>
                    <strong>AI Video</strong>
                    <small>Take your story from still to moving</small>
                  </div>
                  <ArrowUpRight size={22} className="ml-auto" />
                </div>
              </button>
            </section>
          </div>
        )}

        {/* CREATE */}
        {view === "create" && (
          <div className="inner-view">
            <div className="inner-header">
              <div>
                <span className="view-kicker">THE STUDIO</span>
                <h1 className="view-title">Create {mode === "image" ? "an image" : "a video"}<span className="spark">✳</span></h1>
                <p className="view-sub">Pick a direction. Write the scene. See what takes shape.</p>
              </div>
              <div className="mode-toggle">
                <button className={mode === "image" ? "mode-btn active" : "mode-btn"} onClick={() => setMode("image")}><ImageIcon size={15} /> Image</button>
                <button className={mode === "video" ? "mode-btn active" : "mode-btn"} onClick={() => setMode("video")}><Film size={15} /> Video</button>
              </div>
            </div>
            <div className="create-grid">
              <div className="ctrl-panel">
                <div className="panel-row"><span className="panel-title"><Sparkles size={16} /> Your prompt</span><small>DESCRIBE YOUR IDEA</small></div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={mode === "image" ? "A surreal portrait surrounded by luminous flowers, soft cinematic light..." : "A cinematic aerial shot of a futuristic city at sunset, slow camera movement..."} maxLength={500} />
                <div className="char-row"><span>Be as specific or as wild as you like.</span><span>{prompt.length}/500</span></div>
                <div className="suggestion-chips">
                  <span>TRY AN IDEA</span>
                  {suggestions.map(s => <button key={s} onClick={() => setPrompt(s)}>{s} <ArrowUpRight size={12} /></button>)}
                </div>
                <div className="divider" />
                <div className="settings-title"><SlidersHorizontal size={15} /> Customize</div>
                <label className="ctrl-label">Style <ChevronDown size={13} /></label>
                <div className="chip-row">{styles.map(s => <button className={style === s ? "chip active" : "chip"} key={s} onClick={() => setStyle(s)}>{s}</button>)}</div>
                <label className="ctrl-label">Aspect ratio <ChevronDown size={13} /></label>
                <div className="chip-row">{["1:1", "4:5", "16:9", "9:16"].map(r => <button className={ratio === r ? "chip active" : "chip"} key={r} onClick={() => setRatio(r)}>{r}</button>)}</div>
                {mode === "video" && <>
                  <label className="ctrl-label">Duration <ChevronDown size={13} /></label>
                  <div className="chip-row">{["5s", "10s"].map(d => <button className={duration === d ? "chip active" : "chip"} key={d} onClick={() => setDuration(d)}>{d}</button>)}</div>
                </>}
                <button className="gen-btn" onClick={generate} disabled={generating}>
                  <Sparkles size={17} />
                  {generating ? "Creating preview..." : `Generate ${mode} preview`}
                  <ArrowUpRight size={17} />
                </button>
                <p className="demo-note">Illustrative preview only · AI generation not connected.</p>
              </div>
              <div className="prev-panel">
                <div className="prev-head"><span>PREVIEW SPACE</span><span><span className={`live-dot ${generating ? "pulsing" : ""}`} /> {generating ? "CREATING" : "READY"}</span></div>
                <div className={`prev-art art art-${mode === "video" ? 1 : 3}`}>
                  {generating
                    ? <div className="prev-overlay"><span className="spinner" /><strong>Bringing your idea into focus...</strong><small>Preview artwork is illustrative</small></div>
                    : <div className="prev-overlay"><strong>Your imagination goes here.</strong><small>Write a prompt and generate a sample preview.</small></div>}
                </div>
                <div className="prev-meta"><span>{ratio}{mode === "video" ? ` · ${duration}` : ""}</span><span>Sample preview</span></div>
              </div>
            </div>
          </div>
        )}

        {/* EXPLORE */}
        {view === "explore" && (
          <div className="inner-view">
            <div className="inner-header">
              <div>
                <span className="view-kicker">EXPLORE THE CREATIVE FEED</span>
                <h1 className="view-title">Explore creations<span className="spark">✳</span></h1>
                <p className="view-sub">Find a look you love, then make the next one yours.</p>
              </div>
            </div>
            <div className="explore-bar">
              <div className="filter-row">
                {(["all", "image", "video"] as const).map(f => (
                  <button key={f} className={exploreFilter === f ? "filter-btn active" : "filter-btn"} onClick={() => setExploreFilter(f)}>
                    {f === "all" ? "All" : f === "image" ? "Images" : "Videos"}
                  </button>
                ))}
              </div>
              <span className="curated-label"><Search size={13} /> Curated for you</span>
            </div>
            <div className="gallery-grid explore-gallery">
              {examples.map((item, i) => exploreFilter === "all" || item.mode === exploreFilter
                ? <GalleryCard key={item.title} item={item} index={i} saved={saved.includes(i)} onSave={() => toggleSaved(i)} onUse={() => { setPrompt(`Create a ${item.title.toLowerCase()} scene with cinematic detail`); navigate("create", item.mode); }} />
                : null)}
            </div>
          </div>
        )}

        {/* LIBRARY */}
        {view === "library" && (
          <div className="inner-view">
            <div className="inner-header">
              <div>
                <span className="view-kicker">YOUR VISUAL WORLD</span>
                <h1 className="view-title">My library<span className="spark">✳</span></h1>
                <p className="view-sub">Your creations and saved inspiration live here.</p>
              </div>
              <button className="outline-btn" onClick={() => navigate("create", "image")}><Plus size={15} /> New creation</button>
            </div>
            {creations.length === 0 && saved.length === 0
              ? <div className="empty-lib">
                  <span className="empty-icon"><Bookmark size={28} /></span>
                  <h2>A blank canvas looks good on you.</h2>
                  <p>Create your first sample preview or save something from Explore.</p>
                  <button className="gen-btn empty-btn" onClick={() => navigate("create", "image")}><Plus size={15} /> Start creating</button>
                </div>
              : <>
                  <div className="lib-section-head"><h2>My creations <span>{creations.length}</span></h2></div>
                  {creations.length > 0 && <div className="gallery-grid lib-grid">
                    {creations.map(item => (
                      <div className="gcard" key={item.id}>
                        <div className={`gallery-art art art-${item.art}`}>
                          <span className="art-grain" />
                          {item.mode === "video" && <span className="play-badge"><Play size={15} fill="currentColor" /></span>}
                          <span className="card-tag">SAMPLE {item.mode.toUpperCase()}</span>
                        </div>
                        <div className="gcard-info">
                          <div><strong>{item.prompt}</strong><small>{item.style} · {item.created}</small></div>
                          <button onClick={() => downloadPoster(item)} title="Download sample poster"><Download size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>}
                  {saved.length > 0 && <>
                    <div className="lib-section-head saved-head"><h2>Saved inspiration <span>{saved.length}</span></h2></div>
                    <div className="gallery-grid lib-grid">
                      {examples.map((item, i) => saved.includes(i)
                        ? <GalleryCard key={item.title} item={item} index={i} saved onSave={() => toggleSaved(i)} onUse={() => { setPrompt(`Create a ${item.title.toLowerCase()} scene with cinematic detail`); navigate("create", item.mode); }} />
                        : null)}
                    </div>
                  </>}
                </>}
          </div>
        )}

        <footer className="site-footer">
          <span>© 2026 Veyra AI</span>
          <span>Made for imagination. Illustrative previews only.</span>
        </footer>
      </main>

      {notice && (
        <div className="toast">
          <Check size={15} />{notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function GalleryCard({ item, saved, onSave, onUse }: { item: typeof examples[number]; index: number; saved: boolean; onSave: () => void; onUse: () => void }) {
  return (
    <div className="gcard">
      <div className={`gallery-art art art-${item.art}`}>
        <span className="art-grain" />
        {item.mode === "video" && <span className="play-badge"><Play size={15} fill="currentColor" /></span>}
        <span className="card-tag">{item.mode.toUpperCase()}</span>
        <button className={`save-btn ${saved ? "saved" : ""}`} onClick={onSave} aria-label={saved ? `Remove from saved` : `Save`}>
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="gcard-info">
        <div><strong>{item.title}</strong><small>{item.caption}</small></div>
        <button onClick={onUse} aria-label="Use as inspiration"><ArrowUpRight size={17} /></button>
      </div>
    </div>
  );
}
