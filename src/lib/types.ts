/**
 * Shared TypeScript types for the mindmap library feature
 */

import type { MindmapNode } from './mm-parser'

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
