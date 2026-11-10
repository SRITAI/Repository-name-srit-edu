"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Search,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  FolderSymlink,
  Lock,
  Play,
  Layers,
  Sliders,
  Eye,
} from "lucide-react";

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
  BentoTile,
  VideoTile,
  UploadedFile,
} from "@/components/ui";

export default function DesignSystemKitPage() {
  const [selectedChip, setSelectedChip] = useState("option1");
  const [selectedCard, setSelectedCard] = useState("card1");
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [selectVal, setSelectVal] = useState("opt1");
  const [segmentedVal, setSegmentedVal] = useState(30);
  const [stepperStep, setStepperStep] = useState<1 | 2 | 3>(2);

  const [testFiles, setTestFiles] = useState<UploadedFile[]>([
    {
      id: "demo-1",
      name: "hero-product-shot.jpg",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
      isPrimary: true,
    },
    {
      id: "demo-2",
      name: "lifestyle-texture.jpg",
      url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
      isPrimary: false,
    },
  ]);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-accent-ink p-6 sm:p-12 space-y-16 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-2">
          <Badge variant="lime">INTERNAL DEV TOOL</Badge>
          <Badge variant="outline">QA Testbed</Badge>
        </div>
        <h1 className="text-4xl font-bold font-sans text-white">
          Design System <span className="font-serif italic text-accent">Component Matrix.</span>
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Visual QA suite verifying every state of all <code>components/ui/*</code> primitives.
          Review contrast, focus outlines, hover transitions, and responsive behavior.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline pt-2"
        >
          ← Return to Live Website
        </Link>
      </div>

      {/* 1. BUTTONS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>01 / BUTTON MATRIX</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl bg-surface border border-border">
          <div className="space-y-3">
            <span className="text-xs font-mono text-text-muted">Primary (Lime + Swap)</span>
            <div className="space-y-2">
              <Button variant="primary" size="lg" className="w-full">
                Primary Large
              </Button>
              <Button variant="primary" size="md" className="w-full">
                Primary Medium
              </Button>
              <Button variant="primary" size="sm" className="w-full">
                Primary Small
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono text-text-muted">Secondary (Glass Surface)</span>
            <div className="space-y-2">
              <Button variant="secondary" size="lg" className="w-full">
                Secondary Large
              </Button>
              <Button variant="secondary" size="md" className="w-full">
                Secondary Medium
              </Button>
              <Button variant="secondary" size="sm" className="w-full">
                Secondary Small
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono text-text-muted">Ghost &amp; Danger</span>
            <div className="space-y-2">
              <Button variant="ghost" size="md" className="w-full">
                Ghost Action
              </Button>
              <Button variant="danger" size="md" className="w-full">
                Danger Action
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono text-text-muted">States (Loading &amp; Disabled)</span>
            <div className="space-y-2">
              <Button variant="primary" size="md" isLoading className="w-full">
                Loading State
              </Button>
              <Button variant="primary" size="md" disabled className="w-full">
                Disabled State
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BADGES & CHIPS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>02 / BADGES &amp; CHIPS</span>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-text-muted block">Badge Variants</span>
            <div className="flex flex-wrap gap-2">
              <Badge variant="lime">LIME ACCENT</Badge>
              <Badge variant="violet">VIOLET AI</Badge>
              <Badge variant="orange">ORANGE VIRAL</Badge>
              <Badge variant="danger">18+ RESTRICTED</Badge>
              <Badge variant="sample">SAMPLE DATA</Badge>
              <Badge variant="outline">OUTLINE MONO</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-text-muted block">Chip Toggle Group</span>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={selectedChip === "option1"}
                onClick={() => setSelectedChip("option1")}
              >
                Option One
              </Chip>
              <Chip
                selected={selectedChip === "option2"}
                badge="18+"
                badgeVariant="danger"
                onClick={() => setSelectedChip("option2")}
              >
                Adult Category
              </Chip>
              <Chip
                selected={selectedChip === "option3"}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => setSelectedChip("option3")}
              >
                AI Assisted
              </Chip>
              <Chip disabled>Disabled Option</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INPUTS & TEXTAREA */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>03 / FORM INPUTS &amp; TEXTAREA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-surface border border-border">
          <div className="space-y-4">
            <Input
              label="Standard Input"
              placeholder="e.g. Lumina Clarifying Serum"
              defaultValue="Pre-filled Brand Name"
            />
            <Input
              label="Input with Left Icon"
              placeholder="Search hooks..."
              leftIcon={<Search className="w-4 h-4 text-accent" />}
            />
            <Input
              label="Input with Error State"
              defaultValue="invalid-url"
              error="Please enter a valid https:// web address"
            />
          </div>

          <div className="space-y-4">
            <Textarea
              label="Roomy Textarea"
              placeholder="Type or paste your ad script here..."
              defaultValue="[HOOK]: Stop scrolling if you want 10x better skin..."
              rows={4}
              charCount={{ current: 62, max: 500 }}
            />
            <Select
              label="Custom Select Component"
              value={selectVal}
              onChange={setSelectVal}
              options={[
                { value: "opt1", label: "Instagram Reels & Stories (9:16)" },
                { value: "opt2", label: "Meta In-Feed Ads (4:5)" },
                { value: "opt3", label: "TikTok Spark Ads (9:16)" },
                { value: "opt4", label: "YouTube Shorts (9:16)" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 4. CHOICE CARDS & RATIO VISUALS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>04 / CHOICE CARDS &amp; RATIO PREVIEWS</span>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ChoiceCard
              title="Script Ready"
              description="Client provides finished talking points"
              icon={<FileText className="w-5 h-5 text-accent" />}
              selected={selectedCard === "card1"}
              onClick={() => setSelectedCard("card1")}
            />
            <ChoiceCard
              title="Product Pictures"
              description="Drop photos and auto-draft hooks"
              icon={<ImageIcon className="w-5 h-5 text-violet-400" />}
              selected={selectedCard === "card2"}
              badge="AI"
              onClick={() => setSelectedCard("card2")}
            />
            <ChoiceCard
              title="Google Drive"
              description="Sync raw b-roll folder"
              icon={<FolderSymlink className="w-5 h-5 text-orange-400" />}
              selected={selectedCard === "card3"}
              onClick={() => setSelectedCard("card3")}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <ChoiceCard
              title="9:16 Vertical"
              description="Reels &amp; TikTok"
              ratioVisual="9:16"
              selected={selectedRatio === "9:16"}
              onClick={() => setSelectedRatio("9:16")}
            />
            <ChoiceCard
              title="4:5 Portrait"
              description="In-Feed Meta"
              ratioVisual="4:5"
              selected={selectedRatio === "4:5"}
              onClick={() => setSelectedRatio("4:5")}
            />
            <ChoiceCard
              title="1:1 Square"
              description="Grid &amp; Carousel"
              ratioVisual="1:1"
              selected={selectedRatio === "1:1"}
              onClick={() => setSelectedRatio("1:1")}
            />
          </div>
        </div>
      </section>

      {/* 5. STEPPER & SEGMENTED CONTROL */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>05 / STEPPER &amp; SEGMENTED CONTROL</span>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono text-text-muted block text-center">
              Active Stepper (Interactive - Click nodes)
            </span>
            <Stepper
              currentStep={stepperStep}
              onStepClick={setStepperStep}
            />
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <span className="text-xs font-mono text-text-muted block text-center">
              Segmented Duration Control
            </span>
            <SegmentedControl
              options={[
                { value: 15, label: "15s Hook" },
                { value: 30, label: "30s Standard" },
                { value: 45, label: "45s Story" },
                { value: 60, label: "60s Deep Dive" },
              ]}
              value={segmentedVal}
              onChange={setSegmentedVal}
            />
          </div>
        </div>
      </section>

      {/* 6. DROPZONE & VIDEO TILE */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>06 / DROPZONE &amp; VIDEO TILE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-2xl bg-surface border border-border">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-mono text-text-muted block">Dropzone with Files</span>
            <Dropzone
              files={testFiles}
              onFilesAdded={() => {}}
              onFileRemoved={(id) => setTestFiles(testFiles.filter((f) => f.id !== id))}
              onSetPrimary={(id) =>
                setTestFiles(
                  testFiles.map((f) => ({ ...f, isPrimary: f.id === id }))
                )
              }
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono text-text-muted block">VideoTile (9:16 Portrait)</span>
            <div className="max-w-[240px] mx-auto">
              <VideoTile
                title="Lumina Real-Human Wear Test"
                category="@emily.skincare"
                views="1.4M"
                aspectRatio="9:16"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. SPOTLIGHT BENTO TILE */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
          <span>07 / CURSOR SPOTLIGHT BENTO TILE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoTile className="p-8 space-y-4">
            <Badge variant="lime">STEP 01</Badge>
            <h3 className="text-xl font-bold text-white">Client Brief Intake</h3>
            <p className="text-xs text-text-muted">
              Move cursor over this tile to observe the dynamic radial cursor tracking highlight.
            </p>
          </BentoTile>

          <BentoTile className="p-8 space-y-4">
            <Badge variant="violet">STEP 02</Badge>
            <h3 className="text-xl font-bold text-white">Real Creator Filming</h3>
            <p className="text-xs text-text-muted">
              Vetted creators shoot on real 4K camera gear in genuine lifestyle settings.
            </p>
          </BentoTile>

          <BentoTile className="p-8 space-y-4">
            <Badge variant="orange">STEP 03</Badge>
            <h3 className="text-xl font-bold text-white">AI Polish &amp; Subtitles</h3>
            <p className="text-xs text-text-muted">
              Neural speech cleanup, auto-timed kinetic captions, and multi-ratio exports.
            </p>
          </BentoTile>
        </div>
      </section>
    </div>
  );
}
