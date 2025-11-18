'use client'

import { Mic, Music, Drum, Guitar, Piano, Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StemSelectorProps {
  selectedStems: string[]
  onStemsChange: (stems: string[]) => void
}

const stems = [
  { id: 'vocals', label: 'Vocals', icon: Mic, description: 'Lead vocals' },
  { id: 'instrumental', label: 'Instrumental', icon: Music, description: 'All instruments' },
  { id: 'drums', label: 'Drums', icon: Drum, description: 'Drum kit' },
  { id: 'bass', label: 'Bass', icon: Radio, description: 'Bass guitar' },
  { id: 'guitar', label: 'Guitar', icon: Guitar, description: 'Electric & acoustic' },
  { id: 'piano', label: 'Piano', icon: Piano, description: 'Keys & synths' },
]

export function StemSelector({ selectedStems, onStemsChange }: StemSelectorProps) {
  const toggleStem = (stemId: string) => {
    if (selectedStems.includes(stemId)) {
      onStemsChange(selectedStems.filter((s) => s !== stemId))
    } else {
      onStemsChange([...selectedStems, stemId])
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-4">
        Select stems to extract
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stems.map((stem) => {
          const Icon = stem.icon
          const isSelected = selectedStems.includes(stem.id)
          return (
            <button
              key={stem.id}
              onClick={() => toggleStem(stem.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50 hover:bg-accent/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm">{stem.label}</div>
                  <div className="text-xs text-muted-foreground">{stem.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
