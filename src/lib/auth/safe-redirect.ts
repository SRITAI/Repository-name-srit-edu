/**
 * Safe redirect URL sanitization and route context helpers.
 * Prevents open-redirect attacks by ensuring all destinations are strictly same-site paths.
 */

export const DEFAULT_STUDIO_PATH = "/studio/projects";
export const DEFAULT_ADMIN_PATH = "/admin/ad-explorer";

/**
 * Validates and sanitizes a requested redirect URL.
 * Only relative same-origin paths starting with a single '/' are allowed.
 * Scheme-relative URLs ('//'), backslashes ('/\'), external origins ('https://'),
 * and dangerous protocols ('javascript:', 'data:') are rejected and replaced with the safe default.
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  defaultPath: string = DEFAULT_STUDIO_PATH
): string {
  if (!target || typeof target !== "string") {
    return defaultPath;
  }

  const trimmed = target.trim();

  // Must begin with a single slash, not a scheme-relative '//' or backslash '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return defaultPath;
  }

  // Reject URLs containing protocol specifiers or backslashes
  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return defaultPath;
  }

  // Reject dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("/javascript:") || lower.startsWith("/data:")) {
    return defaultPath;
  }

  try {
    // Parse against a dummy base origin to verify path structure
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return defaultPath;
    }
    // Return sanitized pathname + search + hash
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return defaultPath;
  }
}

/**
 * Checks if a given URL or path represents an administrative route.
 */
export function isAdminPath(path: string | null | undefined): boolean {
  if (!path) return false;
  const safe = getSafeRedirectUrl(path, "");
  return safe.startsWith("/admin");
}
