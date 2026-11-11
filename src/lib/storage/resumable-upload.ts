import * as tus from "tus-js-client";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export const MAX_FILE_SIZE_BYTES = 52428800; // 50 MB
export const BUCKET_NAME = "ad-previews";
export const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".webp"] as const;
export const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  formattedUploaded: string;
  formattedTotal: string;
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  fileType: "hosted_video" | "image";
}

export interface StartResumableUploadOptions {
  file: File;
  bucketName?: string;
  onProgress: (progress: UploadProgress) => void;
  onSuccess: (publicUrl: string, storagePath: string) => void;
  onError: (error: Error) => void;
}

export interface ActiveUploadHandle {
  abort: () => void;
}

/**
 * Format bytes into readable string (e.g. 12.4 MB, 850 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || "MB"}`;
}

/**
 * Pre-upload file validation: size, extension, MIME type
 */
export function validateMediaFile(file: File): UploadValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided for upload.", fileType: "hosted_video" };
  }

  // 1. Size check (50 MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeStr = formatBytes(file.size);
    const limitStr = formatBytes(MAX_FILE_SIZE_BYTES);
    return {
      valid: false,
      error: `File size (${sizeStr}) exceeds the ${limitStr} storage limit. Please compress the file or provide an external video link.`,
      fileType: "hosted_video",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "Selected file is empty (0 bytes). Please select a valid video or image.",
      fileType: "hosted_video",
    };
  }

  // 2. Extension check
  const fileName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  if (!hasAllowedExt) {
    const isGif = fileName.endsWith(".gif");
    return {
      valid: false,
      error: isGif
        ? "GIF files are not accepted. Supported formats: MP4, WebM, MOV, JPEG, PNG, WebP."
        : `Unsupported file extension. Supported extensions: ${ALLOWED_EXTENSIONS.join(", ")}`,
      fileType: "hosted_video",
    };
  }

  // 3. MIME type check
  if (file.type) {
    const normalizedMime = file.type.toLowerCase();
    const isAllowedMime = (ALLOWED_MIME_TYPES as readonly string[]).includes(normalizedMime);
    if (!isAllowedMime) {
      const isGifMime = normalizedMime === "image/gif";
      return {
        valid: false,
        error: isGifMime
          ? "GIF files are not accepted by the media storage bucket. Supported formats: MP4, WebM, QuickTime (MOV), JPEG, PNG, WebP."
          : `Unsupported MIME type "${file.type}". Supported formats: MP4, WebM, QuickTime (MOV), JPEG, PNG, WebP.`,
        fileType: "hosted_video",
      };
    }
  }

  const isImage =
    file.type.startsWith("image/") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".webp");

  const fileType: "hosted_video" | "image" = isImage ? "image" : "hosted_video";

  return { valid: true, fileType };
}

/**
 * Returns the recommended direct storage resumable TUS upload endpoint.
 * According to official Supabase Storage guidance, for optimal performance when uploading
 * large files, always use the direct storage hostname:
 * `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`
 * instead of the general API gateway `https://${projectId}.supabase.co`.
 */
export function getStorageResumableEndpoint(supabaseUrl: string): string {
  try {
    const parsed = new URL(supabaseUrl.trim());
    const hostname = parsed.hostname.toLowerCase();
    // Convert <project-ref>.supabase.co -> <project-ref>.storage.supabase.co
    if (hostname.endsWith(".supabase.co") && !hostname.includes(".storage.supabase.co")) {
      const parts = hostname.split(".");
      if (parts.length === 3) {
        parsed.hostname = `${parts[0]}.storage.supabase.co`;
      }
    }
    return `${parsed.origin}/storage/v1/upload/resumable`;
  } catch {
    return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/upload/resumable`;
  }
}

/**
 * Creates unique, non-colliding storage path
 */
export function generateStoragePath(file: File, folder = "curated"): string {
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");
  const uniqueId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 10);
  return `${folder}/${Date.now()}-${uniqueId}_${sanitizedName}`;
}

/**
 * Initiates resumable TUS upload to Supabase Storage
 */
export async function startResumableUpload({
  file,
  bucketName = BUCKET_NAME,
  onProgress,
  onSuccess,
  onError,
}: StartResumableUploadOptions): Promise<ActiveUploadHandle> {
  // Validate file
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    const err = new Error(validation.error || "Invalid file");
    onError(err);
    return { abort: () => {} };
  }

  const supabase = createBrowserClient();
  if (!supabase) {
    // Demo / offline preview mode fallback
    const mockUrl = URL.createObjectURL(file);
    onProgress({
      bytesUploaded: file.size,
      bytesTotal: file.size,
      percentage: 100,
      formattedUploaded: formatBytes(file.size),
      formattedTotal: formatBytes(file.size),
    });
    onSuccess(mockUrl, `mock/${file.name}`);
    return { abort: () => {} };
  }

  // Get active session token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    const err = new Error("Administrator session expired or required for storage upload. Please sign in again.");
    onError(err);
    return { abort: () => {} };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    const err = new Error("Supabase configuration missing (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).");
    onError(err);
    return { abort: () => {} };
  }

  const storagePath = generateStoragePath(file);
  const tusEndpoint = getStorageResumableEndpoint(supabaseUrl);

  let tusUpload: tus.Upload | null = null;

  try {
    tusUpload = new tus.Upload(file, {
      endpoint: tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName,
        objectName: storagePath,
        contentType: file.type || (validation.fileType === "image" ? "image/jpeg" : "video/mp4"),
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024, // 6 MiB as specified
      onError: (error) => {
        let friendlyMessage = error.message;
        if (error.message.includes("403") || error.message.includes("security policy")) {
          friendlyMessage = "Upload denied by storage security policies. Please ensure your account has administrator privileges.";
        } else if (error.message.includes("413") || error.message.includes("too large")) {
          friendlyMessage = "File exceeds maximum bucket file size limit (50 MB).";
        } else if (error.message.includes("network") || error.message.includes("Failed to fetch")) {
          friendlyMessage = "Network interruption while uploading file. Please check connection and retry.";
        }
        onError(new Error(friendlyMessage));
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        if (bytesTotal > 0) {
          // Cap at 99% until complete confirmation
          const percentage = Math.min(99, Math.floor((bytesUploaded / bytesTotal) * 100));
          onProgress({
            bytesUploaded,
            bytesTotal,
            percentage,
            formattedUploaded: formatBytes(bytesUploaded),
            formattedTotal: formatBytes(bytesTotal),
          });
        }
      },
      onSuccess: () => {
        // Complete 100% only on confirmed completion
        onProgress({
          bytesUploaded: file.size,
          bytesTotal: file.size,
          percentage: 100,
          formattedUploaded: formatBytes(file.size),
          formattedTotal: formatBytes(file.size),
        });

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        onSuccess(publicUrl, storagePath);
      },
    });

    // Check if there are any previous uploads to continue, then start
    tusUpload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads && previousUploads.length > 0 && tusUpload) {
        tusUpload.resumeFromPreviousUpload(previousUploads[0]);
      }
      tusUpload?.start();
    }).catch(() => {
      tusUpload?.start();
    });

    return {
      abort: () => {
        if (tusUpload) {
          tusUpload.abort();
        }
      },
    };
  } catch (err: any) {
    onError(new Error(err?.message || "Failed to initiate resumable upload"));
    return { abort: () => {} };
  }
}
