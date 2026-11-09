"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Film,
  Download,
  AlertCircle,
  FolderSymlink,
  FileText,
  UserCheck,
  Send,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";

interface PageProps {
  params: Promise<{ id: string }>;
}

const TIMELINE_STEPS = [
  { key: "submitted", label: "Brief Submitted", role: "Client & Producer", desc: "Project brief, assets and preferences received." },
  { key: "brief_review", label: "Brief Review", role: "Executive Producer", desc: "Script and visual angle reviewed for Meta compliance." },
  { key: "script_approved", label: "Script Approved", role: "Client & Scriptwriter", desc: "Hook, body, and CTA finalized for on-camera shoot." },
  { key: "creator_assigned", label: "Creator Assigned", role: "Casting Producer", desc: "Vetted real human creator assigned with signed model release." },
  { key: "shooting", label: "Creator Shooting", role: "Real Human Creator", desc: "Real creator recording unboxings, hooks and wear tests." },
  { key: "ai_enhancement", label: "AI Enhancement", role: "AI Editing Suite", desc: "Kinetic subtitles, background noise cleaning, cutdowns in 9:16 / 4:5 / 1:1." },
  { key: "qa_review", label: "Quality Assurance", role: "Senior QA Director", desc: "Frame-by-frame human verification and color accuracy check." },
  { key: "delivered", label: "Delivered", role: "infimindss Studio", desc: "Commercial deliverables ready for ad deployment." },
];

function ProjectDetailContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const searchParams = useSearchParams();
  const showSuccessBanner = searchParams.get("success") === "true";

  const [project, setProject] = useState<any>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionSuccess, setRevisionSuccess] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("infimindss_my_projects") || "[]");
        const found = local.find((p: any) => p.id === projectId);
        if (found) {
          setProject(found);
        } else {
          // Fallback placeholder project
          setProject({
            id: projectId,
            brand_name: "Kite & Linen",
            category_id: "clothing-fashion",
            goal: "Sales & Conversions",
            platform: "Instagram Reels & Meta Ads",
            formats: ["9:16", "4:5"],
            duration_seconds: 30,
            status: "ai_enhancement",
            script_text: `[HOOK - 0 to 3s]:\n"Stop scrolling if you hate ironing your clothes."\n\n[BODY - 3 to 22s]:\n"This 100% organic linen shirt literally defies creases."\n\n[CTA - 22 to 30s]:\n"Tap below to claim 20% off launch discount."`,
            created_at: new Date().toISOString(),
            drive_links: [{ url: "https://drive.google.com/drive/folders/sample", kind: "folder" }],
          });
        }
      }
    } catch {}
  }, [projectId]);

  if (!project) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <p>Loading project chamber details...</p>
      </div>
    );
  }

  // Calculate timeline progress
  const currentStatusIndex = TIMELINE_STEPS.findIndex((s) => s.key === project.status);
  const activeIndex = currentStatusIndex !== -1 ? currentStatusIndex : 1;

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) return;
    setProject({ ...project, status: "revision_requested" });
    setRevisionSuccess(true);
    setTimeout(() => {
      setIsRevisionModalOpen(false);
      setRevisionSuccess(false);
    }, 1800);
  };

  return (
    <div className="presentation-wrapper" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="window-frame" style={{ maxWidth: "1240px", margin: "0 auto", padding: "32px" }}>
        {/* Navigation Bar */}
        <Navbar activeRoute="projects" onOpenSearch={() => setIsCmdOpen(true)} />

        {/* Success Banner after submission */}
        {showSuccessBanner && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#166534",
              borderRadius: "16px",
              padding: "16px 24px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 size={20} color="#166534" />
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>
                Project successfully launched! Your creative producer is reviewing the brief now.
              </span>
            </div>
            <span style={{ fontSize: "0.78rem", background: "#DCFCE7", padding: "4px 10px", borderRadius: "9999px" }}>
              Project ID: {projectId}
            </span>
          </div>
        )}

        {/* Back Link & Header */}
        <div style={{ marginBottom: "36px" }}>
          <Link
            href="/studio/projects"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              color: "#71717A",
              textDecoration: "none",
              marginBottom: "12px",
            }}
          >
            <ArrowLeft size={14} /> Back to My Projects
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <h1 className="section-title" style={{ fontSize: "2.4rem" }}>{project.brand_name || "Project Chamber"}</h1>
                {activeIndex >= 7 && (
                  <span
                    style={{
                      background: "#10B981",
                      color: "#FFFFFF",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ShieldCheck size={13} /> Human-Verified
                  </span>
                )}
              </div>
              <p style={{ color: "#71717A", fontSize: "0.88rem" }}>
                Category: <strong>{project.category_id}</strong> • Formats: {Array.isArray(project.formats) ? project.formats.join(", ") : "9:16"} • Target Duration: {project.duration_seconds}s
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn-video-cta"
                onClick={() => setIsRevisionModalOpen(true)}
                style={{ fontSize: "0.84rem" }}
              >
                Request Revision
              </button>
              <Link href="/studio" className="btn-primary-cta" style={{ fontSize: "0.84rem" }}>
                <span>Create New Project</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Production Pipeline Status Timeline (Human + AI Story) */}
        <section
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.06)",
            padding: "36px",
            marginBottom: "36px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717A" }}>
              Live Production Tracker
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "4px" }}>The Human + AI Timeline</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", position: "relative" }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={step.key}
                  style={{
                    background: isCurrent ? "#FAF9F6" : "#FFFFFF",
                    border: isCurrent ? "2px solid #111111" : "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "16px",
                    padding: "18px 16px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: isPast ? "#10B981" : isCurrent ? "#111111" : "#E4E4E7",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {isPast ? "✓" : idx + 1}
                    </span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#0081FB" }}>
                      {step.role}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "4px" }}>{step.label}</h4>
                  <p style={{ fontSize: "0.74rem", color: "#71717A", lineHeight: 1.4 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Two-Column Deliverables & Brief Assets Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "28px" }}>
          {/* Deliverables / Media Stage */}
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Film size={18} />
              <span>Commercial Deliverables</span>
            </h3>

            {/* Mock Deliverable Player */}
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "16px",
                background: "#18181B",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                marginBottom: "20px",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
              />
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ background: "rgba(0,0,0,0.6)", padding: "6px 14px", borderRadius: "9999px", fontSize: "0.82rem", fontWeight: 600 }}>
                  Master Cut (9:16 + 4:5 + 1:1) in QA Rendering
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" className="btn-primary-cta" style={{ fontSize: "0.82rem" }}>
                <Download size={14} />
                <span>Download Master Deliverables (ZIP)</span>
              </button>
              <button type="button" className="btn-video-cta" onClick={() => setIsRevisionModalOpen(true)} style={{ fontSize: "0.82rem" }}>
                <span>Request Creative Revision</span>
              </button>
            </div>
          </div>

          {/* Brief Assets & Script Details */}
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717A", marginBottom: "8px" }}>
                Script Breakdown
              </h4>
              <div
                style={{
                  background: "#FAF9F6",
                  borderRadius: "12px",
                  padding: "16px",
                  fontSize: "0.8rem",
                  color: "#3F3F46",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                {project.script_text || "No script provided — creative team drafting from product photos."}
              </div>
            </div>

            {project.drive_links?.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717A", marginBottom: "8px" }}>
                  Google Drive Assets
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {project.drive_links.map((d: any, idx: number) => (
                    <a
                      key={idx}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.8rem",
                        color: "#0081FB",
                        textDecoration: "none",
                        background: "#FAF9F6",
                        padding: "8px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <FolderSymlink size={14} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {isRevisionModalOpen && (
        <div className="cmd-backdrop" onClick={() => setIsRevisionModalOpen(false)}>
          <div className="cmd-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Request Creative Revision</h3>
              <button type="button" onClick={() => setIsRevisionModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {revisionSuccess ? (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                Revision notes submitted to producer!
              </div>
            ) : (
              <>
                <p style={{ fontSize: "0.84rem", color: "#71717A", marginBottom: "14px" }}>
                  Specify any subtitle adjustments, audio tweaks, color adjustments, or cut pacing updates:
                </p>
                <textarea
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    fontSize: "0.85rem",
                    marginBottom: "16px",
                    outline: "none",
                  }}
                  placeholder="e.g. Please speed up the hook transition at 0:02 and adjust subtitle color to brand yellow."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary-cta"
                  onClick={handleRequestRevision}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Send size={14} />
                  <span>Submit Revision Request</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </div>
  );
}

export default function ProjectDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center" }}>Loading project details...</div>}>
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}
