"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus, Film, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Project } from "@/lib/supabase/types";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem("infimindss_my_projects") || "[]");
      setProjects(local);
    } catch {}
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "#10B981";
      case "shooting":
      case "ai_enhancement":
        return "#0081FB";
      case "brief_review":
      case "creator_assigned":
        return "#F59E0B";
      default:
        return "#71717A";
    }
  };

  return (
    <div className="presentation-wrapper" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="window-frame" style={{ maxWidth: "1140px", margin: "0 auto", padding: "28px" }}>
        {/* Navigation Bar */}
        <header className="header" style={{ marginBottom: "32px" }}>
          <Link href="/" className="brand-logo" aria-label="infimindss Home">
            infimindss<span className="logo-degree">°</span>
          </Link>

          <nav className="nav-pill" aria-label="Main Navigation">
            <Link href="/" className="nav-item">Home</Link>
            <Link href="/explore" className="nav-item">Explore</Link>
            <Link href="/studio" className="nav-item">Studio</Link>
            <Link href="/studio/projects" className="nav-item active">My Projects</Link>
          </nav>

          <div className="header-right">
            <Link href="/studio" className="btn-get-app">
              <span>Start new project</span>
              <Plus size={14} />
            </Link>
          </div>
        </header>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Link href="/studio" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#71717A", textDecoration: "none", marginBottom: "10px" }}>
              <ArrowLeft size={14} /> Back to Studio
            </Link>
            <h1 className="section-title">
              My Video <em>Projects.</em>
            </h1>
            <p className="section-desc">Track real-time shoot schedules, AI cutdown progress, and delivered commercial assets.</p>
          </div>

          <Link href="/studio" className="btn-primary-cta">
            <Plus size={15} />
            <span>Create Video Project</span>
          </Link>
        </div>

        {/* Projects List */}
        {projects.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/studio/projects/${proj.id}`}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "18px",
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  color: "inherit",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{proj.brand_name || "Untitled Project"}</h3>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#FAF9F6",
                        color: getStatusColor(proj.status),
                        border: `1px solid ${getStatusColor(proj.status)}30`,
                      }}
                    >
                      {proj.status.replace("_", " ")}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#71717A", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <span>Category: {proj.category_id}</span>
                    <span>Formats: {Array.isArray(proj.formats) ? proj.formats.join(", ") : "9:16"}</span>
                    <span>Duration: {proj.duration_seconds}s</span>
                    <span>Created: {new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#71717A" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Track Timeline</span>
                  <ChevronRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "60px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
            <Film size={36} color="#A1A1AA" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>No active video projects yet</h3>
            <p style={{ fontSize: "0.88rem", color: "#71717A", maxWidth: "420px", margin: "0 auto 24px auto" }}>
              Brief your first project in the Studio chamber. Choose to write a script, upload product images, or drop a Drive link.
            </p>
            <Link href="/studio" className="btn-primary-cta" style={{ display: "inline-flex" }}>
              <span>Start your first project ↗</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
