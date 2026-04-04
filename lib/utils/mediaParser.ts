/**
 * Standardizes YouTube/Drive links into embeddable formats.
 */
export function getEmbeddableURL(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // 1. Google Drive Handling
  // Standard: drive.google.com/file/d/FILE_ID/view...
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveMatch = trimmed.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // 2. YouTube Handling
  // Covers: watch?v=, youtu.be/, /shorts/, /live/, /embed/, /v/
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';

    if (host.includes('youtu.be')) {
      videoId = parsed.pathname.replace(/^\//, '').split('/')[0] || '';
    } else if (host.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v') || '';
      if (!videoId) {
        const segments = parsed.pathname.split('/').filter(Boolean);
        const markerIndex = segments.findIndex((segment) => ['embed', 'shorts', 'live', 'v'].includes(segment));
        if (markerIndex >= 0 && segments[markerIndex + 1]) {
          videoId = segments[markerIndex + 1];
        }
      }
    }

    // Hard guard to avoid broken iframe URLs.
    if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
  } catch {
    // Fall through to regex fallback below.
  }

  const ytFallback = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/i);
  if (ytFallback && ytFallback[1]) {
    return `https://www.youtube.com/embed/${ytFallback[1]}?rel=0&modestbranding=1`;
  }

  return trimmed;
}

// Keep aliases for backward compatibility if needed, but they both use getEmbeddableURL now
export const getEmbeddableYoutubeUrl = getEmbeddableURL;
export const getEmbeddableDriveUrl = getEmbeddableURL;

