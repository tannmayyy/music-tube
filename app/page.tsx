"use client"

import type React from "react"
import { useState } from "react"
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
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const searchVideos = async (query: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=12`
      )
      const data = await res.json()
      if (data.items) {
        setVideos(data.items)
      } else {
        setVideos([])
      }
    } catch (err) {
      console.error("YouTube API error:", err)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchVideos(searchQuery)
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">MusicTube</h1>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube Music..."
                className="pr-10 h-12"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="hidden lg:block">
            <div className="w-32 h-12 bg-muted rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
              Ad Space
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Searching for music...</span>
          </div>
        )}

        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => {
              const videoId = video?.id?.videoId || `video-${index}`
              return (
                <div key={videoId}>
                  {index > 0 && index % 4 === 0 && (
                    <Card className="mb-6 bg-muted/50">
                      <CardContent className="p-6 text-center text-muted-foreground text-sm">
                        <div>Ad Placeholder — Promote your music here!</div>
                      </CardContent>
                    </Card>
                  )}

                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setSelectedVideo(video.id.videoId)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={video.snippet.thumbnails.medium.url}
                          alt={video.snippet.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {video.snippet.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{video.snippet.channelTitle}</p>
                        <p className="text-xs text-muted-foreground">{formatDuration(video.snippet.publishedAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Audio Player */}
      {selectedVideo && (
        <ResponsiveAudioPlayer
          videoId={selectedVideo}
          title={
            videos.find((v) => v.id.videoId === selectedVideo)?.snippet.title || "Now Playing"
          }
        />
      )}
    </div>
  )
}
