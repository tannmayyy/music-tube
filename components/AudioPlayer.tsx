
"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, SkipForward, SkipBack } from "lucide-react"

interface AudioPlayerProps {
  videoId: string
  title: string
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

export default function AudioPlayer({ videoId, title }: AudioPlayerProps) {
  const playerRef = useRef<any>(null)
  const [playing, setPlaying] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve()
        } else {
          const tag = document.createElement("script")
          tag.src = "https://www.youtube.com/iframe_api"
          document.body.appendChild(tag)
          window.onYouTubeIframeAPIReady = () => resolve()
        }
      })
    }

    const initPlayer = async () => {
      await loadYouTubeAPI()

      playerRef.current = new window.YT.Player("yt-audio-player", {
        height: "0",
        width: "0",
        videoId,
        playerVars: {
          autoplay: 1,
        },
        events: {
          onReady: () => {
            setPlayerReady(true)
            setPlaying(true)
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setPlaying(false)
            }
          }
        }
      })
    }

    initPlayer()

    return () => {
      playerRef.current?.destroy()
      setPlayerReady(false)
    }
  }, [videoId])

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
    setPlaying(!playing)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 flex items-center justify-between">
      {/* Hidden YouTube Player */}
      <div id="yt-audio-player" style={{ display: "none" }} />

      {/* Player UI */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">{title}</div>
        <button onClick={togglePlay} className="bg-primary text-white p-2 rounded-full">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Placeholder for future queue buttons */}
      <div className="flex gap-2 text-muted-foreground">
        <SkipBack className="w-4 h-4 cursor-pointer" />
        <SkipForward className="w-4 h-4 cursor-pointer" />
      </div>
    </div>
  )
}
