import { Zap, Shield, Sparkles, Layers, Clock, FileCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Separation',
    description: 'Advanced neural networks trained on millions of tracks for studio-quality results',
  },
  {
    icon: Layers,
    title: 'Multi-Stem Extraction',
    description: 'Extract up to 10 different stems including vocals, drums, bass, guitar, and more',
  },
  {
    icon: Clock,
    title: 'Lightning Fast',
    description: 'Process your audio files in seconds with our optimized cloud infrastructure',
  },
  {
    icon: Shield,
    title: 'Lossless Quality',
    description: 'Preserve original audio fidelity with studio-grade processing algorithms',
  },
  {
    icon: FileCheck,
    title: 'Format Support',
    description: 'Works with all major audio and video formats including MP3, WAV, FLAC, and MP4',
  },
  {
    icon: Zap,
    title: 'Batch Processing',
    description: 'Process multiple files simultaneously to save time on large projects',
  },
]

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Professional audio separation
        </h2>
        <p className="text-lg text-muted-foreground">
          Industry-leading AI technology trusted by musicians, producers, and audio professionals worldwide
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card
              key={feature.title}
              className="p-6 bg-card border-border hover:border-accent/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
