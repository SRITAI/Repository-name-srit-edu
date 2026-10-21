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
  relationships: {
    file: "relationships",
    alt: "Two people holding hands beside the water at sunset",
    position: "50% 50%",
    height: 1460,
  },
  founder: {
    file: "founder",
    alt: "Two coworkers discussing a project beside an open laptop",
    position: "50% 38%",
    height: 800,
  },
  career: {
    file: "career",
    alt: "An application form being completed at an office desk",
    position: "50% 50%",
    height: 800,
  },
  family: {
    file: "family",
    alt: "A mother and daughter sharing a conversation at the table",
    position: "50% 40%",
    height: 1797,
  },
  everything: {
    file: "everything",
    alt: "A small stack of smooth stones balanced on the beach",
    position: "50% 50%",
    height: 1800,
  },
  feature: {
    file: "community-feature",
    alt: "A group of friends walking together through a green park",
    position: "50% 42%",
    height: 800,
  },
};
const topics: Record<string, keyof typeof photos> = {
  "moving-forward": "moving",
  relationships: "relationships",
  "finding-connection": "connection",
  "emotional-wellbeing": "wellbeing",
  "financial-stress": "finance",
  "study-pressure": "studying",
  "founder-pressure": "founder",
  "career-challenges": "career",
  "family-personal": "family",
  "everything-at-once": "everything",
};

export function EditorialPhoto({
  topic,
  className = "",
  eager = false,
  variant = "category",
}: {
  topic: string;
  className?: string;
  eager?: boolean;
  variant?: "category" | "feature";
}) {
  const photo =
    photos[variant === "feature" ? "feature" : topics[topic] || "wellbeing"];
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
