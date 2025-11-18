'use client'

import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadFile } from '@/lib/api-client'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  onUploadComplete?: (data: { jobId: string; url: string; filename: string }) => void
}

export function FileUpload({ onFileUpload, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      onFileUpload(file)
      
      const result = await uploadFile(file)
      onUploadComplete?.(result)
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
        handleUpload(file)
      }
    },
    []
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-accent/50 hover:bg-accent/5'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Upload className={`w-8 h-8 text-accent ${isUploading ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isUploading ? 'Uploading...' : 'Drop your audio file here'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isUploading ? 'Please wait' : 'or click to browse from your device'}
          </p>
          {!isUploading && (
            <label className="inline-block cursor-pointer">
              <span className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors">
                Select File
              </span>
              <input
                type="file"
                className="hidden"
                accept="audio/*,video/*"
                onChange={handleFileInput}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Supports MP3, WAV, FLAC, AAC, M4A, OGG, MP4, MKV, AVI, MOV
        </p>
      </div>
    </div>
  )
}
