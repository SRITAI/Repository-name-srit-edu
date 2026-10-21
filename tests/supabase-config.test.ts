import { afterEach, describe, expect, it, vi } from "vitest";
import { publicSupabaseKey } from "../src/lib/supabase/public-config";

afterEach(() => vi.unstubAllEnvs());

describe("Supabase public key compatibility", () => {
  it("prefers the publishable key when both variable names are present", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "publishable-test-value",
    );
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-test-value");
    expect(publicSupabaseKey()).toBe("publishable-test-value");
  });
  it("accepts the legacy public anon variable", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-test-value");
    expect(publicSupabaseKey()).toBe("legacy-test-value");
  });
  it("does not substitute a privileged server key for a missing public key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-only-test-value");
    expect(publicSupabaseKey()).toBeFalsy();
  });
});
