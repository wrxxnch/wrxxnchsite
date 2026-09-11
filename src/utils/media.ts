export function getEmbedVideoUrl(url?: string): { isYoutube: boolean; embedUrl: string } {
  if (!url) return { isYoutube: false, embedUrl: '' };

  const trimmed = url.trim();
  
  // YouTube watch URL
  const ytWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return {
      isYoutube: true,
      embedUrl: `https://www.youtube.com/embed/${ytWatchMatch[1]}?autoplay=0&rel=0`
    };
  }

  return {
    isYoutube: false,
    embedUrl: trimmed
  };
}

export function isDirectVideoUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}
