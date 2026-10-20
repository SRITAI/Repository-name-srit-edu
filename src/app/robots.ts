import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/help", "/guidelines", "/privacy", "/terms"],
      disallow: [
        "/home",
        "/communities",
        "/discover",
        "/messages",
        "/notifications",
        "/u/",
        "/post/",
        "/settings",
        "/admin",
        "/onboarding",
        "/preview",
        "/api/",
      ],
    },
  };
}
