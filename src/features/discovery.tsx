"use client";
import { useState } from "react";
import Link from "next/link";
import { Avatar, Button, Empty, Icon, Modal, Field } from "@/components/ui";
import { ActionMenu } from "@/components/ui";
import { topics } from "@/lib/topics";
import type { Profile } from "@/lib/types";
import { useApp } from "./app/provider";
import { BlockDialog, ReportDialog } from "./app/safety";
export function Discovery() {
  const { data, act, preview, busy, toast } = useApp();
  const [tab, setTab] = useState("Discover");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("");
  const [request, setRequest] = useState<Profile | null>(null);
  const [note, setNote] = useState("");
  const [block, setBlock] = useState<Profile | null>(null);
  const [report, setReport] = useState<{ type: string; id: string } | null>(
    null,
  );
  const prefix = preview ? "/preview" : "";
  const pending = data.connections.filter((c) => c.status === "pending");
  const suggestions = data.people.filter(
    (p) =>
      !data.dismissed.includes(p.id) &&
      !data.blocks.includes(p.id) &&
      (!topic || p.topics?.includes(topic)) &&
      (!language || p.language === language),
  );
  return (
    <div className="wide-page">
      <div className="page-heading">
        <span className="eyebrow muted">A SHARED FEELING IS A START</span>
        <h1>
          People who <span>get it.</span>
        </h1>
        <p>
          Say a small hello. A conversation opens only when you both say yes.
        </p>
      </div>
      <div className="community-toolbar">
        <div className="pill-tabs">
          {["Discover", "Requests", "Connections"].map((t) => (
            <button
              className={tab === t ? "active" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Requests" && pending.length > 0 && (
                <b>{pending.length}</b>
              )}
            </button>
          ))}
        </div>
        <Link className="text-link" href={prefix + "/settings"}>
          <Icon name="settings" size={15} /> Discovery preferences
        </Link>
      </div>
      {tab === "Discover" &&
        (!data.settings.discovery ? (
          <Empty icon="eye-off" title="Your discovery is paused.">
            <p>
              Opt in when you’re ready. Only preferences you explicitly share
              will be used.
            </p>
            <Link href={prefix + "/settings"} className="button secondary">
              Choose my discovery settings
            </Link>
          </Empty>
        ) : (
          <>
            <div className="discovery-filters">
              <Field label="Shared topic">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="">All shared experiences</option>
                  {topics.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Language">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">All languages</option>
                  {["English", "Hindi", "Hinglish"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="people-grid">
              {suggestions.map((person) => {
                const connection = data.connections.find((c) =>
                  [c.requester_id, c.recipient_id].includes(person.id),
                );
                return (
                  <article className="person-card" key={person.id}>
                    <div className="person-card-top">
                      <Avatar person={person} size="lg" />
                      <ActionMenu>
                        <summary
                          aria-label={"Actions for " + person.display_name}
                        >
                          <Icon name="more" />
                        </summary>
                        <div>
                          <button
                            onClick={() =>
                              void act("dismiss", {
                                target_id: person.id,
                              }).catch(() => {})
                            }
                          >
                            <Icon name="eye-off" size={15} /> Dismiss suggestion
                          </button>
                          <button onClick={() => setBlock(person)}>
                            <Icon name="mute" size={15} /> Block
                          </button>
                          <button
                            onClick={() =>
                              setReport({ type: "profile", id: person.id })
                            }
                          >
                            <Icon name="flag" size={15} /> Report
                          </button>
                        </div>
                      </ActionMenu>
                    </div>
                    <Link href={prefix + "/u/" + person.username}>
                      <h2>{person.display_name}</h2>
                      <span className="username">@{person.username}</span>
                    </Link>
                    <p>{person.bio || "A new chapter, at their own pace."}</p>
                    <div className="match-reason">
                      <Icon name="flower" size={15} />
                      {person.reason || "You chose the same language"}
                    </div>
                    <div className="person-preferences">
                      {person.language && <span>{person.language}</span>}
                      {person.intent && <span>{person.intent}</span>}
                    </div>
                    {connection ? (
                      <span className="connection-status">
                        <Icon
                          name={
                            connection.status === "accepted" ? "check" : "mail"
                          }
                          size={15}
                        />
                        {connection.status === "accepted"
                          ? "Connected"
                          : connection.status === "pending"
                            ? "Request pending"
                            : "Request declined"}
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        className="full"
                        onClick={() => {
                          setRequest(person);
                          setNote("");
                        }}
                      >
                        <Icon name="plus" size={16} /> Send a connection request
                      </Button>
                    )}
                  </article>
                );
              })}
            </div>
            {!suggestions.length && (
              <Empty title="A little room for new connections.">
                <p>
                  Try a different filter or check back another time. No inferred
                  topics or private conversations are used for matching.
                </p>
              </Empty>
            )}
          </>
        ))}
      {tab === "Requests" && (
        <div className="request-list">
          {pending.map((c) => {
            const incoming = c.recipient_id === data.me.id;
            const person = data.people.find(
              (p) => p.id === (incoming ? c.requester_id : c.recipient_id),
            );
            return (
              <div className="request-card" key={c.id}>
                <Avatar person={person} />
                <div>
                  <h3>
                    {person?.display_name || "Community member"}{" "}
                    <small>
                      {incoming ? "would like to connect" : "· Request sent"}
                    </small>
                  </h3>
                  <p>{c.note}</p>
                  <span className="fine-print">
                    Text only. Attachments become available after acceptance.
                  </span>
                </div>
                <div className="request-actions">
                  {incoming ? (
                    <>
                      <Button
                        className="small"
                        disabled={busy}
                        onClick={() =>
                          void act("connection", {
                            id: c.id,
                            status: "accepted",
                          })
                            .then(() =>
                              toast(
                                "Connection accepted. Your conversation is ready.",
                              ),
                            )
                            .catch(() => {})
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        className="small"
                        disabled={busy}
                        onClick={() =>
                          void act("connection", {
                            id: c.id,
                            status: "declined",
                          }).catch(() => {})
                        }
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      className="small"
                      onClick={() =>
                        void act("connection", {
                          id: c.id,
                          status: "cancel",
                        }).catch(() => {})
                      }
                    >
                      Cancel request
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {!pending.length && (
            <Empty icon="mail" title="No requests waiting.">
              <p>New hellos will be here. There’s no pressure to answer.</p>
            </Empty>
          )}
        </div>
      )}
      {tab === "Connections" && (
        <div className="people-grid">
          {data.conversations
            .filter((c) => !c.ended)
            .map((c) => (
              <div className="person-card" key={c.id}>
                <Avatar person={c.other} size="lg" />
                <h2>{c.other.display_name}</h2>
                <p>{c.other.bio}</p>
                <Link
                  className="button secondary full"
                  href={prefix + "/messages/" + c.id}
                >
                  <Icon name="message" size={17} /> Open conversation
                </Link>
              </div>
            ))}
          {!data.conversations.some((c) => !c.ended) && (
            <Empty
              icon="heart-handshake"
              title="Connection takes its own time."
            >
              <p>When you both say yes, you’ll find each other here.</p>
            </Empty>
          )}
        </div>
      )}
      <div className="privacy-note">
        <Icon name="shield" size={20} />
        <p>
          Suggestions use only explicitly permitted topics and languages. No
          diagnoses, distress scores, private messages, or exact locations are
          used.
        </p>
      </div>
      <Modal
        open={!!request}
        onClose={() => setRequest(null)}
        title={"A small hello to " + (request?.display_name || "")}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!request) return;
            try {
              await act("request", { target_id: request.id, note });
              setRequest(null);
              toast(
                "Your request is on its way. Give them room to respond at their pace.",
              );
            } catch {}
          }}
        >
          <p className="muted">
            Share a short introduction. Keep personal contact details to
            yourself. Photos and chat unlock after mutual acceptance.
          </p>
          <Field label="Your message">
            <textarea
              maxLength={300}
              required
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Hi. Your story felt a little familiar…"
            />
          </Field>
          <div className="composer-footer">
            <span className="fine-print">{note.length}/300 · Text only</span>
            <Button disabled={busy}>
              Send request <Icon name="arrow" size={16} />
            </Button>
          </div>
        </form>
      </Modal>
      <BlockDialog
        person={block ? { id: block.id, name: block.display_name } : null}
        onClose={() => setBlock(null)}
      />
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
