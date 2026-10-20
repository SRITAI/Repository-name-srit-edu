"use client";
import Link from "next/link";
import {
  useId,
  useEffect,
  useRef,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  HeartHandshake,
  Users,
  Flower2,
  Wallet,
  BookOpen,
  Sprout,
  BriefcaseBusiness,
  House,
  Orbit,
  X,
  ShieldCheck,
  MessageCircle,
  Plus,
  Compass,
  Bell,
  Settings,
  LifeBuoy,
  Bookmark,
  Image,
  Video,
  Send,
  Smile,
  Ellipsis,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Flag,
  Lock,
  Eye,
  EyeOff,
  VolumeX,
  Trash2,
  Reply,
  LoaderCircle,
  Download,
  Menu,
  Sun,
  Moon,
  Link as LinkIcon,
  CheckCheck,
  ChevronDown,
  User,
  SlidersHorizontal,
  PenLine,
  Upload,
  Calendar,
  RefreshCw,
  WifiOff,
  Mail,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
export const icons: Record<string, LucideIcon> = {
  heart: Heart,
  "heart-handshake": HeartHandshake,
  users: Users,
  flower: Flower2,
  wallet: Wallet,
  book: BookOpen,
  sprout: Sprout,
  briefcase: BriefcaseBusiness,
  home: House,
  orbit: Orbit,
  arrow: ArrowUpRight,
  "arrow-right": ArrowRight,
  shield: ShieldCheck,
  message: MessageCircle,
  plus: Plus,
  compass: Compass,
  bell: Bell,
  settings: Settings,
  help: LifeBuoy,
  bookmark: Bookmark,
  image: Image,
  video: Video,
  send: Send,
  smile: Smile,
  more: Ellipsis,
  search: Search,
  check: Check,
  right: ChevronRight,
  left: ChevronLeft,
  logout: LogOut,
  flag: Flag,
  lock: Lock,
  eye: Eye,
  "eye-off": EyeOff,
  mute: VolumeX,
  trash: Trash2,
  reply: Reply,
  loader: LoaderCircle,
  download: Download,
  menu: Menu,
  close: X,
  sun: Sun,
  moon: Moon,
  link: LinkIcon,
  read: CheckCheck,
  down: ChevronDown,
  user: User,
  filter: SlidersHorizontal,
  edit: PenLine,
  upload: Upload,
  calendar: Calendar,
  retry: RefreshCw,
  offline: WifiOff,
  mail: Mail,
};
export function Icon({
  name,
  size = 20,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  const I = icons[name] || Flower2;
  return <I size={size} strokeWidth={1.6} aria-hidden {...props} />;
}
export function Mark() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M9 23C2 17 9 7 15 13L21 23C27 29 34 19 27 13M9 23C15 29 21 23 18 18C15 13 21 7 27 13"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="sritedu home">
      <Mark />
      <span>
        sritedu<span className="logo-dot">.</span>
      </span>
    </Link>
  );
}
export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button {...props} className={clsx("button", variant, className)}>
      {children}
    </button>
  );
}
export function Avatar({
  person,
  size = "md",
}: {
  person?: { display_name?: string; avatar?: string; id?: string };
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const gradient = "avatar" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const avatar = person?.avatar || "bloom";
  return (
    <span
      role="img"
      className={clsx("avatar", size)}
      aria-label={person?.display_name || "Non-photo avatar"}
    >
      {avatar.startsWith("media:") ? (
        <img
          alt={person?.display_name || "Profile photo"}
          src={"/api/media/" + avatar.slice(6)}
        />
      ) : avatar.startsWith("data:") || avatar.startsWith("blob:") ? (
        <img alt="Profile photo" src={avatar} />
      ) : (
        <svg viewBox="0 0 48 48" aria-hidden>
          <defs>
            <radialGradient id={gradient}>
              <stop stopColor="#FF8FBE" />
              <stop offset="1" stopColor="#C51E62" />
            </radialGradient>
          </defs>
          <rect width="48" height="48" fill="#211019" />
          {avatar === "orbit" ? (
            <>
              <ellipse
                cx="24"
                cy="24"
                rx="16"
                ry="7"
                fill="none"
                stroke="#FF8FBE"
                transform="rotate(-35 24 24)"
              />
              <circle cx="24" cy="24" r="8" fill="#FF4F9A" />
            </>
          ) : avatar === "moon" ? (
            <path
              d="M33 11A17 17 0 1 0 37 32A15 15 0 0 1 33 11"
              fill="#FF8FBE"
            />
          ) : (
            <g fill={"url(#" + gradient + ")"}>
              {Array.from({ length: 6 }, (_, i) => (
                <ellipse
                  key={i}
                  cx="24"
                  cy="16"
                  rx="5.5"
                  ry="10"
                  transform={`rotate(${i * 60} 24 24)`}
                />
              ))}
              <circle cx="24" cy="24" r="4" fill="#FFF5F9" />
            </g>
          )}
        </svg>
      )}
    </span>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={clsx("modal", wide && "wide", className)}
          aria-describedby={undefined}
        >
          <div className="modal-header">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Empty({
  icon = "flower",
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const labelId = useId(),
    hintId = useId();
  const control =
    isValidElement(children) &&
    ["input", "textarea", "select"].includes(String(children.type))
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-labelledby": labelId,
          ...(hint ? { "aria-describedby": hintId } : {}),
        })
      : children;
  return (
    <label className="field">
      <span id={labelId}>{label}</span>
      {control}
      {hint && <small id={hintId}>{hint}</small>}
    </label>
  );
}
export function Toggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch" aria-hidden />
    </label>
  );
}

export function ActionMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node))
        ref.current?.removeAttribute("open");
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        (ref.current.querySelector("summary") as HTMLElement)?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <details
      ref={ref}
      className="action-menu"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button"))
          e.currentTarget.open = false;
      }}
    >
      {children}
    </details>
  );
}
