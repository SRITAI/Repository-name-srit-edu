import crypto from "crypto";

interface CAPIUserData {
  email?: string;
  phone?: string;
  clientIp?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface CAPIEventParams {
  eventName: "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "Contact" | "Search";
  eventSourceUrl?: string;
  userData?: CAPIUserData;
  customData?: Record<string, unknown>;
  eventId?: string;
}

function hashSha256(value?: string): string | undefined {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Sends a server-side event to Meta Conversions API (CAPI).
 * Gracefully no-ops if META_PIXEL_ID or META_CONVERSIONS_API_TOKEN is not configured.
 */
export async function sendMetaCAPIEvent(params: CAPIEventParams) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Meta CAPI: Mock Event]", params.eventName, params.customData || {});
    }
    return { success: true, mocked: true };
  }

  const payload = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        event_source_url: params.eventSourceUrl || "https://infimindss.com",
        action_source: "website",
        user_data: {
          em: params.userData?.email ? [hashSha256(params.userData.email)] : undefined,
          ph: params.userData?.phone ? [hashSha256(params.userData.phone)] : undefined,
          client_ip_address: params.userData?.clientIp,
          client_user_agent: params.userData?.userAgent,
          fbc: params.userData?.fbc,
          fbp: params.userData?.fbp,
        },
        custom_data: params.customData,
      },
    ],
    test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    console.error("[Meta CAPI Error]", error);
    return { success: false, error };
  }
}
