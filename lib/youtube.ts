// Извлекает YouTube video ID из любого формата ссылки:
// https://www.youtube.com/watch?v=XXXXX
// https://youtu.be/XXXXX
// https://youtube.com/shorts/XXXXX
// Если передан просто ID — возвращает его как есть
export function extractYoutubeId(input: string): string {
  const s = input.trim()
  try {
    const url = new URL(s)
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1)
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2]
    return url.searchParams.get('v') ?? s
  } catch {
    return s
  }
}

export function youtubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}
