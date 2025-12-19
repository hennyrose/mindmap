import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { SavedMindmap } from '@/lib/types'

const MINDMAPS_KEY = 'mindmaps'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/mindmaps/[id] - Get a single mindmap by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const mindmaps = (await kv.get<SavedMindmap[]>(MINDMAPS_KEY)) || []
    const mindmap = mindmaps.find((m) => m.id === id)

    if (!mindmap) {
      return NextResponse.json(
        { error: 'Mindmap not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(mindmap)
  } catch (error) {
    console.error('Failed to fetch mindmap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mindmap' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mindmaps/[id] - Delete a mindmap by ID
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const mindmaps = (await kv.get<SavedMindmap[]>(MINDMAPS_KEY)) || []
    const index = mindmaps.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Mindmap not found' },
        { status: 404 }
      )
    }

    // Remove the mindmap
    mindmaps.splice(index, 1)

    // Save back to KV
    await kv.set(MINDMAPS_KEY, mindmaps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete mindmap:', error)
    return NextResponse.json(
      { error: 'Failed to delete mindmap' },
      { status: 500 }
    )
  }
}
