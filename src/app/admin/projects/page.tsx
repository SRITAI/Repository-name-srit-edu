"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  FolderGit2,
  Clock,
  Video,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import type { ProjectStatus } from "@/lib/supabase/types";

interface AdminProject {
  id: string;
  brand_name: string;
  category_slug: string;
  goal: string;
  duration_seconds: number;
  status: ProjectStatus;
  creator_notes?: string;
  assigned_creator?: string;
  deliverable_url?: string;
  created_at: string;
}

const SAMPLE_ADMIN_PROJECTS: AdminProject[] = [
  {
    id: "proj_demo_101",
    brand_name: "GlowAura Botanicals",
    category_slug: "skincare",
    goal: "Sales & Meta Ads",
    duration_seconds: 30,
    status: "shooting",
    assigned_creator: "Elena Rostova (London, UK)",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "proj_demo_102",
    brand_name: "KINETIC Wear",
    category_slug: "clothing-fashion",
    goal: "Awareness & Reels Viral",
    duration_seconds: 15,
    status: "ai_enhancement",
    assigned_creator: "Marcus Thorne (LA, USA)",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "proj_demo_103",
    brand_name: "Intima Sensual",
    category_slug: "sexual-wellness",
    goal: "Brand Launch",
    duration_seconds: 45,
    status: "qa_review",
    assigned_creator: "Sophia & Liam (Berlin, DE)",
    deliverable_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "proj_demo_104",
    brand_name: "Solace Mushroom Gummies",
    category_slug: "health-supplements",
    goal: "Sales",
    duration_seconds: 30,
    status: "brief_review",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

const ALL_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "brief_review", label: "Brief Review" },
  { value: "script_approved", label: "Script Approved" },
  { value: "creator_assigned", label: "Creator Assigned" },
  { value: "shooting", label: "Shooting (Real Human)" },
  { value: "ai_enhancement", label: "AI Enhancement" },
  { value: "qa_review", label: "Human QA Review" },
  { value: "delivered", label: "Delivered" },
  { value: "revision_requested", label: "Revision Requested" },
  { value: "completed", label: "Completed" },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>(SAMPLE_ADMIN_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [editStatus, setEditStatus] = useState<ProjectStatus>("submitted");
  const [editCreator, setEditCreator] = useState("");
  const [editDeliverable, setEditDeliverable] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    async function loadProjects() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setProjects(data as unknown as AdminProject[]);
      }
    }
    loadProjects();
  }, []);

  const openModal = (proj: AdminProject) => {
    setSelectedProject(proj);
    setEditStatus(proj.status);
    setEditCreator(proj.assigned_creator || "");
    setEditDeliverable(proj.deliverable_url || "");
  };

  const handleUpdate = async () => {
    if (!selectedProject) return;
    setSaving(true);

    const updated = projects.map((p) =>
      p.id === selectedProject.id
        ? {
            ...p,
            status: editStatus,
            assigned_creator: editCreator,
            deliverable_url: editDeliverable,
          }
        : p
    );
    setProjects(updated);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase
        .from("projects")
        .update({
          status: editStatus,
          assigned_creator: editCreator || null,
          deliverable_url: editDeliverable || null,
        })
        .eq("id", selectedProject.id);

      // Log status event
      await supabase.from("project_events").insert({
        project_id: selectedProject.id,
        event_type: "status_change",
        to_status: editStatus,
        notes: `Updated by Admin: assigned to ${editCreator || "unassigned"}`,
      });
    }

    setSaving(false);
    setSelectedProject(null);
  };

  const filtered = projects.filter((p) => {
    if (filterCategory === "all") return true;
    return p.category_slug === filterCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#111111]">Projects Queue</h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Track video projects through the Human + AI production pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-white border border-black/10 rounded-full px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="skincare">Skincare</option>
            <option value="clothing-fashion">Clothing & Fashion</option>
            <option value="sexual-wellness">Sexual Wellness</option>
            <option value="health-supplements">Health Supplements</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 border-b border-black/[0.04] text-[#6B6B6B] uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-5">Brand & Goal</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Creator</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map((proj) => (
                <tr key={proj.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#111111]">{proj.brand_name}</div>
                    <div className="text-[11px] text-[#6B6B6B]">{proj.goal}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-neutral-100 text-[#111111] text-[10px] font-medium">
                      {proj.category_slug.replace("-", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#6B6B6B]">
                    <span>{proj.duration_seconds}s</span> · <span>9:16</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        proj.status === "delivered" || proj.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : proj.status === "shooting"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : proj.status === "ai_enhancement"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="capitalize">{proj.status.replace("_", " ")}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {proj.assigned_creator ? (
                      <span className="text-[#111111] font-medium flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{proj.assigned_creator}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openModal(proj)}
                      className="px-3 py-1 rounded-full border border-black/10 hover:border-black/30 font-medium text-[11px] text-[#111111] bg-white hover:bg-neutral-50 transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="font-semibold text-base text-[#111111]">
                  Manage {selectedProject.brand_name}
                </h3>
                <p className="text-xs text-[#6B6B6B]">ID: {selectedProject.id}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-neutral-400 hover:text-[#111111] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#111111] mb-1">Pipeline Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-neutral-50 focus:outline-none focus:border-black text-xs"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#111111] mb-1">
                  Assigned Real Human Creator
                </label>
                <input
                  type="text"
                  value={editCreator}
                  onChange={(e) => setEditCreator(e.target.value)}
                  placeholder="e.g. Rachel Adams (LA) - Fashion & Beauty"
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-neutral-50 focus:outline-none focus:border-black text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#111111] mb-1">
                  Deliverable Video URL (MP4 / Preview)
                </label>
                <input
                  type="url"
                  value={editDeliverable}
                  onChange={(e) => setEditDeliverable(e.target.value)}
                  placeholder="https://your-bucket.supabase.co/storage/v1/object/public/deliverables/..."
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-neutral-50 focus:outline-none focus:border-black text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#6B6B6B] hover:text-[#111111]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="px-5 py-2 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Pipeline State"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
