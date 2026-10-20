// Fictional data is available ONLY under /preview. Production never falls back to it.
import type { AppData, Profile } from "./types";
export const demoId = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60000).toISOString();
export function previewData(): AppData {
  const me: Profile = {
    id: demoId(1),
    display_name: "Alex",
    username: "alex_here",
    bio: "Taking life one small step at a time.",
    avatar: "bloom",
    language: "English",
    intent: "I want someone to listen",
    topics: ["moving-forward", "finding-connection", "career-challenges"],
  };
  const maya: Profile = {
    id: demoId(2),
    display_name: "Maya",
    username: "maya_grows",
    bio: "Finding joy in slow mornings and little beginnings.",
    avatar: "orbit",
    language: "English",
    intent: "I’m here to support others",
    topics: ["moving-forward"],
    reason: "You both chose Breakup & Moving Forward",
  };
  const arjun: Profile = {
    id: demoId(3),
    display_name: "Arjun",
    username: "arjun_builds",
    bio: "Building something. Learning to take breaks, too.",
    avatar: "moon",
    language: "Hinglish",
    intent: "I’d welcome suggestions",
    topics: ["founder-pressure"],
    reason: "You both chose English",
  };
  const sam: Profile = {
    id: demoId(4),
    display_name: "Sam",
    username: "sam_nextchapter",
    bio: "A new chapter. A little unsure, a little hopeful.",
    avatar: "bloom",
    language: "English",
    intent: "I want someone to listen",
    topics: ["career-challenges"],
    reason: "You both chose Jobs & Career Challenges",
  };
  return {
    me,
    posts: [
      {
        id: demoId(10),
        author_id: maya.id,
        author: maya,
        body: "A small thing I’m proud of today: I took myself out for coffee. No scrolling, no checking their profile. Just me, a warm cup, and a window seat.\n\nHealing isn’t a straight line. But maybe it can have little coffee breaks. ",
        community_slug: "moving-forward",
        audience: "community",
        warning: "",
        comments_enabled: true,
        hide_counts: false,
        created_at: ago(24),
        reactions: [
          { user_id: arjun.id, kind: "I hear you" },
          { user_id: sam.id, kind: "Sending support" },
        ],
        comments: [
          {
            id: demoId(50),
            post_id: demoId(10),
            author_id: sam.id,
            author: sam,
            body: "That sounds like a lovely little moment. Thank you for sharing it.",
            created_at: ago(12),
          },
        ],
        media: [],
      },
      {
        id: demoId(11),
        author_id: sam.id,
        author: sam,
        body: "Does anyone else feel like everyone has a five-year plan while you’re just figuring out Thursday?\n\nTrying to remind myself that a different pace is still a pace.",
        community_slug: "career-challenges",
        audience: "community",
        warning: "",
        comments_enabled: true,
        hide_counts: false,
        created_at: ago(73),
        reactions: [{ user_id: maya.id, kind: "I hear you" }],
        comments: [],
        media: [],
      },
      {
        id: demoId(12),
        author_id: arjun.id,
        author: arjun,
        body: "Left the laptop closed this evening and went for a walk. The work will be there tomorrow. I’m learning that I get to be here, too.",
        community_slug: "finding-connection",
        audience: "community",
        warning: "",
        comments_enabled: true,
        hide_counts: false,
        created_at: ago(140),
        reactions: [],
        comments: [],
        media: [],
      },
    ],
    people: [maya, arjun, sam],
    memberships: ["moving-forward", "finding-connection", "career-challenges"],
    bookmarks: [],
    connections: [
      {
        id: demoId(30),
        requester_id: maya.id,
        recipient_id: me.id,
        status: "accepted",
        note: "Your story felt familiar.",
      },
      {
        id: demoId(31),
        requester_id: sam.id,
        recipient_id: me.id,
        status: "pending",
        note: "Hi Alex. I’m also figuring out a career change. Would be lovely to talk, if you’re open to it.",
      },
    ],
    conversations: [
      {
        id: demoId(40),
        other: maya,
        muted: false,
        archived: false,
        ended: false,
        messages: [
          {
            id: demoId(60),
            conversation_id: demoId(40),
            sender_id: maya.id,
            body: "Hey Alex. Happy to be a listening ear. How’s your day been?",
            created_at: ago(35),
          },
          {
            id: demoId(61),
            conversation_id: demoId(40),
            sender_id: me.id,
            body: "A bit of a mixed bag, honestly. But I’m glad to be here.",
            created_at: ago(30),
          },
        ],
      },
    ],
    notifications: [
      {
        id: demoId(70),
        body: "You have a connection request",
        href: "/discover",
        read: false,
        created_at: ago(15),
      },
    ],
    blocks: [],
    dismissed: [],
    settings: {
      discovery: true,
      show_topics: false,
      profile_visible: true,
      accept_requests: true,
      reduce_motion: false,
      read_receipts: false,
      notifications: true,
      quiet_start: "22:00",
      quiet_end: "08:00",
      muted_topics: [],
    },
    role: "admin",
    reports: [
      {
        id: demoId(90),
        target_type: "post",
        target_id: demoId(11),
        reason: "Illustrative report for the preview moderation queue.",
        status: "open",
        created_at: ago(50),
        evidence: {
          body: "Fictional reported content. This queue is a demonstration only.",
        },
      },
    ],
    resources: [],
  };
}
