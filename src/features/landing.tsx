"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Logo, Icon } from "@/components/ui";
import { EditorialPhoto } from "@/components/editorial-photo";
import { topics } from "@/lib/topics";
import { SocialDock } from "@/components/social-dock";

const steps = [
  {
    n: "01",
    title: "Make yourself at home.",
    body: "Create your profile. Use your name or a pseudonym, and share only what feels comfortable.",
    icon: "user",
  },
  {
    n: "02",
    title: "Find a familiar feeling.",
    body: "Choose the communities that speak to you. You can belong to more than one.",
    icon: "compass",
  },
  {
    n: "03",
    title: "Start a conversation.",
    body: "Share a story or send a connection request. Private chats begin with a mutual yes.",
    icon: "message",
  },
];

export function Landing() {
  const [menu, setMenu] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div
      className="landing design-tennis theme-chapters social-public"
      data-theme-version="social-glass-5"
    >
      <aside className="public-sidebar">
        <Logo />
        <span className="public-sidebar-label">A PLACE TO BELONG</span>
        <nav aria-label="Explore sritedu">
          <a className="public-nav active" href="#main">
            <Icon name="home" size={20} /> Overview <span>↗</span>
          </a>
          <a className="public-nav" href="#communities">
            <Icon name="users" size={20} /> Communities
          </a>
          <a className="public-nav" href="#how-it-works">
            <Icon name="sprout" size={20} /> How it works
          </a>
          <a className="public-nav" href="#our-promise">
            <Icon name="shield" size={20} /> Care & privacy
          </a>
        </nav>
        <div className="public-sidebar-note">
          <span aria-hidden="true">✳</span>
          <strong>
            Different stories.
            <br />
            Shared humanity.
          </strong>
          <p>There’s room for yours.</p>
        </div>
        <div className="public-sidebar-bottom">
          <Link href="/help">
            <Icon name="help" size={18} /> Help & support
          </Link>
          <Link href="/sign-in">
            <Icon name="user" size={18} /> Sign in
          </Link>
          <small>For adults 18+ · At your pace</small>
        </div>
      </aside>
      <div className="public-workspace">
        <header
          className={`marketing-header${menu ? " menu-open" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMenu(false);
              event.currentTarget
                .querySelector<HTMLButtonElement>(".mobile-menu")
                ?.focus();
            }
          }}
        >
          <Logo />
          <div className="public-title">
            <span>WELCOME TO YOUR NEXT CHAPTER</span>
            <strong>Your space, your pace.</strong>
          </div>
          <div className="header-actions">
            <Link
              href="/discover"
              className="header-friends"
              aria-label="Add friends"
              title="Add friends"
            >
              <Icon name="user-plus" size={20} />
              <span className="header-friend-label">Add friends</span>
            </Link>
            <Link href="/sign-in" className="signin-link">
              Sign in
            </Link>
            <Link href="/sign-up" className="button primary small">
              Join sritedu <Icon name="arrow" size={16} />
            </Link>
            <button
              className="icon-button mobile-menu"
              type="button"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(!menu)}
            >
              <Icon name={menu ? "close" : "menu"} />
            </button>
          </div>
          {menu && (
            <nav
              id="mobile-navigation"
              className="mobile-menu-panel"
              aria-label="Mobile navigation"
            >
              <a href="#communities" onClick={() => setMenu(false)}>
                Communities <Icon name="users" size={17} />
              </a>
              <a href="#how-it-works" onClick={() => setMenu(false)}>
                How it works <Icon name="sprout" size={17} />
              </a>
              <a href="#our-promise" onClick={() => setMenu(false)}>
                Care & privacy <Icon name="shield" size={17} />
              </a>
              <Link href="/sign-in">
                Sign in <Icon name="user" size={17} />
              </Link>
            </nav>
          )}
        </header>
        <main id="main">
          <div className="public-page-intro">
            <div>
              <span className="eyebrow">
                LIFE IS A LOT. YOU DON’T HAVE TO DO IT ALONE.
              </span>
              <p>A softer corner of the internet.</p>
            </div>
            <span className="intro-mark" aria-hidden="true">
              ✳
            </span>
          </div>
          <section className="hero section-wrap">
            <motion.div
              className="hero-copy chapter-card"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            >
              <div className="chapter-card-heading">
                <span className="chapter-emblem">
                  <Icon name="heart-handshake" size={30} />
                </span>
                <span>
                  EVERY CHAPTER
                  <br />
                  <strong>deserves a little care.</strong>
                </span>
                <span className="chapter-dots" aria-hidden="true">
                  •••
                </span>
              </div>
              <div className="chapter-card-body">
                <span className="eyebrow">MEET SRITEDU</span>
                <h1>
                  Your story.
                  <br />
                  Your people.
                  <br />
                  <span>Your next chapter.</span>
                </h1>
                <p className="hero-description">
                  Breakups, money worries, lonely days, or everything at once.
                  Find people who understand what life feels like.
                </p>
                <div className="hero-actions">
                  <Link href="/sign-up" className="button primary">
                    Find your community <Icon name="arrow" size={18} />
                  </Link>
                  <Link href="/preview/home" className="explore-link">
                    Explore sritedu <Icon name="arrow-right" size={18} />
                  </Link>
                </div>
                <div className="hero-footnote">
                  <Icon name="lock" size={14} />
                  <span>Your boundaries come first. Always.</span>
                </div>
              </div>
            </motion.div>
            <div className="hero-art">
              <Link
                href="/preview/communities/finding-connection"
                className="connection-card"
              >
                <div className="connection-card-photo">
                  <EditorialPhoto
                    topic="finding-connection"
                    variant="feature"
                    eager
                  />
                  <span
                    className="connection-sticker ribbon-motion"
                    aria-hidden="true"
                  >
                    a little
                    <br />
                    <strong>less alone.</strong>
                    <span>♡</span>
                  </span>
                </div>
                <div className="connection-card-copy">
                  <span className="eyebrow">A SMALL HELLO CAN MEAN A LOT</span>
                  <h2>
                    People who
                    <br />
                    get your kind of day.
                  </h2>
                  <span className="connection-arrow">
                    <Icon name="arrow" size={22} />
                  </span>
                </div>
              </Link>
              <Link
                href="/preview/communities/everything-at-once"
                className="everything-card"
              >
                <span className="everything-icon">
                  <Icon name="orbit" size={28} />
                </span>
                <div>
                  <span className="eyebrow">
                    WHEN IT’S ALL HAPPENING AT ONCE
                  </span>
                  <h2>Start wherever you are.</h2>
                </div>
                <Icon name="arrow" size={23} />
              </Link>
            </div>
          </section>
          <div className="values-strip section-wrap">
            <div>
              <Icon name="lock" size={18} />
              <span>Privacy, by choice</span>
            </div>
            <div>
              <Icon name="heart-handshake" size={20} />
              <span>Connection, by consent</span>
            </div>
            <div>
              <Icon name="flower" size={19} />
              <span>Support, without judgement</span>
            </div>
          </div>
          <section className="community-section section-wrap" id="communities">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FIND YOUR KIND OF SPACE</span>
                <h2>What’s on your mind?</h2>
              </div>
              <Link className="text-link" href="/preview/communities">
                Explore communities <Icon name="arrow" size={17} />
              </Link>
            </div>
            <div className="topic-grid">
              {topics.map((topic, i) => (
                <Link
                  href={"/preview/communities/" + topic.slug}
                  className="topic-card"
                  key={topic.slug}
                >
                  <EditorialPhoto topic={topic.slug} className="topic-photo" />
                  <span className={"topic-symbol symbol-" + i}>
                    <Icon name={topic.icon} size={23} />
                  </span>
                  <h3>{topic.short}</h3>
                  <p>{topic.description}</p>
                  <span className="topic-link">
                    Find your space <Icon name="arrow" size={16} />
                  </span>
                </Link>
              ))}
            </div>
            <p className="community-note">
              <Icon name="lock" size={14} /> Your community choices stay
              private. You decide what to share.
            </p>
          </section>
          <section className="how-section section-wrap" id="how-it-works">
            <div className="section-heading">
              <div>
                <span className="eyebrow">THREE SMALL STEPS</span>
                <h2>Come as you are.</h2>
              </div>
              <p>No perfect words required.</p>
            </div>
            <div className="chapter-steps">
              {steps.map((step) => (
                <article className="chapter-step" key={step.n}>
                  <header>
                    <span>{step.n}</span>
                    <Icon name={step.icon} size={26} />
                  </header>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="care-section section-wrap" id="our-promise">
            <div className="care-symbol-panel">
              <span className="eyebrow">YOUR STORY. YOUR BOUNDARIES.</span>
              <div className="care-lock">
                <Icon name="lock" size={70} />
              </div>
              <span>
                Open up.
                <br />
                <strong>On your own terms.</strong>
              </span>
            </div>
            <div className="care-copy">
              <span className="eyebrow">A LITTLE MORE CARE, BY DESIGN</span>
              <h2>
                You choose
                <br />
                who you let in.
              </h2>
              <p>
                A space to be heard, with room for your boundaries. Read
                quietly, share a thought, or start a conversation when you’re
                ready.
              </p>
              <ul>
                <li>
                  <Icon name="check" size={17} /> Pseudonyms are welcome
                </li>
                <li>
                  <Icon name="check" size={17} /> Private chat by mutual consent
                </li>
                <li>
                  <Icon name="check" size={17} /> Simple block, mute and report
                  controls
                </li>
              </ul>
              <Link className="text-link" href="/guidelines">
                Our community principles <Icon name="arrow" size={17} />
              </Link>
            </div>
          </section>
          <section className="closing section-wrap">
            <div>
              <span className="eyebrow">ONE SMALL STEP IS A GOOD START</span>
              <h2>
                Your next chapter
                <br />
                doesn’t have to be alone.
              </h2>
            </div>
            <Link className="button primary" href="/sign-up">
              Find your community <Icon name="arrow" size={19} />
            </Link>
            <span className="closing-flower" aria-hidden="true">
              ✳
            </span>
          </section>
        </main>
        <footer className="marketing-footer section-wrap">
          <span>© {new Date().getFullYear()} sritedu</span>
          <div className="footer-links">
            <Link href="/guidelines">Guidelines</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/help">Help & support</Link>
          </div>
          <p>Peer support. Not clinical care or an emergency service.</p>
        </footer>
      </div>
      <SocialDock />
    </div>
  );
}
