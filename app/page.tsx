'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Music, Mic, Drum, Guitar, Piano, Headphones, AudioWaveform as Waveform, Play, Download, Loader2 } from 'lucide-react'
import { FileUpload } from '@/components/file-upload'
import { StemSelector } from '@/components/stem-selector'
import { AudioPreview } from '@/components/audio-preview'
import { Features } from '@/components/features'
import { Pricing } from '@/components/pricing'
import { processAudio, checkJobStatus } from '@/lib/api-client'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [selectedStems, setSelectedStems] = useState<string[]>(['vocals', 'instrumental'])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedAudio, setProcessedAudio] = useState<boolean>(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ stem: string; url: string }[]>([])

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setProcessedAudio(false)
    setProgress(0)
    setResults([])
  }

  const handleUploadComplete = (data: { jobId: string; url: string; filename: string }) => {
    setJobId(data.jobId)
    setFileUrl(data.url)
  }

  const handleProcess = async () => {
    if (!jobId || !fileUrl) {
      alert('Please upload a file first')
      return
    }

    try {
      setIsProcessing(true)
      setProgress(0)

      // Start processing
      await processAudio(jobId, fileUrl, selectedStems)

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkJobStatus(jobId)
          setProgress(status.progress)

          if (status.status === 'completed') {
            clearInterval(pollInterval)
            setIsProcessing(false)
            setProcessedAudio(true)
            setResults(status.results || [])
          } else if (status.status === 'failed') {
            clearInterval(pollInterval)
            setIsProcessing(false)
            alert(status.error || 'Processing failed')
          }
        } catch (error) {
          console.error('Status check failed:', error)
          clearInterval(pollInterval)
          setIsProcessing(false)
        }
      }, 1000)

      // Cleanup on unmount
      return () => clearInterval(pollInterval)
    } catch (error) {
      setIsProcessing(false)
      console.error('Processing failed:', error)
      alert(error instanceof Error ? error.message : 'Processing failed')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Waveform className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LALAL.AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#apps" className="text-muted-foreground hover:text-foreground transition-colors">Apps</a>
            <a href="#api" className="text-muted-foreground hover:text-foreground transition-colors">API</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            AI-Powered Audio Processing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Extract stems from any audio file
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Split vocals, instrumentals, drums, bass, and more with industry-leading AI technology. Professional-grade results in seconds.
          </p>
        </div>

        {/* Main Upload/Processing Area */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 bg-card border-border">
            {!uploadedFile ? (
              <FileUpload onFileUpload={handleFileUpload} onUploadComplete={handleUploadComplete} />
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-border">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null)
                      setProcessedAudio(false)
                      setJobId(null)
                      setFileUrl(null)
                      setProgress(0)
                      setResults([])
                    }}
                  >
                    Change
                  </Button>
                </div>

                {/* Stem Selector */}
                <StemSelector
                  selectedStems={selectedStems}
                  onStemsChange={setSelectedStems}
                />

                {/* Process Button */}
                {!processedAudio ? (
                  <div className="space-y-4">
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing || selectedStems.length === 0}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-medium"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing Audio... {progress}%
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Process Audio
                        </>
                      )}
                    </Button>
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                          Processing your audio file...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <AudioPreview stems={selectedStems} results={results} />
                )}
              </div>
            )}
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">Trusted by musicians and audio professionals worldwide</p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              <div className="text-xs font-medium">10M+ Files Processed</div>
              <div className="w-px h-4 bg-border" />
              <div className="text-xs font-medium">Studio-Grade Quality</div>
              <div className="w-px h-4 bg-border" />
              <div className="text-xs font-medium">Fast Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Pricing */}
      <Pricing />

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Apps</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Desktop</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Mobile</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">VST Plugin</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 LALAL.AI Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
