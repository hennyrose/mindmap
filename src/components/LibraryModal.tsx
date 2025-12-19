'use client'

import { useEffect, useState, useCallback } from 'react'
import type { SavedMindmap } from '@/lib/types'

interface LibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMindmap: (mindmap: SavedMindmap) => void
}

export function LibraryModal({
  isOpen,
  onClose,
  onSelectMindmap,
}: LibraryModalProps) {
  const [mindmaps, setMindmaps] = useState<SavedMindmap[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch mindmaps when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMindmaps()
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

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

  const fetchMindmaps = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/mindmaps')
      if (!response.ok) {
        throw new Error('Failed to fetch mindmaps')
      }
      const data = await response.json()
      setMindmaps(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (deletingId) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/mindmaps/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete mindmap')
      }
      setMindmaps((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingId(null)
    }
  }, [deletingId])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-zinc-900/95 rounded-2xl shadow-2xl border border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-zinc-400"
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
            <h2 className="text-lg font-medium text-zinc-100">Library</h2>
            {mindmaps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                {mindmaps.length}
              </span>
            )}
          </div>

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center gap-3 text-zinc-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading library...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchMindmaps}
                className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-zinc-800 hover:bg-zinc-700 text-zinc-300
                         transition-all duration-150"
              >
                Try Again
              </button>
            </div>
          ) : mindmaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <svg
                className="w-16 h-16 text-zinc-700 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-zinc-400 text-lg mb-1">No mindmaps saved yet</p>
              <p className="text-zinc-600 text-sm">
                Upload a mindmap and click &quot;Create page&quot; to save it here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mindmaps.map((mindmap) => (
                <button
                  key={mindmap.id}
                  onClick={() => onSelectMindmap(mindmap)}
                  className="group relative text-left p-5 rounded-xl
                           bg-zinc-800/50 hover:bg-zinc-800/80
                           border border-zinc-700/50 hover:border-zinc-600/50
                           transition-all duration-200 ease-out
                           hover:shadow-lg hover:shadow-black/20
                           hover:-translate-y-0.5"
                >
                  {/* Delete button */}
                  <div
                    onClick={(e) => handleDelete(e, mindmap.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg
                             bg-zinc-700/0 hover:bg-red-500/20
                             text-zinc-500 hover:text-red-400
                             opacity-0 group-hover:opacity-100
                             transition-all duration-150
                             cursor-pointer"
                    title="Delete"
                  >
                    {deletingId === mindmap.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="pr-8">
                    <h3 className="text-zinc-100 font-medium mb-2 truncate">
                      {mindmap.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mb-3 truncate">
                      {mindmap.rootText}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {mindmap.childCount} branches
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(mindmap.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
