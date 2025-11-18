import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

// In-memory job storage (in production, use a database)
const jobs = new Map<string, {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  stems: string[]
  results?: { stem: string; url: string }[]
  error?: string
}>()

export async function POST(request: NextRequest) {
  try {
    const { jobId, fileUrl, stems } = await request.json()

    if (!jobId || !fileUrl || !stems) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Initialize job
    jobs.set(jobId, {
      status: 'processing',
      progress: 0,
      stems,
    })

    processAudioAsync(jobId, fileUrl, stems)

    return NextResponse.json({
      jobId,
      status: 'processing',
      message: 'Processing started',
    })
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

async function processAudioAsync(jobId: string, fileUrl: string, stems: string[]) {
  try {
    const job = jobs.get(jobId)
    if (!job) return

    job.progress = 10
    jobs.set(jobId, job)
    
    const audioResponse = await fetch(fileUrl)
    const audioBuffer = await audioResponse.arrayBuffer()
    
    // Create temporary directory for processing
    const tempDir = path.join(os.tmpdir(), jobId)
    await fs.mkdir(tempDir, { recursive: true })
    
    const inputPath = path.join(tempDir, 'input.mp3')
    const outputDir = path.join(tempDir, 'output')
    
    await fs.writeFile(inputPath, Buffer.from(audioBuffer))
    await fs.mkdir(outputDir, { recursive: true })
    
    job.progress = 20
    jobs.set(jobId, job)

    console.log('[v0] Starting audio separation with Demucs')
    
    const stemsJson = JSON.stringify(stems)
    const scriptPath = path.join(process.cwd(), 'scripts', 'separate_audio.py')
    
    try {
      const { stdout, stderr } = await execAsync(
        `python3 "${scriptPath}" "${inputPath}" "${outputDir}" '${stemsJson}'`
      )
      
      console.log('[v0] Python script output:', stdout)
      if (stderr) console.error('[v0] Python script errors:', stderr)
      
      job.progress = 80
      jobs.set(jobId, job)
      
      const resultMatch = stdout.match(/\{[\s\S]*"status"[\s\S]*\}/)
      if (!resultMatch) {
        throw new Error('Failed to parse separation result')
      }
      
      const result = JSON.parse(resultMatch[0])
      
      if (result.status === 'error') {
        throw new Error(result.error)
      }
      
      // Upload separated stems to Blob storage
      const results = await Promise.all(
        Object.entries(result.output_files).map(async ([stemName, filePath]) => {
          const fileData = await fs.readFile(filePath as string)
          const blob = await put(
            `processed/${jobId}/${stemName}.wav`,
            fileData,
            { access: 'public', contentType: 'audio/wav' }
          )
          
          return {
            stem: stemName,
            url: blob.url,
          }
        })
      )

      job.progress = 100
      jobs.set(jobId, {
        ...job,
        status: 'completed',
        results,
      })
      
      // Clean up temporary files
      await fs.rm(tempDir, { recursive: true, force: true })
      
      console.log('[v0] Audio separation completed successfully')
      
    } catch (execError: any) {
      console.error('[v0] Execution error:', execError)
      throw new Error(`Audio separation failed: ${execError.message}`)
    }
    
  } catch (error: any) {
    console.error('[v0] Processing error:', error)
    const job = jobs.get(jobId)
    if (job) {
      jobs.set(jobId, {
        ...job,
        status: 'failed',
        error: error.message || 'Processing failed',
      })
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    const job = jobs.get(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
