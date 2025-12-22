'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { BlockAttachment } from '@/lib/types'

interface BlockAttachmentEditorProps {
  isOpen: boolean
  nodeText: string
  nodeId: string
  initialAttachment?: BlockAttachment
  onSave: (attachment: BlockAttachment) => Promise<void>
  onCancel: () => void
}

export function BlockAttachmentEditor({
  isOpen,
  nodeText,
  nodeId,
  initialAttachment,
  onSave,
  onCancel,
}: BlockAttachmentEditorProps) {
  const [pictures, setPictures] = useState<string[]>(initialAttachment?.pictures || [])
  const [notes, setNotes] = useState<string[]>(initialAttachment?.notes || [])
  const [newNote, setNewNote] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Reset state when modal opens with new attachment
  useEffect(() => {
    if (isOpen) {
      setPictures(initialAttachment?.pictures || [])
      setNotes(initialAttachment?.notes || [])
      setNewNote('')
      setUploadError(null)
    }
  }, [isOpen, initialAttachment])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onCancel])

  // Prevent body scroll
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

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    const newPictures: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed')
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        newPictures.push(result.url)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
      }
    }

    if (newPictures.length > 0) {
      setPictures((prev) => [...prev, ...newPictures])
    }

    setIsUploading(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removePicture = useCallback((index: number) => {
    setPictures((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      setNotes((prev) => [...prev, newNote.trim()])
      setNewNote('')
    }
  }, [newNote])

  const removeNote = useCallback((index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave({
        nodeId,
        pictures,
        notes,
      })
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [nodeId, pictures, notes, onSave])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] m-4 flex flex-col bg-zinc-900/95 rounded-2xl shadow-2xl border border-zinc-800/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-medium text-zinc-100 truncate">
              {nodeText || 'Untitled Block'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Edit attachments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium
                       bg-zinc-800 hover:bg-zinc-700 text-zinc-300
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-blue-500/80 hover:bg-blue-500 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-150"
            >
              {isSaving ? (
                <>
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
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Pictures Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add Pictures
            </h3>

            {/* Upload Error */}
            {uploadError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{uploadError}</p>
              </div>
            )}

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                        ${isDragging 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/30'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
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
                  <p className="text-sm text-zinc-400">Uploading...</p>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 mx-auto text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-zinc-400 mb-2">
                    Drag and drop images here, or
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg text-sm font-medium
                             bg-zinc-700 hover:bg-zinc-600 text-zinc-200
                             transition-all duration-150"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-zinc-600 mt-2">
                    Max 5MB per image
                  </p>
                </>
              )}
            </div>

            {/* Picture Grid */}
            {pictures.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {pictures.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-zinc-700"
                    />
                    <button
                      onClick={() => removePicture(index)}
                      className="absolute top-1 right-1 p-1.5 rounded-full
                               bg-red-500/80 hover:bg-red-500 text-white
                               opacity-0 group-hover:opacity-100
                               transition-all duration-150"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Notes Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Add Notes
            </h3>

            {/* New Note Input */}
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a note..."
                className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700
                         text-zinc-100 text-sm placeholder:text-zinc-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50
                         resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    addNote()
                  }
                }}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium self-end
                         bg-emerald-500/20 hover:bg-emerald-500/30 
                         border border-emerald-500/30
                         text-emerald-400
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              Press ⌘+Enter to add
            </p>

            {/* Notes List */}
            {notes.length > 0 && (
              <div className="mt-4 space-y-2">
                {notes.map((note, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30"
                  >
                    <p className="flex-1 text-sm text-zinc-300 whitespace-pre-wrap break-words">
                      {note}
                    </p>
                    <button
                      onClick={() => removeNote(index)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400
                               hover:bg-red-500/10 opacity-0 group-hover:opacity-100
                               transition-all duration-150 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
