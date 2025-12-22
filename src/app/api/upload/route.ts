import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

/**
 * POST /api/upload - Upload an image to Vercel Blob
 * Accepts multipart form data with a 'file' field
 * Returns the blob URL for storage in attachments
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'png'
    const filename = `mindmap-attachments/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
    })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
