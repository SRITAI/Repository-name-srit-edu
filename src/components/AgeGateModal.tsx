"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="age-gate-backdrop" role="dialog" aria-modal="true">
      <div className="age-gate-card">
        <div className="age-gate-icon-badge">
          <ShieldAlert size={28} className="age-gate-shield-icon" />
        </div>

        <h3 className="age-gate-title">Age Verification Required</h3>
        <p className="age-gate-desc">
          You are about to access the <strong>Sexual Wellness & Intimate Care</strong> category.
          This section contains creative concepts and advertisements intended exclusively for adults aged 18 and older.
        </p>

        <div className="age-gate-notice">
          <strong>Meta Advertising Policy Notice:</strong>
          <span>
            Meta and social platforms strictly restrict overt adult imagery. All brand videos produced by infimindss in this category strictly focus on healthy lifestyle storytelling, clinical benefits, and tasteful aesthetics to guarantee 100% ad account compliance.
          </span>
        </div>

        <div className="age-gate-actions">
          <button type="button" className="btn-primary-cta" onClick={onConfirm} style={{ width: "100%", justifyContent: "center" }}>
            <CheckCircle2 size={16} />
            <span>I am 18 or older — Continue</span>
          </button>
          <button type="button" className="age-gate-cancel-btn" onClick={onCancel}>
            Cancel & Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
