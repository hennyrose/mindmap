'use client'

import { useState } from 'react'
import type { BlockAttachment } from '@/lib/types'

interface BlockAttachmentPopupProps {
  nodeText: string
  nodeId: string
  attachment?: BlockAttachment
  position: { x: number; y: number }
  onEdit: () => void
  onClose: () => void
  onImageClick?: (url: string) => void
}

export function BlockAttachmentPopup({
  nodeText,
  nodeId,
  attachment,
  position,
  onEdit,
  onClose,
  onImageClick,
}: BlockAttachmentPopupProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set())

  const hasPictures = attachment?.pictures && attachment.pictures.length > 0
  const hasNotes = attachment?.notes && attachment.notes.length > 0
  const hasAttachments = hasPictures || hasNotes

  const toggleNote = (index: number) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div
      className="fixed z-[60] bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        minWidth: 280,
        maxWidth: 400,
        transform: 'translateX(-50%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-800/30">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-zinc-100 truncate flex-1">
            {nodeText || 'Untitled'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[300px] overflow-y-auto">
        {!hasAttachments ? (
          <p className="text-zinc-500 text-sm text-center py-4">
            No attachments yet
          </p>
        ) : (
          <div className="space-y-4">
            {/* Pictures */}
            {hasPictures && (
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Pictures ({attachment!.pictures.length})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {attachment!.pictures.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => onImageClick?.(url)}
                      className="aspect-square rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-500 transition-colors bg-zinc-800"
                    >
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {hasNotes && (
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Notes ({attachment!.notes.length})
                </h4>
                <div className="space-y-2">
                  {attachment!.notes.map((note, index) => {
                    const isExpanded = expandedNotes.has(index)
                    const isLong = note.length > 80
                    return (
                      <div
                        key={index}
                        className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30"
                      >
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                          {isExpanded || !isLong ? note : truncateText(note)}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleNote(index)}
                            className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with Edit button */}
      <div className="px-4 py-3 border-t border-zinc-800/50 bg-zinc-800/20">
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                   bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30
                   text-blue-400 text-sm font-medium
                   transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Attachments
        </button>
      </div>
    </div>
  )
}
