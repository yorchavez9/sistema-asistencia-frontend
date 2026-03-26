export default function AnimatedBrainIcon({ className = "h-5 w-5", animate = false }) {
  return (
    <svg
      viewBox="1.5 3.5 21 17"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow */}
      {animate && (
        <circle cx="12" cy="12" r="11.5" stroke="currentColor" strokeWidth="0.4" opacity="0.2">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Left hemisphere - outer shape */}
      <path
        d="M12 4C10.5 4 9.2 4.6 8.3 5.5C7.4 4.9 6.3 4.7 5.3 5.2C4 5.8 3.2 7.1 3.4 8.5C2.5 9.3 2 10.5 2 11.8C2 13.1 2.6 14.2 3.5 15C3.3 15.8 3.4 16.7 3.9 17.5C4.6 18.6 5.8 19.2 7 19.1C7.7 19.9 8.7 20.5 9.8 20.5C10.7 20.5 11.4 20.2 12 19.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {animate && (
          <animate attributeName="stroke-dasharray" values="0 80;80 0" dur="1.2s" repeatCount="1" fill="freeze" />
        )}
      </path>

      {/* Right hemisphere - outer shape */}
      <path
        d="M12 4C13.5 4 14.8 4.6 15.7 5.5C16.6 4.9 17.7 4.7 18.7 5.2C20 5.8 20.8 7.1 20.6 8.5C21.5 9.3 22 10.5 22 11.8C22 13.1 21.4 14.2 20.5 15C20.7 15.8 20.6 16.7 20.1 17.5C19.4 18.6 18.2 19.2 17 19.1C16.3 19.9 15.3 20.5 14.2 20.5C13.3 20.5 12.6 20.2 12 19.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {animate && (
          <animate attributeName="stroke-dasharray" values="0 80;80 0" dur="1.2s" begin="0.15s" repeatCount="1" fill="freeze" />
        )}
      </path>

      {/* Center stem */}
      <path d="M12 4L12 19.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.35">
        {animate && (
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.8s" repeatCount="indefinite" />
        )}
      </path>

      {/* Brain folds - left */}
      <path d="M4.5 9.5C6 9.5 8 10 9.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.4s" repeatCount="indefinite" />
        )}
      </path>
      <path d="M3.8 13.5C5.5 13 7.5 13 9.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.4s" begin="0.3s" repeatCount="indefinite" />
        )}
      </path>
      <path d="M5.5 17C7 16.5 8.5 16.5 10 17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.4s" begin="0.6s" repeatCount="indefinite" />
        )}
      </path>

      {/* Brain folds - right */}
      <path d="M19.5 9.5C18 9.5 16 10 14.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.4s" begin="0.15s" repeatCount="indefinite" />
        )}
      </path>
      <path d="M20.2 13.5C18.5 13 16.5 13 14.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.4s" begin="0.45s" repeatCount="indefinite" />
        )}
      </path>
      <path d="M18.5 17C17 16.5 15.5 16.5 14 17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.4s" begin="0.75s" repeatCount="indefinite" />
        )}
      </path>

      {/* Synaptic pulses */}
      {animate && (
        <>
          <circle cx="6" cy="8" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="18" cy="8" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.35s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" begin="0.35s" repeatCount="indefinite" />
          </circle>
          <circle cx="5" cy="15" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="19" cy="15" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" begin="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="12" cy="7" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.2s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="8" cy="18.5" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.85s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" begin="0.85s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="18.5" r="0.8" fill="currentColor">
            <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.55s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.4;1;0.4" dur="1s" begin="0.55s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  )
}
