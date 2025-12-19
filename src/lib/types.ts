/**
 * Shared TypeScript types for the MindMap library feature
 */

import type { MindMapNode } from './mm-parser'

/**
 * A MindMap saved to the library
 */
export interface SavedMindMap {
  id: string           // UUID
  title: string        // User-provided name
  data: MindMapNode    // Parsed MindMap data
  createdAt: number    // Unix timestamp
  rootText: string     // Root node text for card preview
  childCount: number   // Number of children for card preview
}

/**
 * Payload for creating a new MindMap
 */
export interface CreateMindMapPayload {
  title: string
  data: MindMapNode
}

// Re-export MindMapNode for convenience
export type { MindMapNode }
