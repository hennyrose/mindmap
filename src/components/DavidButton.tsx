'use client'

interface DavidButtonProps {
  onClick: () => void
}

export function DavidButton({ onClick }: DavidButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-40
                 flex items-center gap-2 px-5 py-2.5 rounded-full
                 glass-material
                 text-zinc-100 text-sm font-medium
                 transition-all duration-300 ease-out
                 hover:scale-105 active:scale-95
                 hover:border-white/30
                 shadow-lg shadow-black/20
                 group"
      aria-label="Enter David Mode"
    >
      {/* Gradient glow underneath */}
      <div
        className="absolute inset-0 -z-10 rounded-full 
                   apple-intelligence-gradient
                   blur-xl opacity-60 
                   group-hover:opacity-80
                   transition-opacity duration-300"
      />
      
      {/* Button content */}
      <span className="relative z-10">David</span>
      
      {/* preBeta badge */}
      <span
        className="relative z-10 px-2 py-0.5 rounded-full
                   bg-white/10 border border-white/20
                   text-[10px] font-semibold tracking-wider
                   text-zinc-300"
      >
        preBeta
      </span>
    </button>
  )
}
