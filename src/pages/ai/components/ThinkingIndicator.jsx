import AnimatedBrainIcon from "./AnimatedBrainIcon"

export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4">
      <div className="relative shrink-0 mt-0.5" style={{ width: 32, height: 32 }}>
        {/* Outer pulse ring 1 */}
        <span
          className="absolute rounded-full bg-primary"
          style={{
            inset: -4,
            animation: "thinking-ping 4s ease-out infinite",
          }}
        />
        {/* Outer pulse ring 2 */}
        <span
          className="absolute rounded-full bg-primary"
          style={{
            inset: -2,
            animation: "thinking-ping 4s ease-out infinite 1s",
          }}
        />
        {/* Main circle with heartbeat */}
        <div
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary"
          style={{ animation: "thinking-heartbeat 3.5s ease-in-out infinite" }}
        >
          <AnimatedBrainIcon className="h-4.5 w-4.5 text-white" animate />
        </div>
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-card dark:bg-[#131920] p-4 max-w-[80%]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pensando</span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes thinking-ping {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes thinking-heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.12); }
          30% { transform: scale(0.92); }
          45% { transform: scale(1.08); }
          60% { transform: scale(0.96); }
          75% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
