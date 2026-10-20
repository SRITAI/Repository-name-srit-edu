import { notFound } from "next/navigation";
import { ProductRouter } from "@/features/app/router";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Fictional preview",
  robots: { index: false, follow: false },
};
export default async function Preview({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (process.env.NEXT_PUBLIC_ENABLE_PREVIEW === "false") notFound();
  const { path } = await params;
  return <ProductRouter path={path?.join("/") || "home"} preview />;
}
