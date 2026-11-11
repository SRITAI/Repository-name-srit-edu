"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
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
  ExternalLink,
  Smartphone,
  Layers,
  ChevronDown,
  Info,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";
import {
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  Chip,
  ChoiceCard,
  SegmentedControl,
  Stepper,
  Dropzone,
  UploadedFile,
} from "@/components/ui";
import { SEED_CATEGORIES } from "@/lib/data/seed-data";
import { createClient } from "@/lib/supabase/client";

interface DriveLinkState {
  url: string;
  kind: "file" | "folder";
  id?: string;
  valid?: boolean;
}

const CATEGORY_ITEMS = [
  { id: "clothing-fashion", name: "Clothing & Fashion", icon: "👗", badge: undefined },
  { id: "skincare", name: "Skincare & Dermat", icon: "💧", badge: undefined },
  { id: "makeup-beauty", name: "Makeup & Beauty", icon: "✨", badge: undefined },
  { id: "sexual-wellness", name: "Sexual Wellness", icon: "🔞", badge: "18+", badgeVariant: "danger" as const },
  { id: "health-supplements", name: "Health Supplements", icon: "🌿", badge: undefined },
  { id: "jewellery-accessories", name: "Jewellery & Accessories", icon: "💎", badge: undefined },
  { id: "tech-electronics", name: "Tech & Gadgets", icon: "⚡", badge: undefined },
  { id: "food-beverage", name: "Food & Beverage", icon: "🍵", badge: undefined },
];

const GOAL_OPTIONS = [
  { value: "Sales & Conversions", label: "Sales & Conversions", description: "Direct-response UGC hooks optimized for ROAS" },
  { value: "Viral Brand Awareness", label: "Viral Brand Awareness", description: "High-retention storytelling built for algorithmic reach" },
  { value: "Product Launch Hook", label: "Product Launch Hook", description: "Punchy problem/solution reveal for new drops" },
  { value: "Meta Ad Scaling", label: "Meta Ad Scaling", description: "A/B testable creator hooks for Ads Manager" },
  { value: "Retargeting Social Proof", label: "Retargeting Social Proof", description: "Authentic customer testimonial and unboxing style" },
];

const PLATFORM_OPTIONS = [
  { value: "Instagram Reels & Meta Ads", label: "Instagram Reels & Meta Ads", description: "9:16 vertical ads + organic feed" },
  { value: "TikTok Organic + Spark Ads", label: "TikTok Organic + Spark Ads", description: "Fast-paced, native trend aesthetic" },
  { value: "YouTube Shorts", label: "YouTube Shorts", description: "High-hook retention vertical video" },
  { value: "Omnichannel Vertical", label: "Omnichannel Vertical (All Platforms)", description: "Universal 9:16 master cut with platform-safe margins" },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15s", badge: "Hook" },
  { value: 30, label: "30s", badge: "Standard" },
  { value: 45, label: "45s", badge: "Story" },
  { value: 60, label: "60s", badge: "Deep Dive" },
];

const GENDER_OPTIONS = [
  "Any / Best Fit",
  "Female Creator",
  "Male Creator",
  "Couple / Duo",
];

const AGE_OPTIONS = [
  { value: "18–25", label: "18–25 Gen-Z" },
  { value: "20–30s", label: "20–30s Millennial" },
  { value: "30–45", label: "30–45 Prime" },
  { value: "45+", label: "45+ Mature" },
];

function StudioWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Real Human Creator Preference
  const [creatorGender, setCreatorGender] = useState("Any / Best Fit");
  const [creatorAge, setCreatorAge] = useState("20–30s");
  const [creatorLookNotes, setCreatorLookNotes] = useState("");

  // References
  const [referenceUrls, setReferenceUrls] = useState<string[]>(
    initialRef ? [`Reference Ad: ${initialTitle || initialRef}`] : []
  );

  // STEP 2 — Input Modes
  const [selectedModes, setSelectedModes] = useState<("script" | "product_images" | "drive_link")[]>([
    "script",
  ]);

  // Mode 1: Script
  const [scriptText, setScriptText] = useState("");
  const [scriptHook, setScriptHook] = useState("");
  const [scriptCta, setScriptCta] = useState("");
  const [scriptSource, setScriptSource] = useState<"client" | "ai_draft">("client");

  // Mode 2: Product Images & AI Script
  const [productFiles, setProductFiles] = useState<UploadedFile[]>([]);
  const [productName, setProductName] = useState("");
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
    scriptText,
    productName,
    productUsp,
    selectedModes,
  ]);

  // Mode Selection Toggle
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
        "Please paste a valid Google Drive file or folder link (e.g. drive.google.com/drive/folders/...)"
      );
    }
  };

  // Image Upload Handler
  const handleFilesAdded = (files: File[]) => {
    const newItems: UploadedFile[] = files.map((file, idx) => ({
      id: `img_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
      isPrimary: productFiles.length === 0 && idx === 0,
    }));
    setProductFiles((prev) => [...prev, ...newItems]);
  };

  const handleFileRemoved = (id: string) => {
    setProductFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (filtered.length > 0 && !filtered.some((f) => f.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimary = (id: string) => {
    setProductFiles((prev) =>
      prev.map((f) => ({
        ...f,
        isPrimary: f.id === id,
      }))
    );
  };

  // AI Script Drafting
  const handleGenerateAiScript = async () => {
    if (!productName.trim() && productFiles.length === 0) {
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
          productUsp,
          targetAudience,
        }),
      });

      const data = await res.json();
      if (data.scripts && data.scripts.length > 0) {
        setAiScriptOptions(data.scripts);
      } else {
        setAiScriptOptions([
          {
            hook: `Stop scrolling if you care about real ${category.replace("-", " ")} results.`,
            body: `${productName || "Our formula"} was engineered specifically to solve this problem without the fluff. Real human skin, real visible difference in 7 days.`,
            cta: `Tap the link below to test it with a 30-day guarantee.`,
          },
        ]);
      }
    } catch {
      setAiScriptOptions([
        {
          hook: `The single biggest mistake people make with ${category.replace("-", " ")}:`,
          body: `${productName || "Our formula"} eliminates the guesswork with pure, active performance.`,
          cta: `Tap below to get yours delivered with 20% off today.`,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Validation
  const handleProceedToStep3 = () => {
    const hasScript = selectedModes.includes("script") && scriptText.trim().length > 0;
    const hasImages = selectedModes.includes("product_images") && (productFiles.length > 0 || productName.trim().length > 0);
    const hasDrive = selectedModes.includes("drive_link") && driveLinks.length > 0;

    if (!hasScript && !hasImages && !hasDrive) {
      setErrorMsg("Please provide at least ONE input: write a script, upload product images, or link Google Drive assets.");
      return;
    }
    setErrorMsg("");
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        creator_preference: {
          gender: creatorGender,
          age_range: creatorAge,
          look_notes: creatorLookNotes,
        },
        input_modes: selectedModes,
        script_text: scriptText,
        script_source: scriptSource,
        product_name: productName,
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
          }
        } catch {
          // Logged-out or unauthenticated demo submission
        }
      }

      // Also persist to localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`project_${projectId}`, JSON.stringify(projectPayload));
          localStorage.removeItem("infimindss_studio_draft");
        }
      } catch {}

      setSubmittedProjectId(projectId);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D7FF3D", "#8B6CFF", "#FFFFFF"],
        });
      } catch {}
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryImage = productFiles.find((f) => f.isPrimary) || productFiles[0];
  const selectedCategoryObj = CATEGORY_ITEMS.find((c) => c.id === category) || CATEGORY_ITEMS[0];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-accent-ink pb-16 sm:pb-28">
      {/* Navbar */}
      <Navbar onOpenSearch={() => setIsCmdOpen(true)} />

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="lime">✦ STUDIO CHAMBER</Badge>
            <Badge variant="outline">Meta-Ready 9:16</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
            Brief us once.{" "}
            <span className="font-serif italic text-accent font-normal block sm:inline">
              We&apos;ll make it feel human.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-text-muted">
            Real creators on camera + AI for speed. Meta-ready 9:16 ads delivered in 48 hours.
          </p>

          {/* Stepper Component */}
          <div className="pt-4">
            <Stepper
              currentStep={currentStep}
              onStepClick={(step) => {
                if (step === 1) setCurrentStep(1);
                if (step === 2 && brandName.trim()) setCurrentStep(2);
                if (step === 3 && brandName.trim()) setCurrentStep(3);
              }}
              canNavigateTo={(step) => {
                if (step === 1) return true;
                if (step === 2) return Boolean(brandName.trim());
                if (step === 3) return Boolean(brandName.trim());
                return false;
              }}
            />
          </div>
        </div>

        {/* Success View */}
        {submittedProjectId ? (
          <div className="max-w-3xl mx-auto bg-surface/80 border border-border backdrop-blur-xl rounded-[32px] p-8 sm:p-14 text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent text-accent flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(215,255,61,0.3)]">
              <Check className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans">
                We got your brief <span className="text-accent font-serif italic">✦</span>
              </h2>
              <p className="text-text-muted max-w-lg mx-auto text-sm sm:text-base">
                Your project <code className="text-accent font-mono bg-surface-2 px-2 py-0.5 rounded">{submittedProjectId}</code> has been received. Our production studio is matching you with a verified human creator.
              </p>
            </div>

            {/* 5-Step Human + AI Timeline */}
            <div className="p-6 rounded-2xl bg-surface-2/60 border border-border text-left space-y-4 max-w-lg mx-auto">
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Production Roadmap</span>
                <span className="text-accent">~48 Hr First Cut</span>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-5 h-5 rounded-full bg-accent text-accent-ink flex items-center justify-center text-[10px] font-bold">1</div>
                  <span className="font-medium">Brief Received &amp; Human Creative Review</span>
                  <Badge variant="lime" className="ml-auto text-[10px]">Active</Badge>
                </div>
                <div className="flex items-center gap-3 text-text-muted">
                  <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px]">2</div>
                  <span>Real Creator Matched &amp; Physical Product Shipped</span>
                  <span className="ml-auto text-xs font-mono">Day 1</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted">
                  <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px]">3</div>
                  <span>4K Studio &amp; Lifestyle Filming (No CGI actors)</span>
                  <span className="ml-auto text-xs font-mono">Day 2</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted">
                  <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px]">4</div>
                  <span>AI Rhythm Editing, Audio Polish &amp; Captions</span>
                  <span className="ml-auto text-xs font-mono">Day 2</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted">
                  <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px]">5</div>
                  <span>First Cut Delivery in 9:16 Meta-Ready Master</span>
                  <span className="ml-auto text-xs font-mono">48 Hours</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push(`/studio/projects/${submittedProjectId}`)}
              >
                View Project Dashboard
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSubmittedProjectId(null);
                  setCurrentStep(1);
                  setBrandName("");
                  setScriptText("");
                  setProductFiles([]);
                }}
              >
                Create Another Project
              </Button>
            </div>
          </div>
        ) : (
          /* Workspace Layout: 12-column grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 64% (8 Cols): Main Canvas Card */}
            <div className="lg:col-span-8 bg-surface/70 border border-border backdrop-blur-xl rounded-[32px] p-6 sm:p-10 shadow-2xl relative space-y-10">
              {/* STEP 1: BRIEF */}
              {currentStep === 1 && (
                <div className="space-y-10">
                  {/* Section 01: Brand Identifiers */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
                      <span>01 / BRAND IDENTIFIERS</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Brand or Product Name *"
                        placeholder="e.g. Lumina Botanicals"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        error={!brandName.trim() && errorMsg ? "Brand name is required" : undefined}
                      />
                      <Input
                        label="Website or Instagram Handle"
                        placeholder="e.g. @luminabotanicals or luminasite.com"
                        value={brandLink}
                        onChange={(e) => setBrandLink(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Section 02: Category Choice Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-accent uppercase tracking-wider">
                      <span>02 / INDUSTRY CATEGORY</span>
                      <span className="text-text-muted">Select 1 category</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CATEGORY_ITEMS.map((cat) => (
                        <ChoiceCard
                          key={cat.id}
                          title={cat.name}
                          icon={<span className="text-2xl">{cat.icon}</span>}
                          selected={category === cat.id}
                          badge={cat.badge}
                          badgeVariant={cat.badgeVariant}
                          onClick={() => {
                            if (cat.badge === "18+") {
                              setIsAgeGateOpen(true);
                            }
                            setCategory(cat.id);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Section 03: Campaign Goal & Target Platform */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
                      <span>03 / CAMPAIGN OBJECTIVE &amp; PLATFORM</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Campaign Objective"
                        value={goal}
                        onChange={setGoal}
                        options={GOAL_OPTIONS}
                      />
                      <Select
                        label="Primary Platform"
                        value={platform}
                        onChange={setPlatform}
                        options={PLATFORM_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* Section 04: Delivery Ratios (Visual Shapes) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-accent uppercase tracking-wider">
                      <span>04 / DELIVERY RATIOS (MULTI-SELECT)</span>
                      <span className="text-text-muted font-sans">Multi-format master</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <ChoiceCard
                        title="9:16 Vertical"
                        description="Reels, TikTok, Shorts"
                        ratioVisual="9:16"
                        selected={formats.includes("9:16")}
                        onClick={() => toggleFormat("9:16")}
                      />
                      <ChoiceCard
                        title="4:5 Portrait"
                        description="Meta In-Feed Ads"
                        ratioVisual="4:5"
                        selected={formats.includes("4:5")}
                        onClick={() => toggleFormat("4:5")}
                      />
                      <ChoiceCard
                        title="1:1 Square"
                        description="Feed &amp; Catalog"
                        ratioVisual="1:1"
                        selected={formats.includes("1:1")}
                        onClick={() => toggleFormat("1:1")}
                      />
                    </div>
                  </div>

                  {/* Section 05: Target Duration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-accent uppercase tracking-wider">
                      <span>05 / TARGET VIDEO DURATION</span>
                      <span className="text-text-muted font-sans font-mono">{duration}s target</span>
                    </div>
                    <SegmentedControl
                      options={DURATION_OPTIONS}
                      value={duration}
                      onChange={(val) => setDuration(Number(val))}
                    />
                  </div>

                  {/* Section 06: Real Human Creator Casting Preference */}
                  <div className="p-6 rounded-2xl bg-surface-2/70 border border-border space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="text-xs font-mono uppercase tracking-wider text-white">
                          06 / REAL CREATOR CASTING
                        </span>
                      </div>
                      <Badge variant="lime" className="text-[10px]">
                        ✦ HUMAN-VERIFIED · NO SYNTHETIC FACES
                      </Badge>
                    </div>

                    {/* Gender Chips */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-text-muted">
                        Creator Gender Preference
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {GENDER_OPTIONS.map((g) => (
                          <Chip
                            key={g}
                            label={g}
                            selected={creatorGender === g}
                            onClick={() => setCreatorGender(g)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Age Segmented */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-text-muted">
                        Age Range
                      </label>
                      <SegmentedControl
                        options={AGE_OPTIONS}
                        value={creatorAge}
                        onChange={setCreatorAge}
                      />
                    </div>

                    {/* Look / Vibe Notes */}
                    <Textarea
                      label="Creator Vibe / Aesthetic Notes (Optional)"
                      placeholder="e.g. Relatable everyday UGC creator, warm authentic smile, aesthetic bathroom counter setting..."
                      value={creatorLookNotes}
                      onChange={(e) => setCreatorLookNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Error display */}
                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-text-muted font-mono hidden sm:inline">
                      Step 1 of 3 · Brief Details
                    </span>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleProceedToStep2}
                      className="w-full sm:w-auto ml-auto"
                    >
                      Continue to Input
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: INPUT */}
              {currentStep === 2 && (
                <div className="space-y-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
                      <span>CHOOSE YOUR CREATIVE ASSET INPUTS</span>
                    </div>
                    <p className="text-sm text-text-muted">
                      Select one or more ways to provide your material. You can write a script, drop product photos, or link a Google Drive folder.
                    </p>
                  </div>

                  {/* 3 Large Multi-Select ChoiceCards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ChoiceCard
                      title="Script Ready"
                      description="You already have a script or key talking points"
                      icon={<FileText className="w-6 h-6 text-accent" />}
                      selected={selectedModes.includes("script")}
                      onClick={() => toggleMode("script")}
                    />
                    <ChoiceCard
                      title="Product Pictures"
                      description="Upload photos + let AI draft viral script hooks"
                      icon={<ImageIcon className="w-6 h-6 text-violet-400" />}
                      selected={selectedModes.includes("product_images")}
                      onClick={() => toggleMode("product_images")}
                    />
                    <ChoiceCard
                      title="Google Drive Link"
                      description="Share a folder with raw footage or brand assets"
                      icon={<FolderSymlink className="w-6 h-6 text-orange-400" />}
                      selected={selectedModes.includes("drive_link")}
                      onClick={() => toggleMode("drive_link")}
                    />
                  </div>

                  {/* Mode 1: SCRIPT PANEL */}
                  {selectedModes.includes("script") && (
                    <div className="p-6 rounded-2xl bg-surface-2/60 border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" />
                          <span className="text-xs font-mono uppercase tracking-wider text-white">
                            Script &amp; Talking Points
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text-muted">
                            ~{estimatedSeconds}s / {duration}s target
                          </span>
                          {isTooLong && (
                            <Badge variant="danger" className="text-[10px]">
                              Script too long
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Paste your hook, body talking points, and CTA here...&#10;&#10;[HOOK]: Stop scrolling if you want real results...&#10;[BODY]: Here is how Lumina works...&#10;[CTA]: Tap the link below to get 20% off!"
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        rows={7}
                        charCount={{ current: scriptText.length }}
                      />
                    </div>
                  )}

                  {/* Mode 2: PRODUCT PICTURES & AI DRAFT */}
                  {selectedModes.includes("product_images") && (
                    <div className="p-6 rounded-2xl bg-surface-2/60 border border-border space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-violet-400" />
                          <span className="text-xs font-mono uppercase tracking-wider text-white">
                            Product Photos &amp; AI Script Generator
                          </span>
                        </div>
                        <Badge variant="violet" className="text-[10px]">
                          AI-ASSISTED
                        </Badge>
                      </div>

                      {/* Dropzone */}
                      <Dropzone
                        files={productFiles}
                        onFilesAdded={handleFilesAdded}
                        onFileRemoved={handleFileRemoved}
                        onSetPrimary={handleSetPrimary}
                      />

                      {/* Product Name & USP */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Product Name"
                          placeholder="e.g. Lumina Clarifying Serum"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                        <Input
                          label="Key Benefit / USP"
                          placeholder="e.g. Clear skin in 7 days without drying"
                          value={productUsp}
                          onChange={(e) => setProductUsp(e.target.value)}
                        />
                      </div>

                      {/* AI Script Generator Button */}
                      <div className="pt-2">
                        <Button
                          variant="secondary"
                          onClick={handleGenerateAiScript}
                          isLoading={isGeneratingAiScript}
                          className="w-full sm:w-auto"
                        >
                          <Wand2 className="w-4 h-4 mr-2 text-accent" />
                          <span>Draft High-Converting Script Angles with AI</span>
                        </Button>
                      </div>

                      {/* Generated AI Script Options */}
                      {aiScriptOptions.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-mono uppercase tracking-wider text-accent">
                            ✦ AI Generated Hook Angles
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {aiScriptOptions.map((opt, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-xl bg-surface-3/80 border border-border space-y-2 hover:border-accent/40 transition-colors"
                              >
                                <div className="text-xs font-mono text-accent">Angle #{i + 1}</div>
                                <div className="text-sm font-semibold text-white">&ldquo;{opt.hook}&rdquo;</div>
                                <div className="text-xs text-text-muted">{opt.body}</div>
                                <div className="pt-2 flex justify-end">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleApplyAiScript(opt)}
                                  >
                                    Apply this Script
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 3: GOOGLE DRIVE LINK */}
                  {selectedModes.includes("drive_link") && (
                    <div className="p-6 rounded-2xl bg-surface-2/60 border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderSymlink className="w-4 h-4 text-orange-400" />
                          <span className="text-xs font-mono uppercase tracking-wider text-white">
                            Google Drive Assets Folder
                          </span>
                        </div>
                        <Badge variant="orange" className="text-[10px]">
                          CLOUD SYNC
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Paste link (drive.google.com/drive/folders/...)"
                          value={driveInput}
                          onChange={(e) => setDriveInput(e.target.value)}
                          error={driveError}
                        />
                        <Button
                          variant="secondary"
                          onClick={handleAddDriveLink}
                          className="sm:w-32 flex-shrink-0"
                        >
                          Add Link
                        </Button>
                      </div>

                      {driveLinks.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {driveLinks.map((dl, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-surface-3 border border-border flex items-center justify-between text-xs font-mono"
                            >
                              <div className="flex items-center gap-2 text-white truncate max-w-md">
                                <FolderSymlink className="w-4 h-4 text-accent flex-shrink-0" />
                                <span className="truncate">{dl.url}</span>
                              </div>
                              <button
                                onClick={() =>
                                  setDriveLinks(driveLinks.filter((_, idx) => idx !== i))
                                }
                                className="text-text-muted hover:text-danger p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-text-muted flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>Ensure the folder permission is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong></span>
                      </p>
                    </div>
                  )}

                  {/* Error display */}
                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Brief
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleProceedToStep3}
                    >
                      Continue to Review
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & SUBMIT */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
                      <span>REVIEW YOUR PRODUCTION BRIEF</span>
                    </div>
                    <p className="text-sm text-text-muted">
                      Verify your project specifications before submitting. Once dispatched, our production director reviews your brief within 2 hours.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-4">
                    {/* Card 1: Brand & Campaign */}
                    <div className="p-5 rounded-2xl bg-surface-2/60 border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                          Brand &amp; Campaign
                        </span>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-mono text-accent hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-text-faint">Brand</div>
                          <div className="font-semibold text-white">{brandName || "Untitled"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-faint">Category</div>
                          <div className="font-semibold text-white">{selectedCategoryObj.name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-faint">Objective</div>
                          <div className="font-semibold text-white">{goal}</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-faint">Platform</div>
                          <div className="font-semibold text-white">{platform}</div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Creative & Creator Preference */}
                    <div className="p-5 rounded-2xl bg-surface-2/60 border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                          Creator &amp; Specs
                        </span>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-mono text-accent hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-text-faint">Duration</div>
                          <div className="font-semibold text-white">{duration}s Master</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-faint">Ratios</div>
                          <div className="font-semibold text-white">{formats.join(", ")}</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-faint">Casting</div>
                          <div className="font-semibold text-white">{creatorGender} ({creatorAge})</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-faint">Actor Type</div>
                          <div className="font-semibold text-accent font-mono text-xs">Human-Verified</div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Inputs Provided */}
                    <div className="p-5 rounded-2xl bg-surface-2/60 border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                          Inputs Provided
                        </span>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-xs font-mono text-accent hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedModes.includes("script") && (
                          <Badge variant="lime">
                            ✓ Script ({wordCount} words)
                          </Badge>
                        )}
                        {selectedModes.includes("product_images") && (
                          <Badge variant="violet">
                            ✓ {productFiles.length} Product Photos
                          </Badge>
                        )}
                        {selectedModes.includes("drive_link") && (
                          <Badge variant="orange">
                            ✓ {driveLinks.length} Drive Assets
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rights and Terms Checkboxes */}
                  <div className="p-6 rounded-2xl bg-surface-2/40 border border-border space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rightsConfirmed}
                        onChange={(e) => setRightsConfirmed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-border bg-surface-3 text-accent accent-accent focus:ring-accent"
                      />
                      <span className="text-xs sm:text-sm text-text-muted">
                        I confirm ownership or commercial license for all uploaded brand assets, trademarks, and imagery.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-border bg-surface-3 text-accent accent-accent focus:ring-accent"
                      />
                      <span className="text-xs sm:text-sm text-text-muted">
                        I agree to production terms: 48-hour first cut delivery, 1 included creator revision cycle, and full commercial usage rights.
                      </span>
                    </label>
                  </div>

                  {/* Error display */}
                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Inputs
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSubmitProject}
                      isLoading={isSubmitting}
                      disabled={!rightsConfirmed || !termsAgreed}
                    >
                      Submit Project &amp; Dispatch Creator ↗
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right 36% (4 Cols): Sticky Production Preview Panel */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              {/* Phone Frame 9:16 Mockup */}
              <div className="bg-surface/90 border border-border backdrop-blur-xl rounded-[32px] p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                    Live Production Preview
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-mono text-accent">LIVE</span>
                  </div>
                </div>

                {/* The 9:16 Phone Device */}
                <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-[32px] bg-black/90 border-4 border-surface-3 shadow-2xl overflow-hidden p-4 flex flex-col justify-between">
                  {/* Background: uploaded primary image or ambient gradient */}
                  {primaryImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-60 transition-all duration-500 scale-105"
                      style={{ backgroundImage: `url(${primaryImage.url})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-surface via-bg to-black opacity-80" />
                  )}

                  {/* Subtle inner dark gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

                  {/* Top Phone Elements */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="truncate max-w-[100px]">{brandName || "Brand Name"}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-text-muted">
                      {formats[0] || "9:16"}
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="relative z-10 text-center space-y-2 my-auto py-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center mx-auto text-2xl shadow-lg">
                      {selectedCategoryObj.icon}
                    </div>
                    <div className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                      {selectedCategoryObj.name}
                    </div>
                    <div className="text-[11px] text-text-muted px-4 line-clamp-2">
                      {scriptText ? `"${scriptText.slice(0, 60)}..."` : "Real human UGC video ad tailored for maximum conversion."}
                    </div>
                  </div>

                  {/* Bottom Overlays */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                      <span>00:00</span>
                      <span className="text-accent font-semibold">00:{duration < 10 ? `0${duration}` : duration}</span>
                    </div>
                    {/* Live Progress Bar */}
                    <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full bg-accent w-2/3 rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-accent" />
                        <span>Real Creator</span>
                      </span>
                      <span className="font-mono text-white/80">{goal.split(" ")[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Key-Value Summary List */}
                <div className="space-y-2.5 pt-2 border-t border-border text-xs">
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Category</span>
                    <span className="text-white font-medium">{selectedCategoryObj.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Formats</span>
                    <span className="text-white font-medium">{formats.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Duration</span>
                    <span className="text-white font-medium">{duration} seconds</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Casting</span>
                    <span className="text-white font-medium">{creatorGender}</span>
                  </div>
                </div>

                {/* Draft saved status */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-faint">
                  <div className="flex items-center gap-1.5 text-accent/80">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Draft autosaved</span>
                  </div>
                  <span>{lastSavedTime || "Active"}</span>
                </div>

                {/* Estimated Delivery Box */}
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-white font-medium">Estimated 1st Cut</span>
                  </div>
                  <span className="text-accent font-bold font-mono">~48 Hours</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

      {/* Age Gate Modal for 18+ Categories */}
      <AgeGateModal
        isOpen={isAgeGateOpen}
        onConfirm={() => setIsAgeGateOpen(false)}
        onCancel={() => {
          setIsAgeGateOpen(false);
          setCategory("clothing-fashion");
        }}
      />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <StudioWizardContent />
    </Suspense>
  );
}
