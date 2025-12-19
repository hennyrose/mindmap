import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { SavedMindmap, CreateMindmapPayload } from '@/lib/types'

const MINDMAPS_KEY = 'mindmaps'

/**
 * GET /api/mindmaps - List all saved mindmaps
 */
export async function GET() {
  try {
    const mindmaps = await kv.get<SavedMindmap[]>(MINDMAPS_KEY)
    return NextResponse.json(mindmaps || [])
  } catch (error) {
    console.error('Failed to fetch mindmaps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mindmaps' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mindmaps - Create a new mindmap
 */
export async function POST(request: Request) {
  try {
    const body: CreateMindmapPayload = await request.json()

    if (!body.title || !body.data) {
      return NextResponse.json(
        { error: 'Title and data are required' },
        { status: 400 }
      )
    }

    const newMindmap: SavedMindmap = {
      id: crypto.randomUUID(),
      title: body.title,
      data: body.data,
      createdAt: Date.now(),
      rootText: body.data.text,
      childCount: body.data.children?.length || 0,
    }

    // Get existing mindmaps
    const mindmaps = (await kv.get<SavedMindmap[]>(MINDMAPS_KEY)) || []

    // Add new mindmap at the beginning
    mindmaps.unshift(newMindmap)

    // Save back to KV
    await kv.set(MINDMAPS_KEY, mindmaps)

    return NextResponse.json(newMindmap, { status: 201 })
  } catch (error) {
    console.error('Failed to create mindmap:', error)
    return NextResponse.json(
      { error: 'Failed to create mindmap' },
      { status: 500 }
    )
  }
}
