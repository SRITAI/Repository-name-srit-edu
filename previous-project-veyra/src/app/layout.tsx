import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Veyra AI — Create beyond imagination",
  description: "A cinematic demo studio for AI image and video creation. Explore ideas, create mock previews, and build your visual world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
