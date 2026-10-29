"use client";

import { ArrowRight, Check, Crown, Sparkles, Zap } from "lucide-react";

const plans = [
  { name: "Creator", price: "₹1,950", credits: "2,000", icon: Zap, featured: false, points: ["2,000 credits every month", "AI image and video studio access", "Save creations to your library", "Renews monthly"] },
  { name: "Max", price: "₹10,000", credits: "20,000", icon: Crown, featured: true, points: ["20,000 credits every month", "AI image and video studio access", "Save creations to your library", "Renews monthly"] },
];

export default function Pricing({ onSelect }: { onSelect: (plan: "creator" | "max") => void }) {
  return <div className="content pricing-content">
    <div className="page-heading pricing-heading"><span className="section-kicker">PLANS FOR EVERY BIG IDEA</span><h1>Create more. Go further.<span className="heading-spark">✳</span></h1><p>Choose the monthly plan that fits your creative flow.</p></div>
    <div className="billing-label"><Sparkles size={15}/> Monthly billing <span>Cancel anytime</span></div>
    <div className="pricing-grid">
      {plans.map((plan) => { const Icon = plan.icon; return <article className={`pricing-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
        {plan.featured && <div className="popular-tag">MOST POPULAR</div>}
        <div className="plan-icon"><Icon size={22}/></div><h2>{plan.name}</h2><p className="plan-intro">{plan.featured ? "For ideas without the brakes." : "For the ideas you can’t wait to make."}</p>
        <div className="plan-price">{plan.price}<span>/ month</span></div><div className="plan-credits"><strong>{plan.credits}</strong><span>credits / month</span></div>
        <button className="plan-button" onClick={() => onSelect(plan.featured ? "max" : "creator")}>Choose {plan.name} <ArrowRight size={17}/></button>
        <div className="plan-separator"/><span className="plan-includes">WHAT’S INCLUDED</span><ul>{plan.points.map(point => <li key={point}><Check size={15}/>{point}</li>)}</ul>
      </article>; })}
    </div>
    <p className="pricing-footnote">Credits and checkout will activate only after payment setup and account verification are complete. The creative previews on this site are currently illustrative.</p>
  </div>;
}
