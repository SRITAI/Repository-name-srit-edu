import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product_name = "Hero Product",
      product_benefits = [],
      product_usp = "",
      target_audience = "Young consumers",
      tone = "Bold",
      duration_seconds = 30,
    } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      // Call Anthropic Claude if API key is provided
      try {
        const prompt = `You are an elite direct-response video ad director.
Write 3 distinct high-converting TikTok/Reel video script concepts for a real human creator on camera.
Product: ${product_name}
USP: ${product_usp}
Benefits: ${product_benefits.join(", ")}
Target Audience: ${target_audience}
Tone: ${tone}
Target Duration: ${duration_seconds} seconds (~${Math.round(duration_seconds * 2.5)} words)

For each option, output strictly formatted:
Option 1: [Hook Title]
[HOOK - 0 to 3s]: (Visual action + spoken words)
[BODY - 3 to 22s]: (Real human demo + emotional benefit)
[CTA - 22 to 30s]: (Actionable offer)

Option 2: [Hook Title]
...
Option 3: [Hook Title]
...`;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const generatedText = data.content?.[0]?.text || "";
          return NextResponse.json({
            success: true,
            source: "anthropic",
            options: parseScriptOptions(generatedText),
          });
        }
      } catch (err) {
        console.warn("Anthropic API failed, falling back to local generator", err);
      }
    }

    // High-converting rule-based script generation fallback
    const options = [
      {
        id: "opt-1",
        title: "The Problem-Solution Stress Test Hook",
        hook: `[Camera close-up on real human expression looking frustrated]: "I used to waste so much time struggling with ${product_name.toLowerCase()} until I discovered this one tweak."`,
        body: `[Cuts to hands-on physical demo showing ${product_usp || product_benefits[0] || "effortless performance"}]: "Look at how this immediately solves it. Notice how ${product_benefits[1] || "smooth and fast"} this works compared to standard alternatives. Real texture, zero gimmicks."`,
        cta: `"If you want to experience ${product_name}, tap the link below now to claim your first-order bonus."`,
        fullScript: `[HOOK - 0 to 3s]:\n"I used to waste so much time struggling with ${product_name.toLowerCase()} until I discovered this one tweak."\n\n[BODY - 3 to 22s]:\n"Look at how this immediately solves it. Notice how ${product_usp || product_benefits[0] || "effortless performance"} works compared to standard alternatives. Real texture, zero gimmicks."\n\n[CTA - 22 to 30s]:\n"Tap the link below now to claim your first-order bonus."`,
      },
      {
        id: "opt-2",
        title: "The Honest Before-After Wear Test",
        hook: `[Macro camera on product application]: "Do NOT buy ${product_name} before you watch this 12-hour real wear test."`,
        body: `[Fast-paced cuts of morning routine, lunch test, and evening gym]: "Here is 8 AM application. Now it's 2 PM after lunch — still completely intact. And here is 8 PM: zero fading, exactly as promised."`,
        cta: `"Get yours before this current batch sells out at the link in bio."`,
        fullScript: `[HOOK - 0 to 3s]:\n"Do NOT buy ${product_name} before you watch this 12-hour real wear test."\n\n[BODY - 3 to 22s]:\n"Here is 8 AM application. Now it's 2 PM after lunch — still completely intact. And here is 8 PM: zero fading, exactly as promised."\n\n[CTA - 22 to 30s]:\n"Get yours before this current batch sells out at the link in bio."`,
      },
      {
        id: "opt-3",
        title: "The Relatable Day-in-the-Life Routine",
        hook: `[Creator walking into frame with coffee]: "3 things in my routine that I will never compromise on, starting with this."`,
        body: `[Quick cuts styling or using ${product_name}]: "It specifically helps with ${product_benefits[0] || "daily confidence"} without any complicated steps. Simple, high quality, and built to last."`,
        cta: `"Try it today with free express shipping across all orders."`,
        fullScript: `[HOOK - 0 to 3s]:\n"3 things in my routine that I will never compromise on, starting with this."\n\n[BODY - 3 to 22s]:\n"It specifically helps with ${product_benefits[0] || "daily confidence"} without any complicated steps. Simple, high quality, and built to last."\n\n[CTA - 22 to 30s]:\n"Try it today with free express shipping across all orders."`,
      },
    ];

    return NextResponse.json({
      success: true,
      source: "template_engine",
      options,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}

function parseScriptOptions(text: string) {
  // If text is structured, split into options
  return [
    {
      id: "ai-1",
      title: "AI Generated Concept 1",
      fullScript: text.slice(0, 500),
    },
    {
      id: "ai-2",
      title: "AI Generated Concept 2",
      fullScript: text.slice(500, 1000) || text.slice(0, 500),
    },
  ];
}
