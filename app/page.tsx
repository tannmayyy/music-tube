
"use client"

import { useEffect, useState } from "react"
import { Search, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import ResponsiveAudioPlayer from "@/components/ResponsiveAudioPlayer"

interface YouTubeVideo {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    thumbnails: {
      medium: { url: string }
    }
    publishedAt: string
  }
}

export default function MusicTubePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videos, setVideos] = useState<Record<string, YouTubeVideo[]>>({})
  const [loading, setLoading] = useState(false)

  const categories = [
    { key: "trending", label: "🔥 Trending Songs", query: "top trending songs India" },
    { key: "genz", label: "🎧 New Gen-Z Songs", query: "genz pop music 2024" },
    { key: "rap", label: "🎤 Rap Hits", query: "indian rap songs 2024" },
    { key: "lofi", label: "💫 Chill & Lo-Fi", query: "lofi chill beats" },
    { key: "edm", label: "🚀 Electronic/EDM", query: "latest edm hits 2024" }
  ]

  const searchYouTube = async (query: string, key: string) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&q=${encodeURIComponent(
          query
        )}&part=snippet&type=video&maxResults=12`
      )
      const data = await res.json()
      if (data.items) {
        setVideos(prev => ({ ...prev, [key]: data.items }))
      }
    } catch (err) {
      console.error(`Error fetching ${key} videos:`, err)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLoading(true)
      await searchYouTube(searchQuery, "search")
      setLoading(false)
    }
  }

  const formatDuration = (publishedAt: string) => {
    const date = new Date(publishedAt)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 30) return `${days} days ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  useEffect(() => {
    categories.forEach((c) => searchYouTube(c.query, c.key))
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-28 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212] border-b border-[#222] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#1db954] tracking-wide">MusicTube</h1>
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trending Gen-Z bangers..."
                className="bg-[#1e1e1e] text-white pr-10 h-10 border-none rounded-full focus:ring-[#1db954] font-medium"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1.5 h-7 w-7 p-0 bg-[#1db954] hover:bg-[#17a74a] rounded-full font-medium"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </header>

      {/* Sections */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {loading && (
          <div className="flex justify-center items-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1db954] mr-3"></div>
            Loading music...
          </div>
        )}

        {searchQuery && videos.search && (
          <div>
            <h2 className="text-2xl font-extrabold mb-4 text-[#1db954] tracking-wide">🔍 Search Results</h2>
            <VideoSlider videos={videos.search} onSelect={setSelectedVideo} formatDuration={formatDuration} />
          </div>
        )}

        {categories.map(({ key, label }) => (
          videos[key]?.length > 0 && (
            <div key={key}>
              <h2 className="text-2xl font-extrabold mb-4 text-[#1db954] tracking-wide">{label}</h2>
              <VideoSlider videos={videos[key]} onSelect={setSelectedVideo} formatDuration={formatDuration} />
            </div>
          )
        ))}
      </main>

      {/* Audio Player */}
      {selectedVideo && (
        <ResponsiveAudioPlayer
          videoId={selectedVideo}
          title={
            Object.values(videos)
              .flat()
              .find((v) => v.id.videoId === selectedVideo)?.snippet.title || "Now Playing"
          }
        />
      )}
    </div>
  )
}

function VideoSlider({
  videos,
  onSelect,
  formatDuration
}: {
  videos: YouTubeVideo[],
  onSelect: (id: string) => void,
  formatDuration: (d: string) => string
}) {
  return (
    <div className="overflow-x-auto flex gap-4 scrollbar-hide">
      {videos.map((video, index) => {
        const videoId = video?.id?.videoId || `video-${index}`
        return (
          <div key={videoId} className="flex-shrink-0 w-[200px]">
            <Card
              className="bg-[#1e1e1e]/60 backdrop-blur-md border-none hover:scale-[1.03] transition-transform shadow-md cursor-pointer"
              onClick={() => onSelect(video.id.videoId)}
            >
              <CardContent className="p-0">
                <div className="relative rounded-t-xl overflow-hidden group">
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="object-cover rounded-lg w-full h-40"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-4 w-4 text-white" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 tracking-tight">{video.snippet.title}</h3>
                  <p className="text-xs text-[#999]">{video.snippet.channelTitle}</p>
                  <p className="text-xs text-[#777]">{formatDuration(video.snippet.publishedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
