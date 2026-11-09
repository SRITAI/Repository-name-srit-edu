"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("infimindss_cookie_consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("infimindss_cookie_consent", "accepted");
    setShowConsent(false);

    // Initialize Meta Pixel if ID is configured
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      try {
        (window as any).fbq?.("consent", "grant");
      } catch {}
    }
  };

  const handleDecline = () => {
    localStorage.setItem("infimindss_cookie_consent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="cookie-banner" role="region" aria-label="Privacy & Cookie Consent">
      <div className="cookie-content">
        <ShieldCheck size={20} className="cookie-icon" />
        <p className="cookie-text">
          We use strictly privacy-compliant analytics & Meta pixels to measure creative engagement and optimize your studio experience.
        </p>
      </div>
      <div className="cookie-actions">
        <button type="button" className="cookie-btn-decline" onClick={handleDecline}>
          Necessary only
        </button>
        <button type="button" className="cookie-btn-accept" onClick={handleAccept}>
          Accept all
        </button>
      </div>
    </div>
  );
}
