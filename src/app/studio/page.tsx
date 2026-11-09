"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Sparkles,
  FileText,
  Image as ImageIcon,
  FolderSymlink,
  AlertCircle,
  X,
  Plus,
  ShieldCheck,
  Video,
  Clock,
  Trash2,
  Users,
  Loader2,
  Wand2,
  ChevronDown,
  ChevronUp,
  Link2,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";
import { SEED_CATEGORIES, SEED_ADS } from "@/lib/data/seed-data";
import { createClient } from "@/lib/supabase/client";

interface DriveLinkState {
  url: string;
  kind: "file" | "folder";
  id?: string;
  valid?: boolean;
}

interface ProductImageItem {
  id: string;
  url: string;
  name: string;
  isPrimary: boolean;
  progress: number;
}

function StudioWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefill from URL query params
  const initialCategory = searchParams.get("category") || "clothing-fashion";
  const initialRef = searchParams.get("ref") || "";
  const initialTitle = searchParams.get("title") || "";

  // Wizard Step (1: Brief, 2: Input, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Search palette modal state
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);

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

  // Real Human Creator Preference
  const [creatorGender, setCreatorGender] = useState("Any / Best Fit");
  const [creatorAge, setCreatorAge] = useState("20–30s");
  const [creatorLookNotes, setCreatorLookNotes] = useState("");

  // References
  const [referenceUrls, setReferenceUrls] = useState<string[]>(
    initialRef ? [`Reference Ad: ${initialTitle || initialRef}`] : []
  );
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  // STEP 2 — Input Modes (Multi-select: 'script' | 'product_images' | 'drive_link')
  const [selectedModes, setSelectedModes] = useState<("script" | "product_images" | "drive_link")[]>([
    "script",
  ]);

  // Mode 1: Script
  const [scriptText, setScriptText] = useState("");
  const [scriptHook, setScriptHook] = useState("");
  const [scriptCta, setScriptCta] = useState("");
  const [scriptSource, setScriptSource] = useState<"client" | "ai_draft">("client");

  // Mode 2: Product Images & AI Script
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [productName, setProductName] = useState("");
  const [productBenefits, setProductBenefits] = useState<string[]>(["", "", ""]);
  const [productUsp, setProductUsp] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGeneratingAiScript, setIsGeneratingAiScript] = useState(false);
  const [aiScriptOptions, setAiScriptOptions] = useState<any[]>([]);

  // Mode 3: Drive Links
  const [driveLinks, setDriveLinks] = useState<DriveLinkState[]>([]);
  const [driveInput, setDriveInput] = useState("");
  const [driveError, setDriveError] = useState("");

  // STEP 3 — Review & Confirmations
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedProjectId, setSubmittedProjectId] = useState<string | null>(null);

  // Autosave status & timestamp
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Restore autosaved draft safely
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
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
          if (parsed.selectedModes) setSelectedModes(parsed.selectedModes);
          setLastSavedTime("Restored from draft");
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Autosave to localStorage on form changes safely
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
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
          selectedModes,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("infimindss_studio_draft", JSON.stringify(draft));
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }
    } catch {
      // Ignore quota or private browsing errors
    }
  }, [
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
    selectedModes,
  ]);

  // Mode Selection Toggle (Multi-select)
  const toggleMode = (mode: "script" | "product_images" | "drive_link") => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

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

  // Spoken duration estimate (~2.5 words/sec)
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round(wordCount / 2.5);
  const isTooLong = estimatedSeconds > duration + 3;

  // Google Drive regex validation
  const handleAddDriveLink = () => {
    setDriveError("");
    const trimmed = driveInput.trim();
    if (!trimmed) return;

    const fileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const folderRegex = /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/;
    const openRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;

    const fileMatch = trimmed.match(fileRegex);
    const folderMatch = trimmed.match(folderRegex);
    const openMatch = trimmed.match(openRegex);

    if (folderMatch) {
      setDriveLinks([
        ...driveLinks,
        { url: trimmed, kind: "folder", id: folderMatch[1], valid: true },
      ]);
      setDriveInput("");
    } else if (fileMatch) {
      setDriveLinks([
        ...driveLinks,
        { url: trimmed, kind: "file", id: fileMatch[1], valid: true },
      ]);
      setDriveInput("");
    } else if (openMatch) {
      setDriveLinks([
        ...driveLinks,
        { url: trimmed, kind: "file", id: openMatch[1], valid: true },
      ]);
      setDriveInput("");
    } else {
      setDriveError(
        "Please paste a valid Google Drive file or folder sharing link (e.g. drive.google.com/drive/folders/...)"
      );
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const newItems: ProductImageItem[] = files.map((file, idx) => ({
      id: `img_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
      isPrimary: productImages.length === 0 && idx === 0,
      progress: 100,
    }));
    setProductImages((prev) => [...prev, ...newItems]);
  };

  // AI Script Drafting
  const handleGenerateAiScript = async () => {
    if (!productName.trim() && productImages.length === 0) {
      setErrorMsg("Please enter a product name or upload product images first.");
      return;
    }

    setIsGeneratingAiScript(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/studio/draft-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          duration,
          tone,
          productBenefits: productBenefits.filter(Boolean),
          productUsp,
          targetAudience,
        }),
      });

      const data = await res.json();
      if (data.scripts && data.scripts.length > 0) {
        setAiScriptOptions(data.scripts);
      } else {
        // Fallback generator
        setAiScriptOptions([
          {
            hook: `Stop scrolling if you care about your ${category.replace("-", " ")} routine.`,
            body: `${productName || "Our formula"} delivers visible real-human results in under 7 days. Zero filler, pure performance.`,
            cta: `Tap below to try it risk-free today.`,
          },
        ]);
      }
    } catch {
      setAiScriptOptions([
        {
          hook: `The single biggest mistake people make with ${category.replace("-", " ")}:`,
          body: `${productName || "Our formula"} was engineered specifically to solve this problem without the hassle.`,
          cta: `Tap the link to get 20% off your first order.`,
        },
      ]);
    } finally {
      setIsGeneratingAiScript(false);
    }
  };

  const handleApplyAiScript = (opt: any) => {
    const full = `[HOOK - 0 to 3s]:\n"${opt.hook}"\n\n[BODY - 3 to ${duration - 8}s]:\n"${opt.body}"\n\n[CTA - ${duration - 8} to ${duration}s]:\n"${opt.cta}"`;
    setScriptText(full);
    setScriptHook(opt.hook);
    setScriptCta(opt.cta);
    setScriptSource("ai_draft");
    if (!selectedModes.includes("script")) {
      setSelectedModes([...selectedModes, "script"]);
    }
  };

  // Step 1 Validation
  const handleProceedToStep2 = () => {
    if (!brandName.trim()) {
      setErrorMsg("Please provide your Brand or Product name.");
      return;
    }
    setErrorMsg("");
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleProceedToStep3 = () => {
    const hasScript = selectedModes.includes("script") && scriptText.trim().length > 0;
    const hasImages = selectedModes.includes("product_images") && (productImages.length > 0 || productName.trim().length > 0);
    const hasDrive = selectedModes.includes("drive_link") && driveLinks.length > 0;

    if (!hasScript && !hasImages && !hasDrive) {
      setErrorMsg("Please provide at least ONE input: write a script, upload product images, or paste a Google Drive link.");
      return;
    }
    setErrorMsg("");
    setCurrentStep(3);
  };

  // Final Submit
  const handleSubmitProject = async () => {
    if (!rightsConfirmed || !termsAgreed) {
      setErrorMsg("Please confirm asset ownership rights and agree to production terms.");
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
        input_modes: selectedModes,
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

      // Safely insert to Supabase if configured
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
          // Continue safely with local save
        }
      }

      // Save locally to projects list
      try {
        if (typeof window !== "undefined") {
          const existing = JSON.parse(
            localStorage.getItem("infimindss_my_projects") || "[]"
          );
          existing.unshift(projectPayload);
          localStorage.setItem("infimindss_my_projects", JSON.stringify(existing));
          localStorage.removeItem("infimindss_studio_draft");
        }
      } catch {}

      // Trigger success state
      setSubmittedProjectId(projectId);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit project. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="presentation-wrapper" style={{ minHeight: "100vh", padding: "16px" }}>
      <div className="window-frame" style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 32px 48px 32px" }}>
        {/* Navigation Bar */}
        <Navbar activeRoute="studio" onOpenSearch={() => setIsCmdOpen(true)} />

        {/* Success View (Calm Success Card with Confetti & Next Steps) */}
        {submittedProjectId ? (
          <div style={{ maxWidth: "680px", margin: "48px auto", textAlign: "center" }}>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "32px",
                padding: "48px 36px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 20px 50px -10px rgba(0,0,0,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Confetti Sparkles Effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #10B981, #06B6D4, #8B5CF6, #F59E0B)",
                }}
              />

              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px auto",
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2)",
                }}
              >
                <Check size={32} strokeWidth={2.5} />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full w-fit mx-auto mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Brief Locked & Received</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif text-[#111111] mb-3 leading-tight">
                We got your brief. <br />
                <span className="italic font-normal">Real creators on camera are being briefed.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#71717A] mb-8 leading-relaxed max-w-md mx-auto">
                Your campaign <strong>{brandName}</strong> has entered our Human + AI production pipeline.
                Zero robotic avatars. 100% human-verified commercial footage.
              </p>

              {/* Next Steps Timeline */}
              <div
                style={{
                  background: "#FAF9F6",
                  borderRadius: "20px",
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  textAlign: "left",
                  marginBottom: "32px",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111111", marginBottom: "16px" }}>
                  What happens next:
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-[#111111]">Producer Review & Angle Lock:</strong> Script and visual angle vetted for Meta ad policy compliance (<span className="text-emerald-700">under 4 hours</span>).
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-[#111111]">Real Creator Shoot:</strong> Vetted on-camera creator records authentic hooks, b-roll, and demonstrations.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-[#111111]">AI Polish & Multi-Ratio Delivery:</strong> Word-by-word kinetic captions, audio cleaning, and 9:16 / 4:5 / 1:1 exports.
                    </div>
                  </div>
                </div>
              </div>

              {/* View Project Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/studio/projects/${submittedProjectId}?success=true`}
                  className="btn-start-project"
                  style={{ padding: "0 28px", height: "48px" }}
                >
                  <span>View Project Timeline</span>
                  <span className="btn-arrow-circle" aria-hidden="true">
                    <ArrowUpRight size={14} className="btn-arrow-icon primary" />
                    <ArrowUpRight size={14} className="btn-arrow-icon clone" />
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedProjectId(null);
                    setCurrentStep(1);
                    setBrandName("");
                    setScriptText("");
                    setProductImages([]);
                    setDriveLinks([]);
                  }}
                  className="px-5 py-3 rounded-full border border-black/10 hover:border-black/25 text-xs font-semibold text-[#111111] bg-white transition-colors"
                >
                  Brief Another Campaign
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Block with Floating Mini-Cards (Task C) */}
            <div style={{ position: "relative", margin: "24px 0 36px 0", textAlign: "center" }}>
              {/* Floating Mini-Card Left */}
              <div
                className="hidden lg:flex"
                style={{
                  position: "absolute",
                  left: "2%",
                  top: "10px",
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "16px",
                  padding: "12px 16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                  transform: "rotate(-3deg)",
                  alignItems: "center",
                  gap: "10px",
                  zIndex: 2,
                }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111111" }}>Real Creators</div>
                  <div style={{ fontSize: "0.68rem", color: "#71717A" }}>Vetted humans on camera</div>
                </div>
              </div>

              {/* Floating Mini-Card Right */}
              <div
                className="hidden lg:flex"
                style={{
                  position: "absolute",
                  right: "2%",
                  top: "15px",
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "16px",
                  padding: "12px 16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                  transform: "rotate(2.5deg)",
                  alignItems: "center",
                  gap: "10px",
                  zIndex: 2,
                }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FAF5FF", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wand2 size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111111" }}>AI Velocity</div>
                  <div style={{ fontSize: "0.68rem", color: "#71717A" }}>48-hr first cut</div>
                </div>
              </div>

              {/* Center Title & Subheading */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full w-fit mx-auto mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>✦ Studio Chamber</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#111111] leading-tight mb-2">
                Brief us once. <br />
                <span className="italic font-normal">We'll make it feel human.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#71717A] max-w-lg mx-auto leading-relaxed">
                Real creators on camera. AI to make it fast. Zero robotic videos.
              </p>

              {/* Stepper Progress Bar */}
              <div style={{ maxWidth: "480px", margin: "28px auto 0 auto" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#FFFFFF",
                    borderRadius: "9999px",
                    padding: "6px 8px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      background: currentStep === 1 ? "#111111" : "transparent",
                      color: currentStep === 1 ? "#FFFFFF" : currentStep > 1 ? "#10B981" : "#71717A",
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: currentStep === 1 ? "#FFFFFF" : currentStep > 1 ? "#10B981" : "#E4E4E7",
                        color: currentStep === 1 ? "#111111" : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      {currentStep > 1 ? <Check size={11} strokeWidth={3} /> : "1"}
                    </span>
                    <span>1. Brief</span>
                  </button>

                  <div style={{ flex: 1, height: "2px", background: currentStep >= 2 ? "#111111" : "#E4E4E7", margin: "0 6px", transition: "all 0.3s ease" }} />

                  <button
                    type="button"
                    onClick={() => {
                      if (brandName.trim()) setCurrentStep(2);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      background: currentStep === 2 ? "#111111" : "transparent",
                      color: currentStep === 2 ? "#FFFFFF" : currentStep > 2 ? "#10B981" : "#71717A",
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: brandName.trim() ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: currentStep === 2 ? "#FFFFFF" : currentStep > 2 ? "#10B981" : "#E4E4E7",
                        color: currentStep === 2 ? "#111111" : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      {currentStep > 2 ? <Check size={11} strokeWidth={3} /> : "2"}
                    </span>
                    <span>2. Input</span>
                  </button>

                  <div style={{ flex: 1, height: "2px", background: currentStep >= 3 ? "#111111" : "#E4E4E7", margin: "0 6px", transition: "all 0.3s ease" }} />

                  <button
                    type="button"
                    onClick={() => {
                      if (brandName.trim()) setCurrentStep(3);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      background: currentStep === 3 ? "#111111" : "transparent",
                      color: currentStep === 3 ? "#FFFFFF" : "#71717A",
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: brandName.trim() ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: currentStep === 3 ? "#FFFFFF" : "#E4E4E7",
                        color: currentStep === 3 ? "#111111" : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      3
                    </span>
                    <span>3. Review</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div
                style={{
                  maxWidth: "920px",
                  margin: "0 auto 20px auto",
                  padding: "12px 18px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "14px",
                  color: "#991B1B",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Main Studio Grid (Left 65% Card, Right 35% Sticky Summary) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "28px",
                alignItems: "start",
              }}
              className="lg:grid-cols-[1fr_360px]"
            >
              {/* Left Column: Active Step Card */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "28px",
                  padding: "36px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                }}
              >
                {/* STEP 1: BRIEF */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif text-[#111111]">
                        1. Campaign Brief & Specifications
                      </h2>
                      <p className="text-xs text-[#71717A] mt-1">
                        Tell us who you are, what goal you have, and who should shoot the video.
                      </p>
                    </div>

                    {/* Brand Name & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Brand / Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="e.g. Lumiere Botanicals"
                          className="w-full px-4 py-2.5 rounded-2xl border border-black/10 focus:border-black focus:outline-none text-xs bg-neutral-50/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Website or Instagram Handle (Optional)
                        </label>
                        <input
                          type="text"
                          value={brandLink}
                          onChange={(e) => setBrandLink(e.target.value)}
                          placeholder="e.g. instagram.com/lumierebotanicals"
                          className="w-full px-4 py-2.5 rounded-2xl border border-black/10 focus:border-black focus:outline-none text-xs bg-neutral-50/60"
                        />
                      </div>
                    </div>

                    {/* Category Selector with 18+ tag */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-2">
                        Select Category <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SEED_CATEGORIES.map((cat) => {
                          const isSelected = category === cat.slug;
                          return (
                            <button
                              key={cat.slug}
                              type="button"
                              onClick={() => setCategory(cat.slug)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                                  : "bg-white text-[#111111] border-black/10 hover:border-black/25"
                              }`}
                            >
                              <span>{cat.icon || "✦"}</span>
                              <span>{cat.name}</span>
                              {cat.is_adult && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    isSelected
                                      ? "bg-rose-500 text-white"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  18+
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Goal & Target Platform */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Campaign Goal
                        </label>
                        <select
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl border border-black/10 focus:border-black focus:outline-none text-xs bg-neutral-50/60"
                        >
                          <option value="Sales & Conversions">Sales & Conversions (Meta Ads)</option>
                          <option value="Viral Organic Reach">Viral Organic Reach (Instagram Reels)</option>
                          <option value="Product Launch">New Product Launch</option>
                          <option value="Brand Awareness">Brand Awareness & Trust</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Primary Platform
                        </label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl border border-black/10 focus:border-black focus:outline-none text-xs bg-neutral-50/60"
                        >
                          <option value="Instagram Reels & Meta Ads">Instagram Reels & Meta Ads</option>
                          <option value="TikTok & Reels">TikTok & Reels</option>
                          <option value="YouTube Shorts">YouTube Shorts</option>
                          <option value="Omnichannel">All Social Platforms</option>
                        </select>
                      </div>
                    </div>

                    {/* Aspect Ratios & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Delivery Ratios (Multi-select)
                        </label>
                        <div className="flex gap-2">
                          {["9:16", "4:5", "1:1"].map((fmt) => {
                            const isSel = formats.includes(fmt);
                            return (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => toggleFormat(fmt)}
                                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                  isSel
                                    ? "bg-[#111111] text-white border-[#111111]"
                                    : "bg-neutral-50 text-[#111111] border-black/10 hover:border-black/20"
                                }`}
                              >
                                {fmt} {fmt === "9:16" ? "(Reel)" : fmt === "4:5" ? "(Feed)" : "(Square)"}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Target Duration
                        </label>
                        <div className="flex gap-2">
                          {[15, 30, 45, 60].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setDuration(sec)}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                duration === sec
                                  ? "bg-[#111111] text-white border-[#111111]"
                                  : "bg-neutral-50 text-[#111111] border-black/10 hover:border-black/20"
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Real Human Creator Preference */}
                    <div className="p-4 rounded-2xl bg-neutral-50/70 border border-black/[0.06] space-y-3">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-700" />
                        <span className="text-xs font-bold text-[#111111]">
                          Real Human Creator Casting Preference
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] leading-relaxed">
                        We cast vetted on-camera creators with signed commercial model releases. We never generate synthetic artificial faces.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                            Creator Gender
                          </label>
                          <select
                            value={creatorGender}
                            onChange={(e) => setCreatorGender(e.target.value)}
                            className="w-full p-2 rounded-xl border border-black/10 bg-white text-xs"
                          >
                            <option value="Any / Best Fit">Any / Best Fit for Category</option>
                            <option value="Female">Female Creator</option>
                            <option value="Male">Male Creator</option>
                            <option value="Duo / Couple">Couple / Duo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                            Age Bracket
                          </label>
                          <select
                            value={creatorAge}
                            onChange={(e) => setCreatorAge(e.target.value)}
                            className="w-full p-2 rounded-xl border border-black/10 bg-white text-xs"
                          >
                            <option value="20–30s">Early 20s – 30s (Gen Z / Young Millennial)</option>
                            <option value="30s–40s">30s – 40s (Established Adult)</option>
                            <option value="40s+">40s+ (Mature / Expert Persona)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Step 1 CTA */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleProceedToStep2}
                        className="btn-start-project"
                        style={{ height: "46px" }}
                      >
                        <span>Continue to Step 2: Input</span>
                        <span className="btn-arrow-circle" aria-hidden="true">
                          <ArrowRight size={13} className="btn-arrow-icon primary" />
                          <ArrowRight size={13} className="btn-arrow-icon clone" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: INPUT MODES (BIG VISUAL CARDS — TASK C) */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif text-[#111111]">
                        2. How would you like to provide input?
                      </h2>
                      <p className="text-xs text-[#71717A] mt-1">
                        Select one or more input formats. Combine photos with your own script or Google Drive folder.
                      </p>
                    </div>

                    {/* 3 Selectable Big Visual Mode Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Card A: Script */}
                      <div
                        onClick={() => toggleMode("script")}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                          selectedModes.includes("script")
                            ? "border-[#111111] bg-white shadow-md transform -translate-y-0.5"
                            : "border-black/[0.08] bg-neutral-50/50 hover:border-black/25"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#111111]">
                            <FileText size={18} />
                          </div>
                          {selectedModes.includes("script") && (
                            <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111111]">I have a script</div>
                          <div className="text-[11px] text-[#71717A] mt-0.5 leading-snug">
                            Provide your own hook, dialogue and call to action.
                          </div>
                        </div>
                      </div>

                      {/* Card B: Product Pictures */}
                      <div
                        onClick={() => toggleMode("product_images")}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                          selectedModes.includes("product_images")
                            ? "border-[#111111] bg-white shadow-md transform -translate-y-0.5"
                            : "border-black/[0.08] bg-neutral-50/50 hover:border-black/25"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                            <ImageIcon size={18} />
                          </div>
                          {selectedModes.includes("product_images") && (
                            <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111111]">Upload product pictures</div>
                          <div className="text-[11px] text-[#71717A] mt-0.5 leading-snug">
                            Drop photos & we'll draft the script for you with AI.
                          </div>
                        </div>
                      </div>

                      {/* Card C: Drive Link */}
                      <div
                        onClick={() => toggleMode("drive_link")}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                          selectedModes.includes("drive_link")
                            ? "border-[#111111] bg-white shadow-md transform -translate-y-0.5"
                            : "border-black/[0.08] bg-neutral-50/50 hover:border-black/25"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <FolderSymlink size={18} />
                          </div>
                          {selectedModes.includes("drive_link") && (
                            <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111111]">Paste Drive link</div>
                          <div className="text-[11px] text-[#71717A] mt-0.5 leading-snug">
                            Share raw footage, b-roll or product assets folder.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mode Panel 1: Script Area */}
                    {selectedModes.includes("script") && (
                      <div className="p-5 rounded-2xl bg-neutral-50/60 border border-black/[0.06] space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                            <FileText size={14} />
                            <span>Script Dialogue & Visual Instructions</span>
                          </label>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-[#71717A]">
                              {wordCount} words ({scriptText.length} chars)
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                isTooLong
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-50 text-emerald-800"
                              }`}
                            >
                              Est. {estimatedSeconds}s / {duration}s target
                            </span>
                          </div>
                        </div>

                        <textarea
                          rows={6}
                          value={scriptText}
                          onChange={(e) => setScriptText(e.target.value)}
                          placeholder="[HOOK - 0 to 3s]:&#10;Creator pulls shirt out of cramped bag...&#10;&#10;[BODY - 3 to 22s]:&#10;'Stop scrolling if you hate wrinkled clothes...'&#10;&#10;[CTA - 22 to 30s]:&#10;'Get 20% off your first pack at the link below.'"
                          className="w-full p-3.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-xs bg-white font-mono leading-relaxed"
                        />

                        {isTooLong && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            <span>
                              Your script is approximately {estimatedSeconds} seconds spoken. Consider trimming to fit your {duration}s duration target.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode Panel 2: Product Images & AI Script Generator */}
                    {selectedModes.includes("product_images") && (
                      <div className="p-5 rounded-2xl bg-neutral-50/60 border border-black/[0.06] space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                            <ImageIcon size={14} />
                            <span>Product Photos & AI Script Studio</span>
                          </label>
                          <span className="text-[11px] text-[#71717A]">
                            PNG, JPG or WebP up to 10MB
                          </span>
                        </div>

                        {/* Drag & Drop Zone */}
                        <label
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files) {
                              processFiles(Array.from(e.dataTransfer.files));
                            }
                          }}
                          className={`block p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                            isDragging
                              ? "border-[#111111] bg-neutral-100"
                              : "border-black/15 bg-white hover:border-black/30"
                          }`}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-neutral-100 text-[#111111] flex items-center justify-center mx-auto mb-2">
                            <ImageIcon size={20} />
                          </div>
                          <div className="text-xs font-semibold text-[#111111]">
                            Drop your product photos here, or browse
                          </div>
                          <p className="text-[11px] text-[#71717A] mt-1">
                            High-res packaging, texture close-ups, or unboxings.
                          </p>
                        </label>

                        {/* Uploaded Thumbnails Grid */}
                        {productImages.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                            {productImages.map((img) => (
                              <div
                                key={img.id}
                                className="relative aspect-square rounded-xl overflow-hidden border border-black/10 group"
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-full object-cover"
                                />
                                {img.isPrimary && (
                                  <span className="absolute top-1.5 left-1.5 bg-[#111111] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProductImages(productImages.filter((p) => p.id !== img.id))
                                  }
                                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Product Detail Fields for Script Generation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                              Product Name
                            </label>
                            <input
                              type="text"
                              value={productName}
                              onChange={(e) => setProductName(e.target.value)}
                              placeholder="e.g. Ceramide Barrier Glaze"
                              className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                              Unique Selling Point (USP)
                            </label>
                            <input
                              type="text"
                              value={productUsp}
                              onChange={(e) => setProductUsp(e.target.value)}
                              placeholder="e.g. 72hr hydration without pore clogging"
                              className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs"
                            />
                          </div>
                        </div>

                        {/* AI Script Draft Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleGenerateAiScript}
                            disabled={isGeneratingAiScript}
                            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          >
                            {isGeneratingAiScript ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Generating Hook Options with AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} />
                                <span>✦ Draft high-converting script with AI</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Generated AI Options */}
                        {aiScriptOptions.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] font-bold text-[#111111] uppercase tracking-wider block">
                              AI Hook & Script Variations:
                            </span>
                            {aiScriptOptions.map((opt, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-white border border-purple-200/80 space-y-2"
                              >
                                <div className="text-xs text-[#111111]">
                                  <strong>Hook:</strong> "{opt.hook}"
                                </div>
                                <div className="text-[11px] text-[#71717A]">
                                  {opt.body}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleApplyAiScript(opt)}
                                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
                                >
                                  <span>Apply this script to project</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode Panel 3: Google Drive Link Area */}
                    {selectedModes.includes("drive_link") && (
                      <div className="p-5 rounded-2xl bg-neutral-50/60 border border-black/[0.06] space-y-3 animate-fadeIn">
                        <label className="block text-xs font-bold text-[#111111]">
                          Google Drive Asset Link (Raw clips, b-roll, logos)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={driveInput}
                            onChange={(e) => setDriveInput(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="flex-1 p-2.5 rounded-xl border border-black/10 bg-white text-xs focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={handleAddDriveLink}
                            className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                          >
                            Add Link
                          </button>
                        </div>

                        {driveError && (
                          <p className="text-[11px] text-red-600">{driveError}</p>
                        )}

                        <p className="text-[11px] text-[#71717A]">
                          Ensure your Google Drive link permission is set to <strong>"Anyone with the link can view"</strong> so our production team can review assets.
                        </p>

                        {driveLinks.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {driveLinks.map((link, i) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-xl bg-white border border-black/10 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FolderSymlink size={14} className="text-blue-600 flex-shrink-0" />
                                  <span className="truncate">{link.url}</span>
                                  {link.id && (
                                    <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                                      ID: {link.id.slice(0, 8)}...
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDriveLinks(driveLinks.filter((_, idx) => idx !== i))}
                                  className="text-neutral-400 hover:text-red-600 p-1"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 Buttons */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2.5 rounded-full border border-black/10 text-xs font-medium text-[#111111] hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Brief</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleProceedToStep3}
                        className="btn-start-project"
                        style={{ height: "46px" }}
                      >
                        <span>Continue to Step 3: Review</span>
                        <span className="btn-arrow-circle" aria-hidden="true">
                          <ArrowRight size={13} className="btn-arrow-icon primary" />
                          <ArrowRight size={13} className="btn-arrow-icon clone" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW & CONFIRM */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif text-[#111111]">
                        3. Final Review & Production Lock
                      </h2>
                      <p className="text-xs text-[#71717A] mt-1">
                        Review your campaign specifications before locking into our creator queue.
                      </p>
                    </div>

                    {/* Summary Blocks */}
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                            Brand & Category
                          </span>
                          <span className="font-semibold text-sm text-[#111111]">{brandName}</span>
                          <span className="ml-2 capitalize px-2 py-0.5 rounded-full bg-white text-[10px] font-medium border border-black/10">
                            {category.replace("-", " ")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs text-neutral-600 hover:text-black underline"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                            Formats & Duration
                          </span>
                          <span className="font-semibold text-sm text-[#111111]">
                            {duration} Seconds · {formats.join(", ")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs text-neutral-600 hover:text-black underline"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                            Input Provided
                          </span>
                          <span className="font-semibold text-sm text-[#111111]">
                            {scriptText ? "Custom Script" : ""}{" "}
                            {productImages.length > 0 ? `· ${productImages.length} Photos` : ""}{" "}
                            {driveLinks.length > 0 ? `· Drive Folder Linked` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs text-neutral-600 hover:text-black underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Checkbox Confirmations */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 text-xs text-[#111111] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rightsConfirmed}
                          onChange={(e) => setRightsConfirmed(e.target.checked)}
                          className="mt-0.5 rounded border-black/20 accent-[#111111] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          I confirm that I own all trademarks, logos, and product assets provided, or have full commercial authorization to commission this video ad.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 text-xs text-[#111111] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="mt-0.5 rounded border-black/20 accent-[#111111] w-4 h-4 cursor-pointer"
                        />
                        <span>
                          I agree to production terms, creator commercial model release standards, and Meta ad compliance policies.
                        </span>
                      </label>
                    </div>

                    {/* Step 3 Submit */}
                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2.5 rounded-full border border-black/10 text-xs font-medium text-[#111111] hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Input</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitProject}
                        disabled={isSubmitting || !rightsConfirmed || !termsAgreed}
                        className="btn-start-project"
                        style={{ height: "48px", padding: "0 28px" }}
                      >
                        <span>{isSubmitting ? "Locking Chamber..." : "Submit Project & Start Production ↗"}</span>
                        <span className="btn-arrow-circle" aria-hidden="true">
                          <ArrowRight size={13} className="btn-arrow-icon primary" />
                          <ArrowRight size={13} className="btn-arrow-icon clone" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Summary Card (Desktop) */}
              <div
                style={{
                  position: "sticky",
                  top: "24px",
                  background: "#FFFFFF",
                  borderRadius: "28px",
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                }}
                className="hidden lg:block space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                    Live Brief Summary
                  </span>
                  {lastSavedTime && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>Draft saved {lastSavedTime}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#71717A]">Brand</span>
                    <div className="font-bold text-[#111111] text-sm">
                      {brandName || "Untitled Campaign"}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#71717A]">Category</span>
                    <div className="font-semibold text-[#111111] capitalize">
                      {category.replace("-", " ")}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#71717A]">Formats & Time</span>
                    <div className="font-semibold text-[#111111]">
                      {formats.join(", ")} · {duration}s target
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#71717A]">Active Modes</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedModes.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-medium text-[#111111]"
                        >
                          {m === "script" ? "Script" : m === "product_images" ? "Product Photos" : "Drive Link"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pipeline Guarantee Pill */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-black/[0.04] text-[11px] text-[#71717A] leading-relaxed">
                  <div className="font-bold text-[#111111] flex items-center gap-1.5 mb-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Human + AI Guarantee</span>
                  </div>
                  Real creators shoot on camera. AI polishes kinetic subtitles and cutdowns. Zero synthetic avatars.
                </div>
              </div>
            </div>
          </>
        )}

        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
        <CookieConsent />
      </div>
    </div>
  );
}

export default function StudioWizardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px", textAlign: "center" }}>
          Loading Creative Studio Chamber...
        </div>
      }
    >
      <StudioWizardContent />
    </Suspense>
  );
}
