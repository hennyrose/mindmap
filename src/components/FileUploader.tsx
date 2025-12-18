'use client'

import { useState, useRef, useCallback } from 'react'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
}

export function FileUploader({ onFileSelect, accept = '.mm' }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.name.endsWith('.mm')) {
          handleFile(file)
        }
      }
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center
        w-full h-48 rounded-xl border-2 border-dashed
        cursor-pointer transition-all duration-200
        ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Icon */}
      <svg
        className={`w-12 h-12 mb-4 transition-colors ${
          isDragOver ? 'text-blue-500' : 'text-zinc-500'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      {fileName ? (
        <div className="text-center">
          <p className="text-zinc-300 font-medium">{fileName}</p>
          <p className="text-zinc-500 text-sm mt-1">Click or drop to replace</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-zinc-300 font-medium">
            {isDragOver ? 'Drop your .mm file here' : 'Drag & drop your .mm file'}
          </p>
          <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
        </div>
      )}
    </div>
  )
}
