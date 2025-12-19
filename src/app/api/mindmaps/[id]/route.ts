import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { SavedMindMap } from '@/lib/types'

const MindMapS_KEY = 'MindMaps'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/MindMaps/[id] - Get a single MindMap by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const MindMaps = (await kv.get<SavedMindMap[]>(MindMapS_KEY)) || []
    const MindMap = MindMaps.find((m) => m.id === id)

    if (!MindMap) {
      return NextResponse.json(
        { error: 'MindMap not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(MindMap)
  } catch (error) {
    console.error('Failed to fetch MindMap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MindMap' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/MindMaps/[id] - Delete a MindMap by ID
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const MindMaps = (await kv.get<SavedMindMap[]>(MindMapS_KEY)) || []
    const index = MindMaps.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'MindMap not found' },
        { status: 404 }
      )
    }

    // Remove the MindMap
    MindMaps.splice(index, 1)

    // Save back to KV
    await kv.set(MindMapS_KEY, MindMaps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete MindMap:', error)
    return NextResponse.json(
      { error: 'Failed to delete MindMap' },
      { status: 500 }
    )
  }
}
