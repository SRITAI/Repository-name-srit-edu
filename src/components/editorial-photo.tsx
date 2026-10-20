import type { CSSProperties } from "react";

// Editorial illustrations only. These images never represent member identities.
const photos = {
  connection: {
    file: "connection",
    alt: "Two women sharing a conversation over coffee",
    position: "50% 43%",
    height: 800,
  },
  moving: {
    file: "moving-forward",
    alt: "A person looking out at the sea from the shore",
    position: "50% 55%",
    height: 800,
  },
  finance: {
    file: "finance",
    alt: "A calculator, notebook and cash arranged on a desk",
    position: "50% 50%",
    height: 800,
  },
  studying: {
    file: "studying",
    alt: "Hands taking notes beside an open laptop",
    position: "50% 45%",
    height: 1800,
  },
  wellbeing: {
    file: "wellbeing",
    alt: "Morning light falling across a quiet forest path",
    position: "50% 55%",
    height: 900,
  },
};
const topics: Record<string, keyof typeof photos> = {
  "moving-forward": "moving",
  relationships: "connection",
  "finding-connection": "connection",
  "emotional-wellbeing": "wellbeing",
  "financial-stress": "finance",
  "study-pressure": "studying",
  "founder-pressure": "studying",
  "career-challenges": "studying",
  "family-personal": "connection",
  "everything-at-once": "wellbeing",
};

export function EditorialPhoto({
  topic,
  className = "",
  eager = false,
}: {
  topic: string;
  className?: string;
  eager?: boolean;
}) {
  const photo = photos[topics[topic] || "wellbeing"];
  return (
    <img
      className={`editorial-photo ${className}`}
      src={`/images/editorial/${photo.file}.webp`}
      alt={photo.alt}
      width={1200}
      height={photo.height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      style={{ "--photo-position": photo.position } as CSSProperties}
    />
  );
}
