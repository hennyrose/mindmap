'use client'

import { useState } from 'react'
import { ImageViewerModal } from './ImageViewerModal'

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-6 z-40 w-12 h-12 rounded-full
                   bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur-md
                   border border-zinc-700/50 hover:border-zinc-600/50
                   text-zinc-300 hover:text-zinc-100
                   transition-all duration-200 ease-out
                   flex items-center justify-center
                   shadow-lg shadow-black/20
                   hover:scale-105 active:scale-95"
        aria-label="Help"
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
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Modal */}
      <ImageViewerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageSrc="/images/mm-documentation.001.png"
        imageAlt="MindMap Documentation"
      />
    </>
  )
}
