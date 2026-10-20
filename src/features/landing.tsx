"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Logo, Icon } from "@/components/ui";
import { topics } from "@/lib/topics";
import { EditorialPhoto } from "@/components/editorial-photo";
export function Landing() {
  const reduced = useReducedMotion();
  const [menu, setMenu] = useState(false);
  return (
    <div className="landing design-tennis">
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
            <div className="photo-board ribbon-motion">
              <div className="board-heading">
                <span className="board-mark">
                  <Icon name="heart-handshake" size={22} />
                </span>
                <div>
                  <strong>Your next chapter starts here.</strong>
                  <small>A place to feel understood</small>
                </div>
                <span className="board-spark" aria-hidden="true">
                  ✷
                </span>
              </div>
              <Link
                href="/preview/communities/finding-connection"
                className="board-feature"
              >
                <EditorialPhoto topic="finding-connection" eager />
                <div className="board-feature-caption">
                  <span className="photo-label">FIND YOUR PEOPLE</span>
                  <h2>
                    A small hello.
                    <br />A little more connection.
                  </h2>
                  <span className="board-arrow">
                    <Icon name="arrow" size={22} />
                  </span>
                </div>
              </Link>
              <div className="board-bottom">
                <Link
                  href="/preview/communities/moving-forward"
                  className="board-mini"
                >
                  <EditorialPhoto topic="moving-forward" />
                  <span>
                    Moving forward <Icon name="arrow" size={15} />
                  </span>
                </Link>
                <Link
                  href="/preview/communities/financial-stress"
                  className="board-mini"
                >
                  <EditorialPhoto topic="financial-stress" />
                  <span>
                    Money on your mind? <Icon name="arrow" size={15} />
                  </span>
                </Link>
              </div>
              <div className="board-note">
                <Icon name="shield" size={16} />
                <span>Your story. Your pace. Your space.</span>
                <span aria-hidden="true">♡</span>
              </div>
            </div>
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
                <EditorialPhoto topic={topic.slug} className="topic-photo" />
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
