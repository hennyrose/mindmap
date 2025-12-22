/**
 * Shared TypeScript types for the mindmap library feature
 */

import type { MindmapNode } from './mm-parser'

/**
 * Attachment for a single mindmap node (block)
 */
export interface BlockAttachment {
  nodeId: string       // Unique ID for the node (path-based, e.g., "0-1-2")
  pictures: string[]   // Array of Vercel Blob URLs
  notes: string[]      // Array of plain text notes
}

/**
 * A mindmap saved to the library
 */
export interface SavedMindmap {
  id: string           // UUID
  title: string        // User-provided name
  data: MindmapNode    // Parsed mindmap data
  createdAt: number    // Unix timestamp
  rootText: string     // Root node text for card preview
  childCount: number   // Number of children for card preview
  attachments?: Record<string, BlockAttachment>  // keyed by nodeId
}

/**
 * Payload for creating a new mindmap
 */
export interface CreateMindmapPayload {
  title: string
  data: MindmapNode
}

// Re-export MindmapNode for convenience
export type { MindmapNode }
