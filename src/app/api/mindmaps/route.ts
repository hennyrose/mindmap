import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { SavedMindMap, CreateMindMapPayload } from '@/lib/types'

const MindMapS_KEY = 'MindMaps'

/**
 * GET /api/MindMaps - List all saved MindMaps
 */
export async function GET() {
  try {
    const MindMaps = await kv.get<SavedMindMap[]>(MindMapS_KEY)
    return NextResponse.json(MindMaps || [])
  } catch (error) {
    console.error('Failed to fetch MindMaps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MindMaps' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/MindMaps - Create a new MindMap
 */
export async function POST(request: Request) {
  try {
    const body: CreateMindMapPayload = await request.json()

    if (!body.title || !body.data) {
      return NextResponse.json(
        { error: 'Title and data are required' },
        { status: 400 }
      )
    }

    const newMindMap: SavedMindMap = {
      id: crypto.randomUUID(),
      title: body.title,
      data: body.data,
      createdAt: Date.now(),
      rootText: body.data.text,
      childCount: body.data.children?.length || 0,
    }

    // Get existing MindMaps
    const MindMaps = (await kv.get<SavedMindMap[]>(MindMapS_KEY)) || []

    // Add new MindMap at the beginning
    MindMaps.unshift(newMindMap)

    // Save back to KV
    await kv.set(MindMapS_KEY, MindMaps)

    return NextResponse.json(newMindMap, { status: 201 })
  } catch (error) {
    console.error('Failed to create MindMap:', error)
    return NextResponse.json(
      { error: 'Failed to create MindMap' },
      { status: 500 }
    )
  }
}
