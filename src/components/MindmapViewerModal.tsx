'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type { MindmapNode } from '@/lib/types'
import { generateMindmapHTML } from '@/lib/html-generator'

interface MindmapViewerModalProps {
  isOpen: boolean
  onClose: () => void
  mindmapData: MindmapNode
  title: string
  onSaveToLibrary?: (title: string) => Promise<void>
  showSaveButton?: boolean
}

export function MindmapViewerModal({
  isOpen,
  onClose,
  mindmapData,
  title,
  onSaveToLibrary,
  showSaveButton = true,
}: MindmapViewerModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveTitle, setSaveTitle] = useState(title)
  const [showTitleInput, setShowTitleInput] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setSaveSuccess(false)
      setSaveTitle(title)
      setShowTitleInput(false)
    }
  }, [isOpen, title])

  // Focus title input when shown
  useEffect(() => {
    if (showTitleInput && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [showTitleInput])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showTitleInput) {
          setShowTitleInput(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, showTitleInput])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSave = useCallback(async () => {
    if (!onSaveToLibrary || !saveTitle.trim()) return

    setIsSaving(true)
    try {
      await onSaveToLibrary(saveTitle.trim())
      setSaveSuccess(true)
      setShowTitleInput(false)
      // Auto-hide success after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [onSaveToLibrary, saveTitle])

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setShowTitleInput(false)
    }
  }

  if (!isOpen) return null

  // Generate the HTML content for the iframe
  const htmlContent = generateMindmapHTML(mindmapData, title)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] m-4 flex flex-col bg-zinc-900/95 rounded-2xl shadow-2xl border border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          {/* Left side - Create Page Button */}
          <div className="flex items-center gap-3">
            {showSaveButton && onSaveToLibrary && (
              <>
                {showTitleInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      placeholder="Enter title..."
                      className="px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-600/50
                               text-zinc-100 text-sm placeholder:text-zinc-500
                               focus:outline-none focus:ring-2 focus:ring-blue-500/50
                               w-48"
                    />
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !saveTitle.trim()}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium
                               bg-blue-500/80 hover:bg-blue-500 text-white
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-150"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setShowTitleInput(false)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200
                               hover:bg-zinc-700/50 transition-all duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : saveSuccess ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                                bg-emerald-500/20 border border-emerald-500/30
                                text-emerald-400 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved to Library
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTitleInput(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                             bg-white/10 hover:bg-white/15 backdrop-blur-xl
                             border border-white/20 hover:border-white/30
                             text-zinc-100 text-sm font-medium
                             transition-all duration-200 ease-out
                             shadow-lg shadow-black/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create page
                  </button>
                )}
              </>
            )}
          </div>

          {/* Center - Title */}
          <h2 className="text-lg font-medium text-zinc-100 absolute left-1/2 -translate-x-1/2">
            {title}
          </h2>

          {/* Right side - Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                     border border-zinc-700/50 hover:border-zinc-600/50
                     text-zinc-300 hover:text-zinc-100
                     transition-all duration-150"
            aria-label="Close"
            title="Close (ESC)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mindmap Container - iframe with generated HTML */}
        <div className="flex-1 overflow-hidden bg-zinc-950">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Scroll to zoom • Drag to pan • Click nodes to expand</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
