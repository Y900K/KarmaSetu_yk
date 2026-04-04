/**
 * Intelligent utility to transform various document storage URLs into embeddable formats.
 * Supports Google Drive, Dropbox, OneDrive, and Direct PDF links.
 */
export function getEmbeddableUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const cleanUrl = url.trim();

  // 1. Google Drive Patterns
  // Pattern: /file/d/FILE_ID/view or /file/d/FILE_ID/edit or open?id=FILE_ID
  const driveFilePattern = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveOpenPattern = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  
  const driveFileMatch = cleanUrl.match(driveFilePattern);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  const driveOpenMatch = cleanUrl.match(driveOpenPattern);
  if (driveOpenMatch && driveOpenMatch[1]) {
    return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`;
  }

  // 2. Dropbox Patterns
  // Transform share links (dl=0) to direct/embed links (raw=1)
  if (cleanUrl.includes('dropbox.com')) {
    if (cleanUrl.includes('dl=0')) {
      return cleanUrl.replace('dl=0', 'raw=1');
    }
    if (!cleanUrl.includes('raw=1')) {
      return cleanUrl + (cleanUrl.includes('?') ? '&raw=1' : '?raw=1');
    }
    return cleanUrl;
  }

  // 3. Direct PDF Pattern
  if (cleanUrl.toLowerCase().endsWith('.pdf') || cleanUrl.includes('.pdf?')) {
    // Only wrap external URLs in Google Docs Viewer
    if (/^https?:\/\//i.test(cleanUrl)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
    }
    return cleanUrl; // Local PDFs can be shown by the browser directly
  }

  // 4. Fallback for external documents
  // For non-image external documents, prefer a wrapped viewer URL to reduce iframe-block cases.
  if (/^https?:\/\//i.test(cleanUrl)) {
    const lower = cleanUrl.toLowerCase();
    const isLikelyImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(lower);
    if (!isLikelyImage && !lower.endsWith('.pdf')) { // .pdf is handled above
      return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
    }
  }

  return cleanUrl;
}

/**
 * Secondary helper to determine if a URL is likely to be embeddable directly in an iframe
 */
export function isEmbeddable(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('dropbox.com') ||
    lower.endsWith('.pdf') ||
    lower.includes('docs.google.com')
  );
}
