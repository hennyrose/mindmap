'use client'

import { useState, useCallback } from 'react'
import { FileUploader } from '@/components/FileUploader'
import { HelpButton } from '@/components/HelpButton'
import { LibraryButton } from '@/components/LibraryButton'
import { MindmapViewerModal } from '@/components/MindmapViewerModal'
import { DavidButton } from '@/components/DavidButton'
import { StandardRenderButton } from '@/components/StandardRenderButton'
import { MindMapCreationModal } from '@/components/MindMapCreationModal'
import { parseMMFileFromFile } from '@/lib/mm-parser'
import { generateMindmapHTML, downloadFile } from '@/lib/html-generator'
import type { MindmapNode } from '@/lib/types'

export default function Home() {
  const [parsedData, setParsedData] = useState<MindmapNode | null>(null)
  const [outputName, setOutputName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Viewer modal state
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerData, setViewerData] = useState<MindmapNode | null>(null)
  const [viewerTitle, setViewerTitle] = useState('')

  // David mode state
  const [isDavidMode, setIsDavidMode] = useState(false)
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    setIsProcessing(true)

    try {
      const data = await parseMMFileFromFile(file)
      setParsedData(data)
      // Set default output name from input filename (without .mm extension)
      const baseName = file.name.replace(/\.mm$/i, '')
      setOutputName(baseName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setParsedData(null)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (!parsedData || !outputName.trim()) return

    const filename = outputName.trim().endsWith('.html')
      ? outputName.trim()
      : `${outputName.trim()}.html`

    const html = generateMindmapHTML(parsedData, outputName.trim())
    downloadFile(html, filename)
  }, [parsedData, outputName])

  const handleView = useCallback(() => {
    if (!parsedData || !outputName.trim()) return
    setViewerData(parsedData)
    setViewerTitle(outputName.trim())
    setIsViewerOpen(true)
  }, [parsedData, outputName])

  const handleSaveToLibrary = useCallback(async (title: string) => {
    if (!viewerData) return

    const response = await fetch('/api/mindmaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        data: viewerData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save mindmap')
    }
  }, [viewerData])

  // Handler for saving mindmap from creation modal
  const handleSaveCreatedMindmap = useCallback(async (title: string, data: MindmapNode) => {
    const response = await fetch('/api/mindmaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        data,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save mindmap')
    }
  }, [])

  // Handler for opening mindmap from library
  const handleOpenFromLibrary = useCallback((data: MindmapNode, title: string) => {
    setViewerData(data)
    setViewerTitle(title)
    setIsViewerOpen(true)
  }, [])

  // Standard mode content (centered)
  const StandardContent = (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-zinc-100 mb-2">
          Mindmap Render
        </h1>
        <p className="text-zinc-400">
          Convert FreeMind (.mm) files to interactive HTML mindmaps
        </p>
      </div>

      {/* Upload Section */}
      <div className="space-y-6">
        <FileUploader onFileSelect={handleFileSelect} />

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-zinc-400">
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
            <span>Processing...</span>
          </div>
        )}

        {/* Output Name Input & Actions */}
        {parsedData && !isProcessing && (
          <div className="space-y-4">
            {/* Preview Info */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-zinc-200 font-medium">
                  File parsed successfully
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                Root: <span className="text-zinc-300">{parsedData.text}</span>
              </p>
              <p className="text-zinc-400 text-sm">
                Children:{' '}
                <span className="text-zinc-300">{parsedData.children.length}</span>
              </p>
            </div>

            {/* Output Name Input */}
            <div>
              <label
                htmlFor="output-name"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Output filename
              </label>
              <div className="flex gap-2">
                <input
                  id="output-name"
                  type="text"
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="my-mindmap"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700
                           text-zinc-100 placeholder:text-zinc-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
                />
                <span className="flex items-center px-3 text-zinc-500 bg-zinc-800 rounded-lg border border-zinc-700">
                  .html
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* View Mindmap Button */}
              <button
                onClick={handleView}
                disabled={!outputName.trim()}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-all
                         bg-zinc-700 hover:bg-zinc-600 text-zinc-100
                         disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Mindmap
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={!outputName.trim()}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-all
                         bg-blue-600 hover:bg-blue-500 text-white
                         disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Mindmap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-zinc-600 text-sm mt-8">
        Supports FreeMind / Freeplane .mm format
      </p>
    </div>
  )

  return (
    <>
      {/* David Mode Background */}
      {isDavidMode && (
        <div className="fixed inset-0 z-0 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 apple-intelligence-gradient-slow opacity-30" />
          {/* Dark glass overlay */}
          <div className="absolute inset-0 glass-material-dark" />
        </div>
      )}

      <main className={`min-h-screen flex flex-col p-6 relative z-10 ${
        isDavidMode 
          ? 'items-start justify-center' 
          : 'items-center justify-center'
      }`}>
        <HelpButton />
        <LibraryButton onOpenMindmap={handleOpenFromLibrary} />
        
        {/* Mode toggle button */}
        {isDavidMode ? (
          <StandardRenderButton onClick={() => setIsDavidMode(false)} />
        ) : (
          <DavidButton onClick={() => setIsDavidMode(true)} />
        )}

        {isDavidMode ? (
          /* David Mode Layout - Split view */
          <div className="w-full flex items-center justify-center gap-16 px-8">
            {/* Left side - Standard content */}
            <div className="flex-shrink-0">
              {StandardContent}
            </div>

            {/* Right side - Create MindMap button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsCreationModalOpen(true)}
                className="group relative px-8 py-6 rounded-2xl
                         glass-material
                         text-zinc-100 font-medium text-lg
                         transition-all duration-300 ease-out
                         hover:scale-105 active:scale-95
                         hover:border-white/30
                         shadow-xl shadow-black/20"
              >
                {/* Gradient glow underneath */}
                <div
                  className="absolute inset-0 -z-10 rounded-2xl 
                           apple-intelligence-gradient
                           blur-2xl opacity-40 
                           group-hover:opacity-60
                           transition-opacity duration-300"
                />
                
                <div className="flex items-center gap-3">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Create MindMap</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Mode Layout - Centered */
          StandardContent
        )}

        {/* Mindmap Viewer Modal */}
        {viewerData && (
          <MindmapViewerModal
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
            mindmapData={viewerData}
            title={viewerTitle}
            onSaveToLibrary={handleSaveToLibrary}
            showSaveButton={true}
          />
        )}

        {/* MindMap Creation Modal */}
        <MindMapCreationModal
          isOpen={isCreationModalOpen}
          onClose={() => setIsCreationModalOpen(false)}
          onSave={handleSaveCreatedMindmap}
        />
      </main>
    </>
  )
}
