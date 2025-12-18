'use client'

import { useState, useCallback } from 'react'
import { FileUploader } from '@/components/FileUploader'
import { parseMMFileFromFile, MindmapNode } from '@/lib/mm-parser'
import { generateMindmapHTML, downloadFile } from '@/lib/html-generator'

export default function Home() {
  const [parsedData, setParsedData] = useState<MindmapNode | null>(null)
  const [outputName, setOutputName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
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

          {/* Output Name Input & Download */}
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

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={!outputName.trim()}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all
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
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-sm mt-8">
          Supports FreeMind / Freeplane .mm format
        </p>
      </div>
    </main>
  )
}
