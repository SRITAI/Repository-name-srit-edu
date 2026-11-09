"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  FileText,
  UploadCloud,
  FolderSymlink,
  AlertCircle,
  X,
  Plus,
  ShieldCheck,
  Video,
  Clock,
  Trash2,
} from "lucide-react";

import { SEED_CATEGORIES, SEED_REELS, SEED_ADS } from "@/lib/data/seed-data";
import { createClient } from "@/lib/supabase/client";

interface DriveLinkState {
  url: string;
  kind: "file" | "folder";
}

function StudioWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefill from URL query params
  const initialCategory = searchParams.get("category") || "clothing-fashion";
  const initialRef = searchParams.get("ref") || "";
  const initialTitle = searchParams.get("title") || "";

  // Wizard Step (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1 — Brief Fields
  const [brandName, setBrandName] = useState("");
  const [brandLink, setBrandLink] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [goal, setGoal] = useState("Sales & Conversions");
  const [platform, setPlatform] = useState("Instagram Reels & Meta Ads");
  const [formats, setFormats] = useState<string[]>(["9:16"]);
  const [duration, setDuration] = useState<number>(30);
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Fun & High Energy");

  // Creator Preference (Real Human Creator)
  const [creatorGender, setCreatorGender] = useState("Any / Best Fit");
  const [creatorAge, setCreatorAge] = useState("20–30s");
  const [creatorLookNotes, setCreatorLookNotes] = useState("");

  // References
  const [referenceUrls, setReferenceUrls] = useState<string[]>(
    initialRef ? [`Reference Ad: ${initialTitle || initialRef}`] : []
  );
  const [newRefInput, setNewRefInput] = useState("");
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  // STEP 2 — Input Tabs: 'script' | 'product_images' | 'drive_link'
  const [activeTab, setActiveTab] = useState<"script" | "product_images" | "drive_link">("script");

  // Tab A: Script
  const [scriptText, setScriptText] = useState("");
  const [scriptHook, setScriptHook] = useState("");
  const [scriptCta, setScriptCta] = useState("");
  const [scriptSource, setScriptSource] = useState<"client" | "ai_draft">("client");

  // Tab B: Product Images & AI Script
  const [productImages, setProductImages] = useState<{ id: string; url: string; isPrimary: boolean; name: string }[]>([]);
  const [productName, setProductName] = useState("");
  const [productBenefits, setProductBenefits] = useState<string[]>(["", "", ""]);
  const [productUsp, setProductUsp] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGeneratingAiScript, setIsGeneratingAiScript] = useState(false);
  const [aiScriptOptions, setAiScriptOptions] = useState<any[]>([]);

  // Tab C: Drive Links
  const [driveLinks, setDriveLinks] = useState<DriveLinkState[]>([]);
  const [driveInput, setDriveInput] = useState("");
  const [driveError, setDriveError] = useState("");

  // STEP 3 — Review & Confirmations
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Restore autosaved draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem("infimindss_studio_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brandName) setBrandName(parsed.brandName);
        if (parsed.brandLink) setBrandLink(parsed.brandLink);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.goal) setGoal(parsed.goal);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.formats) setFormats(parsed.formats);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.tone) setTone(parsed.tone);
        if (parsed.scriptText) setScriptText(parsed.scriptText);
        if (parsed.productName) setProductName(parsed.productName);
        if (parsed.productUsp) setProductUsp(parsed.productUsp);
      }
    } catch {}
  }, []);

  // Autosave to localStorage on changes
  useEffect(() => {
    const draft = {
      brandName,
      brandLink,
      category,
      goal,
      platform,
      formats,
      duration,
      language,
      tone,
      scriptText,
      productName,
      productUsp,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("infimindss_studio_draft", JSON.stringify(draft));
  }, [brandName, brandLink, category, goal, platform, formats, duration, language, tone, scriptText, productName, productUsp]);

  // Format Toggle
  const toggleFormat = (fmt: string) => {
    if (formats.includes(fmt)) {
      if (formats.length > 1) {
        setFormats(formats.filter((f) => f !== fmt));
      }
    } else {
      setFormats([...formats, fmt]);
    }
  };

  // Word count & spoken duration estimate (~2.5 words/sec)
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round(wordCount / 2.5);
  const isOverDuration = estimatedSeconds > duration;

  // Add Google Drive Link
  const handleAddDriveLink = () => {
    setDriveError("");
    const url = driveInput.trim();
    if (!url) return;

    if (!url.includes("drive.google.com") && !url.includes("docs.google.com")) {
      setDriveError("Please enter a valid Google Drive URL (drive.google.com).");
      return;
    }

    const isFolder = url.includes("/folders/") || url.includes("drive/u/0/folders/");
    setDriveLinks([...driveLinks, { url, kind: isFolder ? "folder" : "file" }]);
    setDriveInput("");
  };

  // Handle Image Upload (Client Preview)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 8 - productImages.length);

    const newImgs = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      isPrimary: productImages.length === 0 && idx === 0,
      name: file.name,
    }));

    setProductImages([...productImages, ...newImgs]);
  };

  // Generate Script with AI
  const handleGenerateScript = async () => {
    setIsGeneratingAiScript(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/studio/draft-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName || brandName || "Hero Product",
          product_benefits: productBenefits.filter(Boolean),
          product_usp: productUsp,
          target_audience: targetAudience,
          tone,
          duration_seconds: duration,
        }),
      });

      const data = await res.json();
      if (data.options) {
        setAiScriptOptions(data.options);
      }
    } catch {
      setErrorMsg("Failed to generate AI script options. Please try again or type a script manually.");
    } finally {
      setIsGeneratingAiScript(false);
    }
  };

  // Select an AI Script Option
  const handleSelectAiScript = (opt: any) => {
    setScriptText(opt.fullScript);
    setScriptSource("ai_draft");
    setActiveTab("script");
    setAiScriptOptions([]);
  };

  // Validate Step 1
  const handleNextFromStep1 = () => {
    setErrorMsg("");
    if (!brandName.trim()) {
      setErrorMsg("Please enter your brand name to continue.");
      return;
    }
    setCurrentStep(2);
  };

  // Validate Step 2
  const handleNextFromStep2 = () => {
    setErrorMsg("");
    const hasScript = scriptText.trim().length > 0;
    const hasImages = productImages.length > 0;
    const hasDrive = driveLinks.length > 0;

    if (!hasScript && !hasImages && !hasDrive) {
      setErrorMsg("Please provide at least ONE input: write a script, upload product images, or paste a Google Drive link.");
      return;
    }
    setCurrentStep(3);
  };

  // Submit Final Project
  const handleSubmitProject = async () => {
    if (!rightsConfirmed || !termsAgreed) {
      setErrorMsg("Please confirm asset ownership rights and agree to the terms.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const projectId = `proj-${Date.now()}`;
      const projectPayload = {
        id: projectId,
        brand_name: brandName,
        brand_link: brandLink,
        category_id: category,
        goal,
        platform,
        formats,
        duration_seconds: duration,
        language,
        tone,
        creator_preference: {
          gender: creatorGender,
          age_range: creatorAge,
          look_notes: creatorLookNotes,
        },
        input_modes: [
          ...(scriptText ? ["script"] : []),
          ...(productImages.length > 0 ? ["product_images"] : []),
          ...(driveLinks.length > 0 ? ["drive_link"] : []),
        ],
        script_text: scriptText,
        script_source: scriptSource,
        product_name: productName,
        product_benefits: productBenefits.filter(Boolean),
        product_usp: productUsp,
        target_audience: targetAudience,
        drive_links: driveLinks,
        reference_urls: referenceUrls,
        status: "submitted",
        rights_confirmed: true,
        created_at: new Date().toISOString(),
      };

      // Save to Supabase if client is configured
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            await supabase.from("projects").insert({
              ...projectPayload,
              user_id: userData.user.id,
            });
            await supabase.from("project_events").insert({
              project_id: projectId,
              actor_id: userData.user.id,
              event_type: "project_submitted",
              to_status: "submitted",
              note: "Project submitted by client via Studio chamber.",
            });
          }
        } catch {
          // Continue with local save if Supabase isn't reachable
        }
      }

      // Save to localStorage projects list
      const existing = JSON.parse(localStorage.getItem("infimindss_my_projects") || "[]");
      existing.unshift(projectPayload);
      localStorage.setItem("infimindss_my_projects", JSON.stringify(existing));

      // Clear draft
      localStorage.removeItem("infimindss_studio_draft");

      // Redirect to Project detail
      router.push(`/studio/projects/${projectId}?success=true`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit project. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="presentation-wrapper" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="window-frame" style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px" }}>
        {/* Navigation Bar */}
        <header className="header" style={{ marginBottom: "28px" }}>
          <Link href="/" className="brand-logo" aria-label="infimindss Home">
            infimindss<span className="logo-degree">°</span>
          </Link>

          <nav className="nav-pill" aria-label="Main Navigation">
            <Link href="/" className="nav-item">Home</Link>
            <Link href="/explore" className="nav-item">Explore</Link>
            <Link href="/studio" className="nav-item active">Studio</Link>
            <Link href="/studio/projects" className="nav-item">My Projects</Link>
          </nav>

          <div className="header-right">
            <Link href="/studio/projects" className="btn-video-cta" style={{ fontSize: "0.82rem" }}>
              <span>View my projects</span>
            </Link>
          </div>
        </header>

        {/* Wizard Title & Step Progress Bar */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#71717A" }}>
              The Studio Chamber
            </span>
            <span style={{ color: "#D4D4D8" }}>•</span>
            <span style={{ fontSize: "0.78rem", color: "#10B981", fontWeight: 600 }}>
              Draft Autosaved
            </span>
          </div>
          <h1 className="section-title">
            Brief your video project. <br />
            <em>Real creator shoots. AI velocity.</em>
          </h1>

          {/* Stepper Indicator */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", maxWidth: "600px" }}>
            {[
              { num: 1, label: "1. Brand & Brief" },
              { num: 2, label: "2. Script & Assets" },
              { num: 3, label: "3. Review & Submit" },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  cursor: currentStep > step.num ? "pointer" : "default",
                }}
                onClick={() => {
                  if (currentStep > step.num) setCurrentStep(step.num as any);
                }}
              >
                <div
                  style={{
                    height: "4px",
                    borderRadius: "4px",
                    background: currentStep >= step.num ? "#111111" : "#E4E4E7",
                    transition: "background 0.25s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: currentStep === step.num ? 700 : 500,
                    color: currentStep >= step.num ? "#111111" : "#A1A1AA",
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              borderRadius: "14px",
              padding: "12px 18px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.88rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Content Layout: Form Left + Sticky Summary Right */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>
          {/* Form Card */}
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "36px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 12px 36px rgba(0,0,0,0.03)" }}>
            {/* STEP 1: BRIEF */}
            {currentStep === 1 && (
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px" }}>Step 1 — Creative Brief</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>
                      Brand Name <span style={{ color: "#E11D48" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="category-search-input"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6" }}
                      placeholder="e.g. Kite & Linen, Aura Derma"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>
                      Website or Instagram Handle
                    </label>
                    <input
                      type="text"
                      className="category-search-input"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6" }}
                      placeholder="e.g. @yourbrand or yourbrand.com"
                      value={brandLink}
                      onChange={(e) => setBrandLink(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category & Goal */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>Category</label>
                    <select
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6", outline: "none" }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {SEED_CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name} {c.is_adult ? "(18+)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>Primary Goal</label>
                    <select
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6", outline: "none" }}
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    >
                      <option value="Sales & Conversions">Sales & Conversions (Direct Response)</option>
                      <option value="Brand Awareness">Brand Awareness & Viral Reach</option>
                      <option value="Product Launch">New Product Launch</option>
                      <option value="App Installs">App Installs & Signups</option>
                    </select>
                  </div>
                </div>

                {/* Formats Multi-select & Duration */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "8px" }}>Deliverable Formats</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["9:16", "4:5", "1:1", "16:9"].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          className={`category-pill-btn ${formats.includes(fmt) ? "active" : ""}`}
                          onClick={() => toggleFormat(fmt)}
                          style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "8px" }}>Target Duration</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[15, 30, 45, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          className={`category-pill-btn ${duration === sec ? "active" : ""}`}
                          onClick={() => setDuration(sec)}
                          style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Creator Preference (Real Human Request) */}
                <div style={{ background: "#FAF9F6", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Users size={16} color="#111111" />
                    <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Real Human Creator Preference</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#71717A", marginBottom: "14px" }}>
                    Note: We cast vetted human creators with commercial model releases. We never generate artificial synthetic avatars.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>Gender Preference</label>
                      <select
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FFFFFF", fontSize: "0.82rem" }}
                        value={creatorGender}
                        onChange={(e) => setCreatorGender(e.target.value)}
                      >
                        <option value="Any / Best Fit">Any / Best Fit for Category</option>
                        <option value="Female">Female Creator</option>
                        <option value="Male">Male Creator</option>
                        <option value="Non-binary">Non-binary</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>Age Range</label>
                      <select
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FFFFFF", fontSize: "0.82rem" }}
                        value={creatorAge}
                        onChange={(e) => setCreatorAge(e.target.value)}
                      >
                        <option value="18–25">18–25 (Gen-Z)</option>
                        <option value="25–35">25–35 (Young Professionals)</option>
                        <option value="35–50">35–50 (Mature & Family)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>Look, Accent & Vibe Notes</label>
                    <input
                      type="text"
                      className="category-search-input"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FFFFFF", fontSize: "0.82rem" }}
                      placeholder="e.g. Natural skin, warm friendly presence, clear Hindi/English diction"
                      value={creatorLookNotes}
                      onChange={(e) => setCreatorLookNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* References */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700 }}>Reference Reels or Benchmark Ads (Max 5)</label>
                    <button
                      type="button"
                      className="btn-video-cta"
                      onClick={() => setIsPickerModalOpen(true)}
                      style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                    >
                      <Sparkles size={12} /> Pick from Trending / Famous Ads
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <input
                      type="url"
                      className="category-search-input"
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6", fontSize: "0.82rem" }}
                      placeholder="Paste an Instagram Reel or Meta Ad link..."
                      value={newRefInput}
                      onChange={(e) => setNewRefInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary-cta"
                      style={{ padding: "8px 14px", fontSize: "0.78rem" }}
                      onClick={() => {
                        if (newRefInput.trim() && referenceUrls.length < 5) {
                          setReferenceUrls([...referenceUrls, newRefInput.trim()]);
                          setNewRefInput("");
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {referenceUrls.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {referenceUrls.map((ref, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#FAF9F6",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ref}</span>
                          <button
                            type="button"
                            onClick={() => setReferenceUrls(referenceUrls.filter((_, i) => i !== idx))}
                            style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer" }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" className="btn-primary-cta" onClick={handleNextFromStep1}>
                    <span>Continue to Script & Assets</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SCRIPT & INPUT MODES */}
            {currentStep === 2 && (
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>Step 2 — Provide Script or Assets</h3>
                <p style={{ fontSize: "0.85rem", color: "#71717A", marginBottom: "24px" }}>
                  Choose any combination: paste a written script, upload product pictures for AI script drafting, or drop a Google Drive folder link.
                </p>

                {/* Tab Switcher */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "14px" }}>
                  <button
                    type="button"
                    className={`category-pill-btn ${activeTab === "script" ? "active" : ""}`}
                    onClick={() => setActiveTab("script")}
                  >
                    <FileText size={14} /> Tab A: I have a script
                  </button>
                  <button
                    type="button"
                    className={`category-pill-btn ${activeTab === "product_images" ? "active" : ""}`}
                    onClick={() => setActiveTab("product_images")}
                  >
                    <UploadCloud size={14} /> Tab B: Upload Product Photos
                  </button>
                  <button
                    type="button"
                    className={`category-pill-btn ${activeTab === "drive_link" ? "active" : ""}`}
                    onClick={() => setActiveTab("drive_link")}
                  >
                    <FolderSymlink size={14} /> Tab C: Google Drive Link
                  </button>
                </div>

                {/* TAB A: Script Input */}
                {activeTab === "script" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700 }}>Spoken Script (Plain Text)</label>
                      <div style={{ fontSize: "0.75rem", color: isOverDuration ? "#E11D48" : "#71717A" }}>
                        {wordCount} words • Est. {estimatedSeconds}s / {duration}s target
                      </div>
                    </div>

                    <textarea
                      rows={7}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        border: isOverDuration ? "1px solid #FCA5A5" : "1px solid rgba(0,0,0,0.1)",
                        background: "#FAF9F6",
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-sans)",
                        lineHeight: 1.55,
                        outline: "none",
                        marginBottom: "12px",
                      }}
                      placeholder="Paste your creator script here. For example: [HOOK]: Stop scrolling if you deal with frizzy hair... [BODY]: This 3-minute serum... [CTA]: Tap below to claim 20% off."
                      value={scriptText}
                      onChange={(e) => {
                        setScriptText(e.target.value);
                        setScriptSource("client");
                      }}
                      maxLength={10000}
                    />

                    {isOverDuration && (
                      <div style={{ color: "#E11D48", fontSize: "0.78rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <AlertCircle size={14} />
                        <span>Warning: Your script ({wordCount} words) may exceed your chosen {duration}s duration.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB B: Product Pictures & AI Script Generator */}
                {activeTab === "product_images" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "8px" }}>
                      Upload Product Pictures (1 to 8 images)
                    </label>

                    {/* Image dropzone */}
                    <div
                      style={{
                        border: "2px dashed rgba(0,0,0,0.15)",
                        borderRadius: "14px",
                        padding: "24px",
                        textAlign: "center",
                        background: "#FAF9F6",
                        marginBottom: "18px",
                      }}
                    >
                      <UploadCloud size={32} style={{ margin: "0 auto 10px auto", color: "#A1A1AA" }} />
                      <p style={{ fontSize: "0.85rem", color: "#52525B", marginBottom: "8px" }}>
                        Drag & drop product images, or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        id="product-img-upload"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="product-img-upload" className="btn-video-cta" style={{ display: "inline-flex", cursor: "pointer", fontSize: "0.8rem" }}>
                        Select Files (Max 10MB each)
                      </label>
                    </div>

                    {/* Image Previews */}
                    {productImages.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                        {productImages.map((img) => (
                          <div key={img.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: img.isPrimary ? "2px solid #10B981" : "1px solid rgba(0,0,0,0.1)" }}>
                            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            {img.isPrimary && (
                              <span style={{ position: "absolute", top: "2px", left: "2px", background: "#10B981", color: "#FFF", fontSize: "0.55rem", padding: "1px 4px", borderRadius: "3px" }}>
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setProductImages(productImages.filter((p) => p.id !== img.id))}
                              style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", color: "#FFF", border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Product Details for AI Scriptwriting */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>Product Name</label>
                        <input
                          type="text"
                          className="category-search-input"
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6", fontSize: "0.82rem" }}
                          placeholder="e.g. Anti-Wrinkle Oxford Shirt"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>Target Audience</label>
                        <input
                          type="text"
                          className="category-search-input"
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6", fontSize: "0.82rem" }}
                          placeholder="e.g. Business travelers, active guys"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>What makes it different? (USP)</label>
                      <input
                        type="text"
                        className="category-search-input"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6", fontSize: "0.82rem" }}
                        placeholder="e.g. 100% organic linen with crease-recovery fibers"
                        value={productUsp}
                        onChange={(e) => setProductUsp(e.target.value)}
                      />
                    </div>

                    {/* AI Script Draft Action */}
                    <button
                      type="button"
                      className="btn-primary-cta"
                      onClick={handleGenerateScript}
                      disabled={isGeneratingAiScript}
                      style={{ fontSize: "0.82rem", marginBottom: "18px" }}
                    >
                      <Sparkles size={14} />
                      <span>{isGeneratingAiScript ? "Drafting Concepts with AI..." : "Draft a script for me with AI ↗"}</span>
                    </button>

                    {/* AI Script Options Modal / Card */}
                    {aiScriptOptions.length > 0 && (
                      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534", display: "block", marginBottom: "10px" }}>
                          AI Generated Script Concepts (Select one to edit):
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {aiScriptOptions.map((opt) => (
                            <div key={opt.id} style={{ background: "#FFFFFF", borderRadius: "10px", padding: "14px", border: "1px solid rgba(0,0,0,0.06)" }}>
                              <strong style={{ fontSize: "0.84rem", display: "block", marginBottom: "4px" }}>{opt.title}</strong>
                              <p style={{ fontSize: "0.78rem", color: "#52525B", whiteSpace: "pre-line", marginBottom: "10px" }}>{opt.fullScript}</p>
                              <button
                                type="button"
                                className="btn-primary-cta"
                                style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                                onClick={() => handleSelectAiScript(opt)}
                              >
                                Use this script ↗
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB C: Google Drive Link */}
                {activeTab === "drive_link" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>
                      Paste Google Drive Folder or File URL
                    </label>
                    <p style={{ fontSize: "0.75rem", color: "#71717A", marginBottom: "12px" }}>
                      Tip: Set Drive sharing to <strong>&ldquo;Anyone with the link → Viewer&rdquo;</strong> so our creative producer and editor can access assets.
                    </p>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <input
                        type="url"
                        className="category-search-input"
                        style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", background: "#FAF9F6" }}
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={driveInput}
                        onChange={(e) => setDriveInput(e.target.value)}
                      />
                      <button type="button" className="btn-primary-cta" onClick={handleAddDriveLink}>
                        Add Drive Link
                      </button>
                    </div>

                    {driveError && (
                      <p style={{ color: "#E11D48", fontSize: "0.75rem", marginBottom: "12px" }}>{driveError}</p>
                    )}

                    {driveLinks.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {driveLinks.map((d, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#FAF9F6",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              fontSize: "0.8rem",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {d.kind === "folder" ? "📁 Folder: " : "📄 File: "} {d.url}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDriveLinks(driveLinks.filter((_, i) => i !== idx))}
                              style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Back & Next Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
                  <button type="button" className="btn-video-cta" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft size={15} />
                    <span>Back to Brief</span>
                  </button>
                  <button type="button" className="btn-primary-cta" onClick={handleNextFromStep2}>
                    <span>Review & Confirm</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {currentStep === 3 && (
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>Step 3 — Review & Submit Project</h3>
                <p style={{ fontSize: "0.85rem", color: "#71717A", marginBottom: "24px" }}>
                  Please review your project brief before initiating creative chamber production.
                </p>

                <div style={{ background: "#FAF9F6", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.78rem", color: "#71717A" }}>Brand</span>
                    <strong style={{ fontSize: "0.9rem" }}>{brandName} ({brandLink || "No handle"})</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.78rem", color: "#71717A" }}>Category & Goal</span>
                    <strong style={{ fontSize: "0.9rem" }}>{category} • {goal}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.78rem", color: "#71717A" }}>Formats & Duration</span>
                    <strong style={{ fontSize: "0.9rem" }}>{formats.join(", ")} • {duration} seconds</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.78rem", color: "#71717A" }}>Creator Preference</span>
                    <strong style={{ fontSize: "0.9rem" }}>{creatorGender}, {creatorAge}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.78rem", color: "#71717A" }}>Assets Provided</span>
                    <strong style={{ fontSize: "0.9rem" }}>
                      {scriptText ? "Script Included • " : ""}
                      {productImages.length > 0 ? `${productImages.length} Photos • ` : ""}
                      {driveLinks.length > 0 ? `${driveLinks.length} Drive Link(s)` : ""}
                    </strong>
                  </div>
                </div>

                {/* Confirmation Checkboxes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.84rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={rightsConfirmed}
                      onChange={(e) => setRightsConfirmed(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#111111" }}
                    />
                    <span>I confirm that I own or have legal commercial rights to all submitted assets & product trademarks.</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.84rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#111111" }}
                    />
                    <span>I agree to the production terms, creator commercial model release guidelines, and Meta ad compliance standards.</span>
                  </label>
                </div>

                {/* Back & Submit Controls */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button type="button" className="btn-video-cta" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft size={15} />
                    <span>Edit Inputs</span>
                  </button>
                  <button
                    type="button"
                    className="btn-primary-cta"
                    onClick={handleSubmitProject}
                    disabled={isSubmitting}
                    style={{ padding: "12px 28px" }}
                  >
                    <span>{isSubmitting ? "Starting Chamber..." : "Submit Project & Start Production ↗"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Summary Card (Right) */}
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717A", display: "block", marginBottom: "12px" }}>
              Project Summary
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "16px", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>Brand</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>{brandName || "Untitled Brand"}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>Category</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{category}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>Formats</span>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "2px" }}>
                  {formats.map((f) => (
                    <span key={f} style={{ background: "#F4F4F5", borderRadius: "4px", padding: "2px 6px", fontSize: "0.72rem", fontWeight: 600 }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>Duration</span>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{duration} seconds (~{Math.round(duration * 2.5)} words)</div>
              </div>
            </div>

            <div style={{ background: "#FAF9F6", borderRadius: "12px", padding: "12px", fontSize: "0.75rem", color: "#52525B", lineHeight: 1.45 }}>
              <strong style={{ display: "block", color: "#111111", marginBottom: "2px" }}>Production Pipeline:</strong>
              Real human on camera + AI subtitle & cutdown acceleration.
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Picker Modal */}
      {isPickerModalOpen && (
        <div className="cmd-backdrop" onClick={() => setIsPickerModalOpen(false)}>
          <div className="cmd-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="cmd-input-row" style={{ justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Select a Benchmark Reference</span>
              <button type="button" onClick={() => setIsPickerModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div className="cmd-results" style={{ maxHeight: "360px" }}>
              {SEED_ADS.map((ad) => (
                <div
                  key={ad.id}
                  className="cmd-item"
                  onClick={() => {
                    if (referenceUrls.length < 5) {
                      setReferenceUrls([...referenceUrls, `${ad.brand_name} - ${ad.title} (${ad.source_url})`]);
                    }
                    setIsPickerModalOpen(false);
                  }}
                >
                  <img src={ad.thumbnail_url || ""} alt="" style={{ width: "42px", height: "42px", borderRadius: "6px", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{ad.brand_name} — {ad.title}</div>
                    <div style={{ fontSize: "0.72rem", color: "#71717A" }}>Hook: {ad.hook_type}</div>
                  </div>
                  <Plus size={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CookieConsent />
    </div>
  );
}

export default function StudioWizardPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Creative Studio Chamber...</div>}>
      <StudioWizardContent />
    </Suspense>
  );
}
