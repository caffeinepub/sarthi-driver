interface MapSvgProps {
  className?: string;
  animated?: boolean;
}

// Simulated city map SVG with route visualization
export function MapSvg({ className = "", animated = false }: MapSvgProps) {
  return (
    <svg
      viewBox="0 0 300 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dark map background */}
      <title>Route map visualization</title>
      <rect width="300" height="180" fill="#0d1117" rx="8" />

      {/* Grid roads - horizontal */}
      <line x1="0" y1="40" x2="300" y2="40" stroke="#1e2633" strokeWidth="6" />
      <line x1="0" y1="80" x2="300" y2="80" stroke="#1e2633" strokeWidth="4" />
      <line
        x1="0"
        y1="120"
        x2="300"
        y2="120"
        stroke="#1e2633"
        strokeWidth="6"
      />
      <line
        x1="0"
        y1="155"
        x2="300"
        y2="155"
        stroke="#1e2633"
        strokeWidth="3"
      />

      {/* Grid roads - vertical */}
      <line x1="50" y1="0" x2="50" y2="180" stroke="#1e2633" strokeWidth="4" />
      <line
        x1="110"
        y1="0"
        x2="110"
        y2="180"
        stroke="#1e2633"
        strokeWidth="6"
      />
      <line
        x1="180"
        y1="0"
        x2="180"
        y2="180"
        stroke="#1e2633"
        strokeWidth="4"
      />
      <line
        x1="240"
        y1="0"
        x2="240"
        y2="180"
        stroke="#1e2633"
        strokeWidth="6"
      />

      {/* Diagonal road */}
      <line x1="50" y1="0" x2="180" y2="120" stroke="#1e2633" strokeWidth="3" />

      {/* City blocks (lighter fill) */}
      <rect x="55" y="44" width="52" height="33" fill="#161d27" rx="2" />
      <rect x="115" y="44" width="62" height="33" fill="#131920" rx="2" />
      <rect x="185" y="44" width="52" height="33" fill="#161d27" rx="2" />
      <rect x="55" y="85" width="52" height="32" fill="#131920" rx="2" />
      <rect x="185" y="85" width="52" height="32" fill="#161d27" rx="2" />
      <rect x="55" y="124" width="52" height="28" fill="#161d27" rx="2" />
      <rect x="115" y="124" width="62" height="28" fill="#131920" rx="2" />

      {/* Route path */}
      <path
        d="M 60 155 L 60 120 L 110 120 L 110 80 L 180 80 L 180 40 L 240 40"
        stroke="#F39A1F"
        strokeWidth="2.5"
        strokeDasharray="6 3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Route glow */}
      <path
        d="M 60 155 L 60 120 L 110 120 L 110 80 L 180 80 L 180 40 L 240 40"
        stroke="#F39A1F"
        strokeWidth="5"
        fill="none"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* Pickup pin (green) */}
      <circle cx="60" cy="155" r="6" fill="#2ECC71" />
      <circle cx="60" cy="155" r="10" fill="#2ECC71" opacity="0.2" />
      <circle cx="60" cy="155" r="3" fill="white" />

      {/* Drop pin (orange) */}
      <circle cx="240" cy="40" r="6" fill="#F39A1F" />
      <circle cx="240" cy="40" r="10" fill="#F39A1F" opacity="0.2" />
      <circle cx="240" cy="40" r="3" fill="white" />

      {/* Car icon on route */}
      {animated ? (
        <g>
          <circle cx="110" cy="80" r="5" fill="#F39A1F" opacity="0.9">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ) : (
        <circle cx="110" cy="80" r="4" fill="#F39A1F" opacity="0.9" />
      )}

      {/* Labels */}
      <text
        x="52"
        y="172"
        fill="#2ECC71"
        fontSize="7"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        PICKUP
      </text>
      <text
        x="215"
        y="35"
        fill="#F39A1F"
        fontSize="7"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        DROP
      </text>
    </svg>
  );
}

// Large city map for dashboard
export function CityMapSvg({ className = "" }: { className?: string }) {
  const pins = [
    { x: 80, y: 120, color: "#2ECC71", label: "Connaught Place" },
    { x: 160, y: 70, color: "#F39A1F", label: "Karol Bagh" },
    { x: 240, y: 140, color: "#F39A1F", label: "Lajpat Nagar" },
    { x: 120, y: 190, color: "#2ECC71", label: "Saket" },
    { x: 300, y: 80, color: "#F39A1F", label: "Rohini" },
  ];

  return (
    <svg
      viewBox="0 0 380 260"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>City map with driver location pins</title>
      <rect width="380" height="260" fill="#0a0f16" />

      {/* Roads horizontal */}
      {[40, 80, 120, 160, 200, 240].map((y) => (
        <line
          key={`h${y}`}
          x1="0"
          y1={y}
          x2="380"
          y2={y}
          stroke="#1a2233"
          strokeWidth={y % 80 === 0 ? 6 : 3}
        />
      ))}

      {/* Roads vertical */}
      {[50, 100, 150, 200, 250, 300, 350].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="260"
          stroke="#1a2233"
          strokeWidth={x % 100 === 0 ? 6 : 3}
        />
      ))}

      {/* Blocks */}
      {[
        [55, 44, 42, 33],
        [105, 44, 42, 33],
        [155, 44, 42, 33],
        [205, 44, 42, 33],
        [255, 44, 42, 33],
        [55, 85, 42, 32],
        [155, 85, 42, 32],
        [255, 85, 92, 32],
        [55, 125, 42, 32],
        [105, 125, 42, 32],
        [205, 125, 42, 32],
        [305, 125, 42, 32],
        [55, 165, 42, 32],
        [155, 165, 42, 32],
        [255, 165, 42, 32],
      ].map(([x, y, w, h]) => (
        <rect
          key={`block-${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          fill="#111820"
          rx="2"
        />
      ))}

      {/* Route line */}
      <path
        d="M 80 120 L 100 120 L 100 80 L 160 80 L 160 70"
        stroke="#F39A1F"
        strokeWidth="2"
        strokeDasharray="5 3"
        fill="none"
        opacity="0.8"
      />

      {/* Pins */}
      {pins.map((pin) => (
        <g key={pin.label}>
          <circle
            cx={pin.x}
            cy={pin.y}
            r="10"
            fill={pin.color}
            opacity="0.15"
          />
          <circle cx={pin.x} cy={pin.y} r="6" fill={pin.color} />
          <circle cx={pin.x} cy={pin.y} r="3" fill="white" />
          <text
            x={pin.x + 12}
            y={pin.y + 4}
            fill={pin.color}
            fontSize="8"
            fontFamily="sans-serif"
            fontWeight="600"
          >
            {pin.label}
          </text>
        </g>
      ))}

      {/* City label */}
      <text
        x="12"
        y="250"
        fill="#9AA3AD"
        fontSize="11"
        fontFamily="sans-serif"
        fontWeight="700"
        letterSpacing="2"
      >
        NEW DELHI
      </text>
      <circle cx="6" cy="246" r="3" fill="#2ECC71" />
    </svg>
  );
}
