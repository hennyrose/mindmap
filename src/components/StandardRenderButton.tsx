'use client'

interface StandardRenderButtonProps {
  onClick: () => void
}

export function StandardRenderButton({ onClick }: StandardRenderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-40
                 flex items-center gap-2 px-5 py-2.5 rounded-full
                 bg-zinc-900/90 backdrop-blur-md
                 border border-zinc-700/50 hover:border-zinc-600/50
                 text-zinc-100 text-sm font-medium
                 transition-all duration-200 ease-out
                 hover:bg-zinc-800/90
                 hover:scale-105 active:scale-95
                 shadow-lg shadow-black/30"
      aria-label="Return to Standard Render"
    >
      <svg
        className="w-4 h-4 text-zinc-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>Standard Render</span>
    </button>
  )
}
