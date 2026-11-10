/**
 * Video & Media Embed Parser & Allowlist Validator
 * 
 * Strict host allowlist parser for external link-based video playback.
 * - Accept HTTPS links only.
 * - Parses and validates provider URLs using an explicit host allowlist.
 * - Never injects arbitrary URLs into iframes.
 * - Emits safe, official embed URLs with standard privacy and playback parameters.
 * - Autoplay is strictly disabled.
 */

export type VideoProvider =
  | 'youtube'
  | 'vimeo'
  | 'tiktok'
  | 'instagram'
  | 'direct_video'
  | 'unsupported';

export interface ParsedMediaEmbed {
  originalUrl: string;
  canEmbed: boolean;
  provider: VideoProvider;
  embedUrl?: string;
  videoId?: string;
  isDirectVideo: boolean;
  notice?: string;
}

// Host allowlists for embeddable providers
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const VIMEO_HOSTS = new Set([
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
]);

const TIKTOK_HOSTS = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com',
]);

const INSTAGRAM_HOSTS = new Set([
  'instagram.com',
  'www.instagram.com',
]);

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];

/**
 * Parses and sanitizes an external media URL.
 * Only returns canEmbed = true if the URL matches a documented, secure provider format or direct video.
 */
export function parseVideoMediaUrl(rawUrl: string | null | undefined): ParsedMediaEmbed {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      originalUrl: '',
      canEmbed: false,
      provider: 'unsupported',
      isDirectVideo: false,
      notice: 'No media link provided.',
    };
  }

  const trimmed = rawUrl.trim();

  // 1. Enforce HTTPS only
  if (!trimmed.startsWith('https://')) {
    return {
      originalUrl: trimmed,
      canEmbed: false,
      provider: 'unsupported',
      isDirectVideo: false,
      notice: 'Insecure URL scheme: only secure HTTPS links are allowed.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      originalUrl: trimmed,
      canEmbed: false,
      provider: 'unsupported',
      isDirectVideo: false,
      notice: 'Malformed URL.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // 2. Check for direct HTTPS video file (e.g. https://domain.com/video.mp4)
  const isDirectVideo = DIRECT_VIDEO_EXTENSIONS.some((ext) =>
    pathname.toLowerCase().endsWith(ext)
  );

  if (isDirectVideo) {
    return {
      originalUrl: trimmed,
      canEmbed: true,
      provider: 'direct_video',
      embedUrl: trimmed, // safe direct video source
      isDirectVideo: true,
      notice: 'Direct HTML5 video source.',
    };
  }

  // 3. YouTube parsing
  if (YOUTUBE_HOSTS.has(hostname)) {
    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      videoId = pathname.replace(/^\//, '').split('/')[0] || null;
    } else if (pathname.startsWith('/shorts/')) {
      videoId = pathname.replace('/shorts/', '').split('/')[0] || null;
    } else if (pathname.startsWith('/embed/')) {
      videoId = pathname.replace('/embed/', '').split('/')[0] || null;
    } else if (parsed.searchParams.has('v')) {
      videoId = parsed.searchParams.get('v');
    }

    // Sanitize video ID: standard YouTube IDs are 11 alphanumeric characters (plus - and _)
    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      return {
        originalUrl: trimmed,
        canEmbed: true,
        provider: 'youtube',
        videoId,
        isDirectVideo: false,
        embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1&autoplay=0`,
      };
    }

    return {
      originalUrl: trimmed,
      canEmbed: false,
      provider: 'youtube',
      isDirectVideo: false,
      notice: 'YouTube channel or search page (not an individual playable video).',
    };
  }

  // 4. Vimeo parsing
  if (VIMEO_HOSTS.has(hostname)) {
    // Format: https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
    const match = pathname.match(/\/(?:video\/)?(\d{6,12})/);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        originalUrl: trimmed,
        canEmbed: true,
        provider: 'vimeo',
        videoId,
        isDirectVideo: false,
        embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?dnt=1&autoplay=0`,
      };
    }

    return {
      originalUrl: trimmed,
      canEmbed: false,
      provider: 'vimeo',
      isDirectVideo: false,
      notice: 'Vimeo showcase or profile page.',
    };
  }

  // 5. TikTok parsing
  if (TIKTOK_HOSTS.has(hostname)) {
    // Format: https://www.tiktok.com/@creator/video/1234567890123456789
    const match = pathname.match(/\/video\/(\d{15,25})/);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        originalUrl: trimmed,
        canEmbed: true,
        provider: 'tiktok',
        videoId,
        isDirectVideo: false,
        embedUrl: `https://www.tiktok.com/embed/v2/${encodeURIComponent(videoId)}`,
      };
    }

    return {
      originalUrl: trimmed,
      canEmbed: false,
      provider: 'tiktok',
      isDirectVideo: false,
      notice: 'TikTok profile or Creative Center overview page.',
    };
  }

  // 6. Instagram / Meta Reel or Post
  if (INSTAGRAM_HOSTS.has(hostname)) {
    // Format: https://www.instagram.com/p/CODE/ or /reel/CODE/ or /reels/CODE/
    const match = pathname.match(/\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/);
    if (match && match[1]) {
      const code = match[1];
      return {
        originalUrl: trimmed,
        canEmbed: true,
        provider: 'instagram',
        videoId: code,
        isDirectVideo: false,
        embedUrl: `https://www.instagram.com/reel/${encodeURIComponent(code)}/embed/`,
      };
    }

    return {
      originalUrl: trimmed,
      canEmbed: false,
      provider: 'instagram',
      isDirectVideo: false,
      notice: 'Instagram profile or feed link.',
    };
  }

  // 7. Unsupported / External platform ad library link
  // (e.g. facebook.com/ads/library, adstransparency.google.com, linkedin.com/ad-library)
  return {
    originalUrl: trimmed,
    canEmbed: false,
    provider: 'unsupported',
    isDirectVideo: false,
    notice: 'Official ad library or platform transparency portal — open on original host.',
  };
}
