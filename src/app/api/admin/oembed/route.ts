import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const appId = process.env.META_APP_ID;
  const clientToken = process.env.META_CLIENT_TOKEN;

  if (appId && clientToken) {
    try {
      const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(
        url
      )}&access_token=${appId}|${clientToken}&omitscript=true`;

      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          title: data.title || "",
          author_name: data.author_name || "",
          thumbnail_url: data.thumbnail_url || "",
          html: data.html || "",
        });
      }
    } catch (err) {
      console.warn("[Meta oEmbed error]", err);
    }
  }

  // Fallback if Meta app tokens are not yet configured
  // Extract handle or clean slug from URL
  let parsedHandle = "creator";
  const match = url.match(/instagram\.com\/(?:p|reel|reels)\/([^/?#&]+)/);
  const code = match ? match[1] : "reel_demo";

  return NextResponse.json({
    title: `Trending Reel (${code})`,
    author_name: `@${parsedHandle}`,
    thumbnail_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    html: "",
    fallback: true,
  });
}
