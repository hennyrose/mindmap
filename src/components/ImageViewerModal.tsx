'use client'

import { useEffect, useState } from 'react'

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Reset zoom and rotation when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
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

  if (!isOpen) return null

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleRotateLeft = () => setRotation((prev) => prev - 90)
  const handleRotateRight = () => setRotation((prev) => prev + 90)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-7xl h-[90vh] flex flex-col bg-zinc-900/95 rounded-2xl shadow-2xl border border-zinc-800/50 overflow-hidden">
        {/* Header with Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-zinc-100">Documentation</h2>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700/50 hover:border-zinc-600/50
                       text-zinc-300 hover:text-zinc-100
                       transition-all duration-150
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-800/50"
              aria-label="Zoom out"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700/50 hover:border-zinc-600/50
                       text-zinc-300 hover:text-zinc-100
                       transition-all duration-150
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-800/50"
              aria-label="Zoom in"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </button>

            {/* Rotate Left */}
            <button
              onClick={handleRotateLeft}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700/50 hover:border-zinc-600/50
                       text-zinc-300 hover:text-zinc-100
                       transition-all duration-150"
              aria-label="Rotate left"
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
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>

            {/* Rotate Right */}
            <button
              onClick={handleRotateRight}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700/50 hover:border-zinc-600/50
                       text-zinc-300 hover:text-zinc-100
                       transition-all duration-150"
              aria-label="Rotate right"
            >
              <svg
                className="w-5 h-5 transform scale-x-[-1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700/50 hover:border-zinc-600/50
                       text-zinc-300 hover:text-zinc-100
                       transition-all duration-150"
              aria-label="Reset view"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-zinc-700/50 mx-1" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700/50 hover:border-zinc-600/50
                       text-zinc-300 hover:text-zinc-100
                       transition-all duration-150"
              aria-label="Close"
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
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto bg-zinc-950/50">
          <div className="min-h-full flex items-center justify-center p-8">
            <div
              className="transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                className="max-w-full h-auto rounded-lg shadow-2xl"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Footer with Zoom Info */}
        <div className="px-6 py-3 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Use scroll to zoom, ESC to close</span>
            <span>
              Zoom: {Math.round(zoom * 100)}% | Rotation: {rotation % 360}°
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
