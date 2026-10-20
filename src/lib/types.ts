export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar: string;
  language?: string;
  intent?: string;
  topics?: string[];
  reason?: string;
};
export type Media = {
  id: string;
  kind: "image" | "video";
  url?: string;
  caption?: string;
};
export type Post = {
  id: string;
  author_id: string;
  body: string;
  community_slug: string;
  audience: "community" | "connections" | "draft";
  warning: string;
  comments_enabled: boolean;
  hide_counts: boolean;
  created_at: string;
  author?: Profile;
  media?: Media[];
  reactions?: { user_id: string; kind: string }[];
  comments?: Comment[];
  journey_id?: string | null;
};
export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  parent_id?: string | null;
  created_at: string;
  author?: Profile;
};
export type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined";
  note: string;
  conversation_id?: string;
};
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  reply_to?: string | null;
  media?: Media[];
  reactions?: { user_id: string; kind: string }[];
};
export type Conversation = {
  unread_count?: number;
  id: string;
  other: Profile;
  muted: boolean;
  archived: boolean;
  ended: boolean;
  last_read_at?: string;
  other_read_at?: string | null;
  messages: Message[];
};
export type Settings = {
  discovery: boolean;
  show_topics: boolean;
  profile_visible: boolean;
  accept_requests: boolean;
  reduce_motion: boolean;
  read_receipts: boolean;
  notifications: boolean;
  quiet_start: string;
  quiet_end: string;
  muted_topics: string[];
};
export type Notification = {
  id: string;
  body: string;
  href: string;
  read: boolean;
  created_at: string;
};
export type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
  evidence?: Record<string, unknown>;
};
export type Community = {
  slug: string;
  name: string;
  description: string;
  guidelines: string;
  pinned: string;
};
export type AppData = {
  me: Profile;
  posts: Post[];
  people: Profile[];
  memberships: string[];
  bookmarks: string[];
  connections: Connection[];
  conversations: Conversation[];
  notifications: Notification[];
  blocks: string[];
  dismissed: string[];
  settings: Settings;
  role: "member" | "moderator" | "admin";
  reports: Report[];
  communities?: Community[];
  resources: {
    id: string;
    region: string;
    name: string;
    url: string;
    last_checked: string;
  }[];
};
