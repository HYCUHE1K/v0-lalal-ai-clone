export interface UploadResponse {
  jobId: string
  url: string
  filename: string
  size: number
  type: string
}

export interface ProcessResponse {
  jobId: string
  status: string
  message: string
}

export interface JobStatus {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  stems: string[]
  results?: { stem: string; url: string }[]
  error?: string
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return response.json()
}

export async function processAudio(
  jobId: string,
  fileUrl: string,
  stems: string[]
): Promise<ProcessResponse> {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId, fileUrl, stems }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Processing failed')
  }

  return response.json()
}

export async function checkJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`/api/process?jobId=${jobId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to check status')
  }

  return response.json()
}

export async function deleteFile(url: string): Promise<void> {
  const response = await fetch('/api/files', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Delete failed')
  }
}

export async function listFiles() {
  const response = await fetch('/api/files')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to list files')
  }

  return response.json()
}
