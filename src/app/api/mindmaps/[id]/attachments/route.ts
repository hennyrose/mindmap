import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { SavedMindmap, BlockAttachment } from '@/lib/types'

const MINDMAPS_KEY = 'mindmaps'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/mindmaps/[id]/attachments - Get all attachments for a mindmap
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

    return NextResponse.json(mindmap.attachments || {})
  } catch (error) {
    console.error('Failed to fetch attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/mindmaps/[id]/attachments - Update attachments for a specific node
 * Body: { nodeId: string, attachment: BlockAttachment }
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nodeId, attachment } = body as { nodeId: string; attachment: BlockAttachment }

    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId is required' },
        { status: 400 }
      )
    }

    const mindmaps = (await kv.get<SavedMindmap[]>(MINDMAPS_KEY)) || []
    const index = mindmaps.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Mindmap not found' },
        { status: 404 }
      )
    }

    // Initialize attachments if not present
    if (!mindmaps[index].attachments) {
      mindmaps[index].attachments = {}
    }

    // Update or remove the attachment
    if (attachment && (attachment.pictures.length > 0 || attachment.notes.length > 0)) {
      mindmaps[index].attachments![nodeId] = attachment
    } else {
      // Remove attachment if empty
      delete mindmaps[index].attachments![nodeId]
    }

    // Save back to KV
    await kv.set(MINDMAPS_KEY, mindmaps)

    return NextResponse.json({ success: true, attachments: mindmaps[index].attachments })
  } catch (error) {
    console.error('Failed to update attachments:', error)
    return NextResponse.json(
      { error: 'Failed to update attachments' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mindmaps/[id]/attachments - Remove attachment from a specific node
 * Query param: nodeId
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const nodeId = url.searchParams.get('nodeId')

    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId query parameter is required' },
        { status: 400 }
      )
    }

    const mindmaps = (await kv.get<SavedMindmap[]>(MINDMAPS_KEY)) || []
    const index = mindmaps.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Mindmap not found' },
        { status: 404 }
      )
    }

    if (mindmaps[index].attachments && mindmaps[index].attachments[nodeId]) {
      delete mindmaps[index].attachments[nodeId]
      await kv.set(MINDMAPS_KEY, mindmaps)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete attachment:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}
