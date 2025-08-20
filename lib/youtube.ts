export async function searchYouTube(query: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=10`
  );
  if (!res.ok) throw new Error("Failed to fetch from YouTube API");
  const data = await res.json();
  return data.items;
}
