'use client'

import { useState } from 'react'
import { LibraryModal } from './LibraryModal'
import type { SavedMindmap, MindmapNode } from '@/lib/types'

interface LibraryButtonProps {
  onOpenMindmap?: (data: MindmapNode, title: string) => void
}

export function LibraryButton({ onOpenMindmap }: LibraryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectMindmap = (mindmap: SavedMindmap) => {
    if (onOpenMindmap) {
      onOpenMindmap(mindmap.data, mindmap.title)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Library Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 top-6 z-40 w-12 h-12 rounded-full
                   bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur-md
                   border border-zinc-700/50 hover:border-zinc-600/50
                   text-zinc-300 hover:text-zinc-100
                   transition-all duration-200 ease-out
                   flex items-center justify-center
                   shadow-lg shadow-black/20
                   hover:scale-105 active:scale-95"
        aria-label="Library"
        title="Open Library"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>

      {/* Modal */}
      <LibraryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectMindmap={handleSelectMindmap}
      />
    </>
  )
}
