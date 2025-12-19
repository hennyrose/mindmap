'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface EditorNode {
  id: string
  text: string
  children: EditorNode[]
  isExpanded: boolean
}

interface MindMapCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (title: string, data: EditorNode) => Promise<void>
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function createEmptyNode(text: string = ''): EditorNode {
  return {
    id: generateId(),
    text,
    children: [],
    isExpanded: true,
  }
}

// Convert EditorNode to MindMapNode format for saving
function convertToMindMapNode(node: EditorNode): { text: string; children: { text: string; children: unknown[]; _expanded?: boolean }[]; _expanded?: boolean } {
  return {
    text: node.text,
    children: node.children.map(convertToMindMapNode),
    _expanded: node.isExpanded,
  }
}

interface TreeNodeProps {
  node: EditorNode
  depth: number
  onUpdateText: (id: string, text: string) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onToggleExpand: (id: string) => void
  isRoot?: boolean
}

function TreeNode({
  node,
  depth,
  onUpdateText,
  onAddChild,
  onDelete,
  onToggleExpand,
  isRoot = false,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(node.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (editText !== node.text) {
      onUpdateText(node.id, editText)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditText(node.text)
      setIsEditing(false)
    }
  }

  const hasChildren = node.children.length > 0

  return (
    <div className="select-none">
      <div
        className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg
                   hover:bg-white/5 transition-colors duration-150
                   ${depth === 0 ? 'mb-2' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand/Collapse toggle */}
        <button
          onClick={() => onToggleExpand(node.id)}
          className={`w-5 h-5 flex items-center justify-center rounded
                     text-zinc-500 hover:text-zinc-300 hover:bg-white/10
                     transition-all duration-150
                     ${!hasChildren ? 'invisible' : ''}`}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${
              node.isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Node indicator */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0
                     ${isRoot ? 'bg-blue-500' : 'bg-zinc-600'}`}
        />

        {/* Text input/display */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 rounded bg-zinc-800 border border-zinc-600
                     text-zinc-100 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     focus:border-transparent"
            placeholder={isRoot ? 'Root node...' : 'Node text...'}
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`flex-1 px-2 py-1 rounded cursor-text
                       text-sm transition-colors duration-150
                       ${node.text ? 'text-zinc-100' : 'text-zinc-500 italic'}
                       hover:bg-white/5`}
          >
            {node.text || (isRoot ? 'Click to add root text...' : 'Click to add text...')}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {/* Add child button */}
          <button
            onClick={() => onAddChild(node.id)}
            className="p-1 rounded text-zinc-500 hover:text-emerald-400
                     hover:bg-emerald-500/10 transition-all duration-150"
            title="Add child node"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Delete button (not for root) */}
          {!isRoot && (
            <button
              onClick={() => onDelete(node.id)}
              className="p-1 rounded text-zinc-500 hover:text-red-400
                       hover:bg-red-500/10 transition-all duration-150"
              title="Delete node"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {node.isExpanded && hasChildren && (
        <div className="border-l border-zinc-800 ml-6">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdateText={onUpdateText}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MindMapCreationModal({
  isOpen,
  onClose,
  onSave,
}: MindMapCreationModalProps) {
  const [rootNode, setRootNode] = useState<EditorNode>(() => createEmptyNode('New MindMap'))
  const [title, setTitle] = useState('New MindMap')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRootNode(createEmptyNode('New MindMap'))
      setTitle('New MindMap')
      setSaveSuccess(false)
      setHasChanges(false)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, hasChanges])

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

  const updateNodeInTree = useCallback(
    (nodes: EditorNode, nodeId: string, updater: (node: EditorNode) => EditorNode): EditorNode => {
      if (nodes.id === nodeId) {
        return updater(nodes)
      }
      return {
        ...nodes,
        children: nodes.children.map((child) => updateNodeInTree(child, nodeId, updater)),
      }
    },
    []
  )

  const deleteNodeFromTree = useCallback(
    (nodes: EditorNode, nodeId: string): EditorNode => {
      return {
        ...nodes,
        children: nodes.children
          .filter((child) => child.id !== nodeId)
          .map((child) => deleteNodeFromTree(child, nodeId)),
      }
    },
    []
  )

  const handleUpdateText = useCallback(
    (id: string, text: string) => {
      setRootNode((prev) => updateNodeInTree(prev, id, (node) => ({ ...node, text })))
      setHasChanges(true)
      if (id === rootNode.id) {
        setTitle(text || 'Draft')
      }
    },
    [updateNodeInTree, rootNode.id]
  )

  const handleAddChild = useCallback(
    (parentId: string) => {
      const newChild = createEmptyNode()
      setRootNode((prev) =>
        updateNodeInTree(prev, parentId, (node) => ({
          ...node,
          children: [...node.children, newChild],
          isExpanded: true,
        }))
      )
      setHasChanges(true)
    },
    [updateNodeInTree]
  )

  const handleDelete = useCallback(
    (id: string) => {
      setRootNode((prev) => deleteNodeFromTree(prev, id))
      setHasChanges(true)
    },
    [deleteNodeFromTree]
  )

  const handleToggleExpand = useCallback(
    (id: string) => {
      setRootNode((prev) =>
        updateNodeInTree(prev, id, (node) => ({ ...node, isExpanded: !node.isExpanded }))
      )
    },
    [updateNodeInTree]
  )

  const handleSave = useCallback(async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      const MindMapData = convertToMindMapNode(rootNode)
      await onSave(title || 'Draft', MindMapData as never)
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, rootNode, title])

  const handleClose = useCallback(async () => {
    // Auto-save if there are changes
    if (hasChanges && onSave) {
      try {
        // Generate Draft name
        const response = await fetch('/api/MindMaps')
        const MindMaps = await response.json()
        
        // Count existing Draft MindMaps
        const DraftPattern = /^Draft-mm-(\d+)$/
        let maxNumber = 0
        MindMaps.forEach((mm: { title: string }) => {
          const match = mm.title.match(DraftPattern)
          if (match) {
            maxNumber = Math.max(maxNumber, parseInt(match[1], 10))
          }
        })
        
        const autoSaveTitle = title && title !== 'New MindMap' ? title : `Draft-mm-${maxNumber + 1}`
        const MindMapData = convertToMindMapNode(rootNode)
        await onSave(autoSaveTitle, MindMapData as never)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
    onClose()
  }, [hasChanges, onSave, onClose, rootNode, title])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-4xl max-h-[85vh] m-4 flex flex-col bg-zinc-900/95 rounded-2xl shadow-2xl border border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          {/* Left side - Title input */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setHasChanges(true)
              }}
              placeholder="MindMap title..."
              className="px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50
                       text-zinc-100 text-sm placeholder:text-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       w-64"
            />
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {saveSuccess ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                            bg-emerald-500/20 border border-emerald-500/30
                            text-emerald-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-blue-500/80 hover:bg-blue-500 text-white
                         text-sm font-medium
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
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save to Library
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleClose}
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
        </div>

        {/* Tree Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Instructions */}
            <div className="mb-6 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
              <p className="text-zinc-400 text-sm">
                Click on text to edit • Hover over nodes to see actions • Press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 text-xs">+</kbd>{' '}
                to add child nodes
              </p>
            </div>

            {/* Tree */}
            <div className="bg-zinc-800/20 rounded-xl border border-zinc-700/30 p-4">
              <TreeNode
                node={rootNode}
                depth={0}
                onUpdateText={handleUpdateText}
                onAddChild={handleAddChild}
                onDelete={handleDelete}
                onToggleExpand={handleToggleExpand}
                isRoot
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              {hasChanges && (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Unsaved changes (auto-saves on close)
                </span>
              )}
            </span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
