"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Logo, Icon, Avatar } from "@/components/ui";
import { topics } from "@/lib/topics";
export function Landing() {
  const reduced = useReducedMotion();
  const [menu, setMenu] = useState(false);
  return (
    <div className="landing">
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
        <nav aria-label="Main navigation">
          <a href="#communities">Communities</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/help">Our promise</Link>
        </nav>
        <div className="header-actions">
          <Link className="signin-link" href="/sign-in">
            Sign in
          </Link>
          <Link className="button primary small" href="/sign-up">
            Join sritedu <Icon name="arrow" size={16} />
          </Link>
          <button
            type="button"
            className="icon-button mobile-menu"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
        </div>
        {menu && (
          <div
            id="mobile-navigation"
            className="mobile-menu-panel"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <a href="#communities" onClick={() => setMenu(false)}>
              Communities
            </a>
            <a href="#how-it-works" onClick={() => setMenu(false)}>
              How it works
            </a>
            <Link href="/sign-in">Sign in</Link>
          </div>
        )}
      </header>
      <main id="main">
        <section className="hero section-wrap">
          <motion.div
            className="hero-copy"
            initial={reduced ? false : { opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">
              <span className="little-spark">✷</span> A LITTLE LESS ALONE. A
              LITTLE MORE YOU.
            </span>
            <h1>
              You don’t have to
              <br className="desktop-br" /> figure it all
              <br className="desktop-br" /> out{" "}
              <span className="pink-text">alone.</span>
              <span className="headline-star">✷</span>
            </h1>
            <p className="hero-description">
              Share your story. Find people who understand.
              <br />
              Take things one conversation at a time.
            </p>
            <div className="hero-actions">
              <Link href="/sign-up" className="button primary">
                Find your community <Icon name="arrow" size={19} />
              </Link>
              <Link href="/preview/home" className="explore-link">
                Explore sritedu{" "}
                <span className="round-arrow">
                  <Icon name="arrow-right" size={17} />
                </span>
              </Link>
            </div>
            <div className="hero-footnote">
              <Icon name="shield" size={16} />
              <span>Real conversations. Your pace. Your privacy.</span>
            </div>
          </motion.div>
          <motion.div
            className="hero-art"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="ambient-orb" />
            <svg
              className="ribbon"
              viewBox="0 0 600 620"
              fill="none"
              aria-label="Two luminous pink glass ribbons coming together"
              role="img"
            >
              <defs>
                <linearGradient
                  id="ribbon-color"
                  x1="145"
                  y1="110"
                  x2="455"
                  y2="510"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFF5F9" />
                  <stop offset=".18" stopColor="#FF8FBE" />
                  <stop offset=".48" stopColor="#C51E62" />
                  <stop offset=".72" stopColor="#FF4F9A" />
                  <stop offset="1" stopColor="#FFF5F9" />
                </linearGradient>
                <linearGradient id="ribbon-edge">
                  <stop stopColor="#FF8FBE" stopOpacity=".8" />
                  <stop offset=".5" stopColor="#080808" stopOpacity=".1" />
                  <stop offset="1" stopColor="#FF4F9A" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="19" />
                </filter>
                <filter id="soft">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>
              <g className="ribbon-motion">
                <ellipse
                  cx="291"
                  cy="317"
                  rx="120"
                  ry="222"
                  transform="rotate(-32 291 317)"
                  stroke="#C51E62"
                  strokeWidth="30"
                  opacity=".24"
                  filter="url(#glow)"
                />
                <ellipse
                  cx="291"
                  cy="310"
                  rx="117"
                  ry="215"
                  transform="rotate(-32 291 310)"
                  stroke="url(#ribbon-color)"
                  strokeWidth="41"
                />
                <ellipse
                  cx="291"
                  cy="310"
                  rx="119"
                  ry="215"
                  transform="rotate(-32 291 310)"
                  stroke="url(#ribbon-edge)"
                  strokeWidth="36"
                />
                <ellipse
                  cx="291"
                  cy="310"
                  rx="133"
                  ry="228"
                  transform="rotate(-32 291 310)"
                  stroke="#FF8FBE"
                  strokeWidth="1.3"
                  opacity=".8"
                />
                <ellipse
                  cx="291"
                  cy="310"
                  rx="99"
                  ry="197"
                  transform="rotate(-32 291 310)"
                  stroke="#FFF5F9"
                  strokeWidth="1"
                  opacity=".55"
                />
                <ellipse
                  cx="317"
                  cy="325"
                  rx="117"
                  ry="215"
                  transform="rotate(38 317 325)"
                  stroke="url(#ribbon-color)"
                  strokeWidth="39"
                />
                <ellipse
                  cx="317"
                  cy="325"
                  rx="118"
                  ry="215"
                  transform="rotate(38 317 325)"
                  stroke="url(#ribbon-edge)"
                  strokeWidth="34"
                />
                <ellipse
                  cx="317"
                  cy="325"
                  rx="134"
                  ry="231"
                  transform="rotate(38 317 325)"
                  stroke="#FF8FBE"
                  strokeWidth="1.2"
                  opacity=".65"
                />
                <ellipse
                  cx="317"
                  cy="325"
                  rx="100"
                  ry="198"
                  transform="rotate(38 317 325)"
                  stroke="#FFF5F9"
                  strokeWidth="1"
                  opacity=".6"
                />
              </g>
            </svg>
            <div className="floating-tag tag-one">
              <span className="tiny-dot" /> Room to be yourself
            </div>
            <div className="floating-tag tag-two">
              <Icon name="heart-handshake" size={16} /> No judgement. Just
              people.
            </div>
            <div className="glass-story">
              <div className="story-top">
                <Avatar
                  person={{
                    id: "hero",
                    avatar: "orbit",
                    display_name: "Illustrative member",
                  }}
                  size="sm"
                />
                <div>
                  <strong>A small step forward</strong>
                  <small>Moving forward · Illustrative story</small>
                </div>
                <Icon name="more" size={18} />
              </div>
              <p>
                “Today wasn’t perfect. But I went for a walk, called a friend,
                and felt a little more like me.”
              </p>
              <div className="story-response">
                <Icon name="heart" size={16} />
                <span>I hear you. Little steps count.</span>
                <span className="tiny-heart">♡</span>
              </div>
            </div>
            <span className="art-label">
              DIFFERENT STORIES. SHARED HUMANITY.
            </span>
          </motion.div>
        </section>
        <section className="values-strip section-wrap">
          <span>Come as you are.</span>
          <div>
            <Icon name="lock" size={17} /> Privacy, by choice
          </div>
          <div>
            <Icon name="heart-handshake" size={19} /> Connection, by consent
          </div>
          <div>
            <Icon name="flower" size={18} /> Support, without judgement
          </div>
          <span className="strip-star">✷</span>
        </section>
        <section className="community-section section-wrap" id="communities">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted">FIND YOUR PEOPLE</span>
              <h2>
                Whatever life feels like,
                <br />
                there’s a space for it<span className="pink-text">.</span>
              </h2>
            </div>
            <p>
              You don’t need the right words.
              <br />
              Just a place to start.
            </p>
          </div>
          <div className="topic-grid">
            {topics.map((topic, i) => (
              <Link
                href={"/preview/communities/" + topic.slug}
                className="topic-card"
                key={topic.slug}
              >
                <span className={"topic-symbol symbol-" + i}>
                  <Icon name={topic.icon} size={25} />
                </span>
                <h3>{topic.short}</h3>
                <p>{topic.description}</p>
                <span className="topic-link">
                  Find your space <Icon name="arrow" size={16} />
                </span>
              </Link>
            ))}
          </div>
          <div className="community-note">
            <Icon name="lock" size={14} /> Your community choices stay private.
            Share only what you choose.
          </div>
        </section>
        <section className="how-section section-wrap" id="how-it-works">
          <div className="how-intro">
            <span className="eyebrow muted">
              NO PRESSURE. NO PERFECT WORDS.
            </span>
            <h2>
              A connection starts
              <br />
              with a little <span className="pink-text">courage.</span>
            </h2>
            <p>
              We make the next step a little easier.
              <br />
              You decide when you’re ready.
            </p>
            <Link href="/sign-up" className="text-link">
              Start your own chapter <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="steps">
            {[
              {
                n: "01",
                title: "Find a familiar feeling.",
                body: "Choose the communities that speak to you. Read, reflect, or simply stay a while.",
                icon: "compass",
              },
              {
                n: "02",
                title: "Share a little of your world.",
                body: "A thought, a story, a small win. Show up in whatever way feels right.",
                icon: "edit",
              },
              {
                n: "03",
                title: "Take it one conversation at a time.",
                body: "Find shared experiences. Connect only when you both say yes.",
                icon: "message",
              },
            ].map((step) => (
              <div className="step" key={step.n}>
                <span className="step-number">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <Icon name={step.icon} size={24} />
              </div>
            ))}
          </div>
        </section>
        <section className="care-section section-wrap">
          <div className="care-visual">
            <div className="care-ring care-ring-inner" />
            <div className="care-ring care-ring-middle" />
            <div className="care-ring care-ring-outer" />
            <span className="care-icon">
              <Icon name="heart-handshake" size={60} />
            </span>
            <span className="care-caption">
              A softer corner of the internet.
            </span>
          </div>
          <div className="care-copy">
            <span className="eyebrow muted">BUILT ON A LITTLE MORE CARE</span>
            <h2>
              Your story.
              <br />
              Your boundaries.
            </h2>
            <p>
              Being open shouldn’t mean giving up your privacy. You choose your
              audience, who can find you, and who you let in.
            </p>
            <ul>
              <li>
                <Icon name="check" size={17} /> Pseudonyms are welcome
              </li>
              <li>
                <Icon name="check" size={17} /> Private conversations by mutual
                consent
              </li>
              <li>
                <Icon name="check" size={17} /> Simple controls to block, mute,
                and report
              </li>
            </ul>
            <Link className="text-link" href="/guidelines">
              Read our community principles <Icon name="arrow" size={17} />
            </Link>
          </div>
        </section>
        <section className="closing section-wrap">
          <span className="eyebrow">THERE’S NO PERFECT TIME TO START.</span>
          <h2>
            Maybe today is
            <br />
            your <span className="pink-text">small step.</span>
          </h2>
          <Link href="/sign-up" className="button primary">
            Find your community <Icon name="arrow" size={19} />
          </Link>
          <p>A space for adults 18+. Always at your pace.</p>
        </section>
      </main>
      <footer className="marketing-footer section-wrap">
        <div>
          <Logo />
          <p>A little less alone. A little more you.</p>
        </div>
        <div className="footer-links">
          <Link href="/guidelines">Community guidelines</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/help">Help & support</Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} sritedu</span>
          <span>Peer support. Not clinical care or an emergency service.</span>
          <span>
            Made for human connection <span className="pink-text">♡</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
