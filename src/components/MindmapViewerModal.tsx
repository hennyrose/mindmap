'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type { MindmapNode, BlockAttachment } from '@/lib/types'
import { generateMindmapHTML, generateMindmapHTMLWithNodeClick, generateMindmapHTMLWithNotes, downloadFile } from '@/lib/html-generator'
import { ensureNodeIds } from '@/lib/mm-parser'
import { BlockAttachmentPopup } from './BlockAttachmentPopup'
import { BlockAttachmentEditor } from './BlockAttachmentEditor'
import { ImageViewerModal } from './ImageViewerModal'

interface MindmapViewerModalProps {
  isOpen: boolean
  onClose: () => void
  mindmapData: MindmapNode
  title: string
  onSaveToLibrary?: (title: string) => Promise<void>
  showSaveButton?: boolean
  isDavidMode?: boolean
  mindmapId?: string  // If viewing from library
  attachments?: Record<string, BlockAttachment>  // Initial attachments
}

interface SelectedNode {
  nodeId: string
  text: string
  position: { x: number; y: number }
}

export function MindmapViewerModal({
  isOpen,
  onClose,
  mindmapData,
  title,
  onSaveToLibrary,
  showSaveButton = true,
  isDavidMode = false,
  mindmapId,
  attachments: initialAttachments,
}: MindmapViewerModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveTitle, setSaveTitle] = useState(title)
  const [showTitleInput, setShowTitleInput] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // David mode specific state
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [attachments, setAttachments] = useState<Record<string, BlockAttachment>>(initialAttachments || {})
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  // Ensure mindmap data has node IDs
  const processedData = ensureNodeIds(mindmapData)

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setSaveSuccess(false)
      setSaveTitle(title)
      setShowTitleInput(false)
      setSelectedNode(null)
      setShowEditor(false)
      setAttachments(initialAttachments || {})
    }
  }, [isOpen, title, initialAttachments])

  // Fetch attachments if viewing from library
  useEffect(() => {
    if (isOpen && mindmapId && isDavidMode) {
      fetchAttachments()
    }
  }, [isOpen, mindmapId, isDavidMode])

  const fetchAttachments = async () => {
    if (!mindmapId) return
    try {
      const response = await fetch(`/api/mindmaps/${mindmapId}/attachments`)
      if (response.ok) {
        const data = await response.json()
        setAttachments(data)
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error)
    }
  }

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
        if (showEditor) {
          setShowEditor(false)
        } else if (selectedNode) {
          setSelectedNode(null)
        } else if (showTitleInput) {
          setShowTitleInput(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, showTitleInput, selectedNode, showEditor])

  // Handle messages from iframe (node clicks)
  useEffect(() => {
    if (!isDavidMode || !isOpen) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'nodeClick') {
        const { nodeId, text, screenX, screenY } = event.data
        
        // Calculate position relative to the container
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (containerRect) {
          setSelectedNode({
            nodeId,
            text,
            position: {
              x: screenX,
              y: screenY + 20, // Offset below the node
            },
          })
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isDavidMode, isOpen])

  // Close popup when clicking outside
  useEffect(() => {
    if (!selectedNode) return

    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking within popup
      const target = e.target as HTMLElement
      if (target.closest('[data-attachment-popup]')) return
      setSelectedNode(null)
    }

    // Add slight delay to prevent immediate close
    const timeout = setTimeout(() => {
      window.addEventListener('click', handleClick)
    }, 100)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('click', handleClick)
    }
  }, [selectedNode])

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

  const handleEditAttachment = () => {
    setShowEditor(true)
  }

  const handleSaveAttachment = useCallback(async (attachment: BlockAttachment) => {
    if (!mindmapId) {
      // Just update local state if not saved to library
      setAttachments((prev) => ({
        ...prev,
        [attachment.nodeId]: attachment,
      }))
      setShowEditor(false)
      setSelectedNode(null)
      return
    }

    // Save to server
    try {
      const response = await fetch(`/api/mindmaps/${mindmapId}/attachments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: attachment.nodeId, attachment }),
      })

      if (response.ok) {
        const result = await response.json()
        setAttachments(result.attachments || {})
        setShowEditor(false)
        setSelectedNode(null)
      }
    } catch (error) {
      console.error('Failed to save attachment:', error)
    }
  }, [mindmapId])

  const handleDownloadHTML = useCallback(() => {
    const html = generateMindmapHTMLWithNotes(processedData, title, attachments)
    const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`
    downloadFile(html, filename)
  }, [processedData, title, attachments])

  if (!isOpen) return null

  // Generate the HTML content for the iframe
  // Use version with node click support in David mode
  const htmlContent = isDavidMode 
    ? generateMindmapHTMLWithNodeClick(processedData, title)
    : generateMindmapHTML(processedData, title)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" ref={containerRef}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => {
          if (selectedNode) {
            setSelectedNode(null)
          } else {
            onClose()
          }
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] m-4 flex flex-col bg-zinc-900/95 rounded-2xl shadow-2xl border border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          {/* Left side - Create Page Button / Download HTML */}
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

            {/* Download HTML button (for library view in David mode) */}
            {isDavidMode && mindmapId && (
              <button
                onClick={handleDownloadHTML}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-emerald-500/20 hover:bg-emerald-500/30
                         border border-emerald-500/30 hover:border-emerald-500/50
                         text-emerald-400 text-sm font-medium
                         transition-all duration-200 ease-out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download HTML
              </button>
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
        <div className="flex-1 overflow-hidden bg-zinc-950 relative">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts"
          />

          {/* Block Attachment Popup (David mode only) */}
          {isDavidMode && selectedNode && !showEditor && (
            <div data-attachment-popup>
              <BlockAttachmentPopup
                nodeText={selectedNode.text}
                nodeId={selectedNode.nodeId}
                attachment={attachments[selectedNode.nodeId]}
                position={selectedNode.position}
                onEdit={handleEditAttachment}
                onClose={() => setSelectedNode(null)}
                onImageClick={(url) => setViewingImage(url)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              Scroll to zoom • Drag to pan • Click nodes to expand
              {isDavidMode && ' • Click to attach'}
            </span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>

      {/* Block Attachment Editor Modal */}
      {isDavidMode && showEditor && selectedNode && (
        <BlockAttachmentEditor
          isOpen={showEditor}
          nodeText={selectedNode.text}
          nodeId={selectedNode.nodeId}
          initialAttachment={attachments[selectedNode.nodeId]}
          onSave={handleSaveAttachment}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewerModal
          isOpen={!!viewingImage}
          imageSrc={viewingImage}
          imageAlt="Attachment"
          onClose={() => setViewingImage(null)}
        />
      )}
    </div>
  )
}
