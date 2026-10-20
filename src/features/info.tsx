"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo, Icon, Field } from "@/components/ui";
const policies: Record<
  string,
  { title: string; intro: string; sections: { title: string; body: string }[] }
> = {
  guidelines: {
    title: "A little more care.",
    intro:
      "Different stories. Shared humanity. These are the promises we ask every member to make.",
    sections: [
      {
        title: "Listen with respect.",
        body: "Share lived experience. Ask before giving advice. Do not diagnose others or promise recovery. Supportive discussion of distress and recovery is welcome.",
      },
      {
        title: "Respect a mutual yes.",
        body: "No dating solicitations, unsolicited sexual content, pressure to reply, exploitation, or harassment. A connection request must be accepted before a private conversation opens.",
      },
      {
        title: "Protect personal details.",
        body: "Pseudonyms are welcome. Do not share another person’s identifying details, private messages, photos, or location without permission. Never ask for financial details or identity documents.",
      },
      {
        title: "Keep the space free of exploitation.",
        body: "No scams, lending, fundraising, investment pitches, recruiting fees, sales, doxxing, or instructions or encouragement for self-harm. Use content notes when a story may be difficult to read.",
      },
      {
        title: "Use the controls you need.",
        body: "Mute topics, block accounts, and report profiles, stories, comments, messages, or media. Blocking works in both directions and closes conversations. Review is performed by authorized humans when staffing is available; there is no 24/7 monitoring or guaranteed response time.",
      },
      {
        title: "Review and appeals.",
        body: "Moderators can review reported evidence and remove content. Administrators can suspend accounts. Relevant evidence access and decisions are audited. You may appeal a removed story or restriction from Settings. The owner must assign real moderation staff and an external support contact before public launch.",
      },
    ],
  },
  privacy: {
    title: "Your story belongs to you.",
    intro:
      "Privacy policy draft · Owner and legal review required before public launch. This page describes the implementation, not a claim of legal compliance.",
    sections: [
      {
        title: "What is stored.",
        body: "Supabase stores account email and authentication records. PostgreSQL stores your profile, self-declared adult eligibility, preferences, memberships, authored content, connection requests, messages, notifications, blocks, and reports. Media is held in a private storage bucket. There are no advertising trackers, session replay, or AI therapist integrations.",
      },
      {
        title: "What people can see.",
        body: "Your visible profile contains a display name, username, bio, and avatar. Email, private settings, and membership lists are not in the member directory. Selected topics remain private unless you explicitly share them for discovery. Matching uses only shared topics and languages; it does not inspect private messages or infer diagnoses.",
      },
      {
        title: "Audiences and conversations.",
        body: "Community stories are limited to signed-in members of that community. Connection-only stories are limited to accepted connections. Drafts are owner-only. A copied URL preserves these checks. Chats require mutual acceptance. They use access controls and transport security when deployed with HTTPS; they are not end-to-end encrypted. The service operator can technically access stored data under controlled operational access.",
      },
      {
        title: "Media and revocation.",
        body: "The server validates file content, strips image location metadata, and re-encodes videos and poster images. Malware scanning is used only if a scanning gateway is configured. Each media request rechecks access and is served with private no-store headers. No public storage URLs or long-lived signed links are issued. Previously displayed or downloaded files cannot be recalled.",
      },
      {
        title: "Retention and deletion.",
        body: "Deleting a story or account removes its authored content from member access and queues related storage objects for retryable deletion. Abandoned uploads are queued after one hour. Resolved or dismissed report snapshots expire after 90 days when the scheduled cleanup job runs. Open investigations remain pending human review. Report snapshots contain limited relevant text and identifiers; unrelated private conversations are not available to moderators. The operator must document backup retention and any additional lawful evidence retention before launch.",
      },
      {
        title: "Your choices and export.",
        body: "Settings provides profile visibility, discovery opt-in, matching topic disclosure, request permissions, optional read receipts, quiet hours in UTC, reduced motion, topic muting, blocks, JSON data export, deactivation, and deletion. Export includes your own account and authored text; media binaries are not bundled. Deactivation disables visibility and access; the operator must restore an account on request.",
      },
      {
        title: "Preview and processors.",
        body: "The /preview area contains explicitly fictional people and stories. Its state is stored only in this browser session and never sent to Supabase. Live private data is never replaced with preview data when a service fails. The owner must identify the operating entity, hosting region, configured Supabase project, support contact, backup retention, and any scanning provider before public launch. A configured scanning provider receives uploaded file bytes; no AI moderation provider is integrated.",
      },
    ],
  },
  terms: {
    title: "A shared understanding.",
    intro:
      "Terms draft · Owner and legal review required before public launch. Operator identity, jurisdiction, and contact details still need to be supplied.",
    sections: [
      {
        title: "Adults only.",
        body: "sritedu is for adults aged 18 or older. Eligibility is self-declared, not verified age assurance. Do not use the service if you are under 18.",
      },
      {
        title: "Peer support, at your pace.",
        body: "sritedu is a social peer-support platform. Members share experiences; they are not presented as clinicians or emergency responders. The service does not provide diagnosis, treatment, recovery guarantees, or an AI therapist.",
      },
      {
        title: "Your content and consent.",
        body: "Share only content you have the right to share. You choose an audience before publishing. You retain your rights to your content and permit processing needed to operate the features you use. Do not upload identifying media of others without permission.",
      },
      {
        title: "Member responsibilities.",
        body: "Follow the community guidelines. No harassment, doxxing, scams, exploitation, sexual solicitation, malicious uploads, or harmful instructions. Do not attempt to bypass audience checks, storage controls, blocks, or account restrictions.",
      },
      {
        title: "Service limits and review.",
        body: "Access may be interrupted. Reports are reviewed only as staffing permits, with no guaranteed response time. Content may be removed and accounts restricted or suspended. Members may appeal decisions. The operator must finalize the review process, coverage, and escalation contact before a public launch.",
      },
      {
        title: "Leaving and contacting the operator.",
        body: "You can export your authored data, deactivate, or delete your account in Settings. Media cleanup is asynchronous and previously downloaded copies cannot be recalled. This prelaunch build has no configured external support inbox. Public launch requires a real operator contact and owner-reviewed terms.",
      },
    ],
  },
};
export function Info({
  page,
  resources = [],
}: {
  page: string;
  resources?: {
    id: string;
    region: string;
    name: string;
    url: string;
    last_checked: string;
  }[];
}) {
  const [region, setRegion] = useState("Worldwide");
  const content = policies[page];
  return (
    <div className="info-page">
      <header className="marketing-header">
        <Logo />
        <div className="header-actions">
          <Link href="/preview/home" className="text-link">
            Explore sritedu <Icon name="arrow" size={16} />
          </Link>
          <Link className="button secondary small" href="/sign-in">
            Sign in
          </Link>
        </div>
      </header>
      <main id="main" className="info-content">
        {page === "help" ? (
          <>
            <span className="eyebrow muted">A LITTLE MORE SUPPORT</span>
            <h1>
              You don’t have to
              <br />
              carry it <span className="pink-text">alone.</span>
            </h1>
            <p className="info-lead">
              sritedu is peer support, not clinical care or an emergency
              service. There is no 24/7 human monitoring.
            </p>
            <section className="support-panel">
              <Icon name="heart-handshake" size={30} />
              <div>
                <h2>If you or someone else is in immediate danger</h2>
                <p>
                  Contact local emergency services, reach out to someone you
                  trust, or use a local support service. If you can, move to a
                  place where you feel safer and ask someone to stay with you.
                </p>
              </div>
            </section>
            <div className="support-resources">
              <h2>Find support in your region</h2>
              <p>
                Choose a region yourself. We do not detect or store your
                location.
              </p>
              <Field label="Your region">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {Array.from(
                    new Set([
                      "Worldwide",
                      "India",
                      ...resources.map((r) => r.region),
                    ]),
                  ).map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <a
                className="resource-item"
                href={
                  region === "India"
                    ? "https://findahelpline.com/countries/in"
                    : "https://findahelpline.com/"
                }
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="help" size={26} />
                <div>
                  <h3>Find A Helpline</h3>
                  <p>
                    {region} · A directory of local support services. Check
                    availability and details with the provider.
                  </p>
                  <small>
                    Source: findahelpline.com · Link last checked: 20 October
                    2026
                  </small>
                </div>
                <Icon name="arrow" size={22} />
              </a>
              {resources
                .filter((r) => r.region === region || r.region === "Worldwide")
                .map((r) => (
                  <a
                    className="resource-item"
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="help" />
                    <div>
                      <h3>{r.name}</h3>
                      <p>
                        {r.region} · Last checked {r.last_checked}
                      </p>
                    </div>
                    <Icon name="arrow" />
                  </a>
                ))}
              <p className="fine-print">
                This is an external directory, not a sritedu service. No
                helpline phone numbers are copied into this application.
                Directory links need rechecking before 18 April 2027.
              </p>
            </div>
            <section className="info-section">
              <h2>Support inside your community</h2>
              <p>
                You can block accounts, mute topics, control requests, and
                report content from its menu. Reports go to the restricted
                human-review queue. Reviews and appeals depend on staffing;
                response times are not guaranteed.
              </p>
              <p>
                This prelaunch build has no external support inbox configured.
                The operator must publish a real support contact and staffing
                coverage before launch.
              </p>
              <Link href="/guidelines" className="text-link">
                Our community principles <Icon name="arrow" size={16} />
              </Link>
            </section>
          </>
        ) : content ? (
          <>
            <span className="eyebrow muted">OUR SHARED SPACE</span>
            <h1>{content.title}</h1>
            <p className="info-lead">{content.intro}</p>
            {content.sections.map((s) => (
              <section className="info-section" key={s.title}>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))}
          </>
        ) : null}
      </main>
      <footer className="info-footer">
        <Logo />
        <Link href="/guidelines">Guidelines</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/help">Help & support</Link>
      </footer>
    </div>
  );
}
