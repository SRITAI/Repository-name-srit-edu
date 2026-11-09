import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infimindss.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/explore/*", "/studio", "/login", "/signup"],
        disallow: ["/admin", "/admin/*", "/studio/projects", "/studio/projects/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
