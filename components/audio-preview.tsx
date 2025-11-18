'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Download, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AudioPreviewProps {
  stems: string[]
  results?: { stem: string; url: string }[]
}

export function AudioPreview({ stems, results = [] }: AudioPreviewProps) {
  const [playingStems, setPlayingStems] = useState<Set<string>>(new Set())
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  const togglePlay = (stem: string) => {
    const audio = audioRefs.current.get(stem)
    if (!audio) return

    if (playingStems.has(stem)) {
      audio.pause()
      setPlayingStems(prev => {
        const next = new Set(prev)
        next.delete(stem)
        return next
      })
    } else {
      audio.play()
      setPlayingStems(prev => new Set(prev).add(stem))
    }
  }

  const handleAudioEnded = (stem: string) => {
    setPlayingStems(prev => {
      const next = new Set(prev)
      next.delete(stem)
      return next
    })
  }

  const downloadStem = (url: string, stem: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${stem}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAll = () => {
    results.forEach(result => {
      downloadStem(result.url, result.stem)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Processed stems</h3>
        <Button variant="outline" size="sm" onClick={downloadAll} disabled={results.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <div className="space-y-3">
        {stems.map((stem) => {
          const result = results.find(r => r.stem === stem)
          const isPlaying = playingStems.has(stem)

          return (
            <Card key={stem} className="p-4 bg-accent/5 border-border">
              <div className="flex items-center gap-4">
                <button 
                  className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50"
                  onClick={() => togglePlay(stem)}
                  disabled={!result}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground capitalize">{stem}</span>
                    {!result && (
                      <span className="text-xs text-muted-foreground">(processing...)</span>
                    )}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-accent transition-all ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`} />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => result && downloadStem(result.url, stem)}
                  disabled={!result}
                >
                  <Download className="w-4 h-4" />
                </Button>

                {result && (
                  <audio
                    ref={el => {
                      if (el) audioRefs.current.set(stem, el)
                    }}
                    src={result.url}
                    onEnded={() => handleAudioEnded(stem)}
                  />
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground text-center">
          {results.length === stems.length 
            ? 'Processing complete! Preview and download your stems above.'
            : 'Processing your stems... This may take a moment.'
          }
        </p>
      </div>
    </div>
  )
}
