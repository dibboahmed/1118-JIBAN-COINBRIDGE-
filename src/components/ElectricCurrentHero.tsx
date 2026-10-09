import { useState } from 'react';

interface ElectricCurrentHeroProps {
  className?: string;
}

export function ElectricCurrentHero({ className = '' }: ElectricCurrentHeroProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-b from-white/95 via-white/90 to-[#fbf9f5] border border-slate-200/90 p-2 sm:p-2.5 shadow-xl transition-all duration-500 ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Specular Top Rim Reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

      {/* Ambient Electric Energy Glow reacting to hover */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-out rounded-3xl lg:rounded-[2.5rem]"
        style={{
          background: `radial-gradient(600px circle at 50% 50%, rgba(56, 189, 248, ${
            isHovered ? 0.16 : 0.08
          }), rgba(245, 158, 11, ${isHovered ? 0.12 : 0.05}), transparent 70%)`,
        }}
      />

      {/* Main Photorealistic Showcase Frame (Dark Obsidian Frame with High Contrast) */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-2xl lg:rounded-3xl bg-[#0f172a] shadow-inner">
        {/* Photorealistic Hero Image / Aesthetic fallback canvas */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0f1d] flex items-center justify-center overflow-hidden">
          <img
            src="/coin-bridge-hero-real.jpg"
            onError={(e) => {
              // Graceful fallback to dark cybernetic visual gradient
              e.currentTarget.style.display = 'none';
            }}
            alt="CoinBridge Realistic Financial Settlement Architecture"
            referrerPolicy="no-referrer"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="block w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Ambient Darkened Gradient Scrim for High-Contrast Electric Conduit Clarity */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Center Futuristic Graphic if image loads or doesn't */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6 space-y-2 select-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              USDT SETTLEMENT RAIL ACTIVE
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              Instant Global Liquidity Conduit
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SVG Dynamic Electric Current Conduits */}
        {/* ------------------------------------------------------------- */}
        <svg
          viewBox="0 0 1000 562"
          className="pointer-events-none absolute inset-0 h-full w-full z-20 overflow-visible"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cyanElectricFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="goldElectricFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="85%" stopColor="#ea580c" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="emeraldElectricFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="45%" stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#059669" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* TRACK 1: Upper Power Conduit (Cyan Arc across the bridge) */}
          <path
            id="railUpper"
            d="M 60 210 C 220 120, 420 140, 500 170 C 580 200, 780 150, 940 230"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="9"
            strokeOpacity="0.22"
          />
          <path
            d="M 60 210 C 220 120, 420 140, 500 170 C 580 200, 780 150, 940 230"
            fill="none"
            stroke="url(#cyanElectricFlow)"
            strokeWidth="3.4"
            strokeDasharray="24 16"
            className={isHovered ? 'animate-electric-flow-fast' : 'animate-electric-flow'}
          />
          <path
            d="M 60 210 C 220 120, 420 140, 500 170 C 580 200, 780 150, 940 230"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="14 36"
            className={isHovered ? 'animate-electric-flow-fast' : 'animate-electric-flow'}
          />

          {/* TRACK 2: Main Central Hyper-Conduit (Gold/Amber Power) */}
          <path
            id="railCenter"
            d="M 40 310 C 180 260, 360 290, 500 300 C 640 310, 820 270, 960 330"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="10"
            strokeOpacity="0.25"
          />
          <path
            d="M 40 310 C 180 260, 360 290, 500 300 C 640 310, 820 270, 960 330"
            fill="none"
            stroke="url(#goldElectricFlow)"
            strokeWidth="4"
            strokeDasharray="30 20"
            className={isHovered ? 'animate-electric-flow-fast' : 'animate-electric-flow'}
          />
          <path
            d="M 40 310 C 180 260, 360 290, 500 300 C 640 310, 820 270, 960 330"
            fill="none"
            stroke="#fffbeb"
            strokeWidth="1.4"
            strokeDasharray="18 42"
            className={isHovered ? 'animate-electric-flow-fast' : 'animate-electric-flow'}
          />

          {/* TRACK 3: Lower Data Conduit (Emerald Local Payout Channel) */}
          <path
            id="railLower"
            d="M 90 410 C 260 360, 400 390, 520 380 C 660 370, 800 420, 920 390"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeOpacity="0.2"
          />
          <path
            d="M 90 410 C 260 360, 400 390, 520 380 C 660 370, 800 420, 920 390"
            fill="none"
            stroke="url(#emeraldElectricFlow)"
            strokeWidth="3"
            strokeDasharray="22 18"
            className={isHovered ? 'animate-electric-flow-fast' : 'animate-electric-flow'}
          />

          {/* Vertical & Diagonal Electric Arcs (Connecting the tracks) */}
          <path
            d="M 230 148 L 245 200 L 235 240 L 250 280"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="2.2"
            strokeDasharray="6 8"
            className="animate-electric-zap"
          />
          <path
            d="M 495 170 L 510 220 L 490 260 L 505 300 L 515 375"
            fill="none"
            stroke="#fde047"
            strokeWidth="2.4"
            strokeDasharray="8 6"
            className="animate-electric-zap"
          />
          <path
            d="M 760 160 L 745 210 L 765 255 L 750 310"
            fill="none"
            stroke="#34d399"
            strokeWidth="2.2"
            strokeDasharray="7 7"
            className="animate-electric-zap"
          />

          {/* Traveling Electric Packets */}
          <g>
            <circle r={isHovered ? 9 : 7} fill="#38bdf8" opacity="0.45">
              <animateMotion
                dur={isHovered ? '1.4s' : '2.6s'}
                repeatCount="indefinite"
                path="M 60 210 C 220 120, 420 140, 500 170 C 580 200, 780 150, 940 230"
              />
            </circle>
            <circle r={isHovered ? 4.5 : 3.5} fill="#ffffff">
              <animateMotion
                dur={isHovered ? '1.4s' : '2.6s'}
                repeatCount="indefinite"
                path="M 60 210 C 220 120, 420 140, 500 170 C 580 200, 780 150, 940 230"
              />
            </circle>
          </g>

          <g>
            <circle r={isHovered ? 11 : 8} fill="#f59e0b" opacity="0.4">
              <animateMotion
                dur={isHovered ? '1.2s' : '2.2s'}
                repeatCount="indefinite"
                path="M 40 310 C 180 260, 360 290, 500 300 C 640 310, 820 270, 960 330"
              />
            </circle>
            <circle r={isHovered ? 5.5 : 4} fill="#fffbeb">
              <animateMotion
                dur={isHovered ? '1.2s' : '2.2s'}
                repeatCount="indefinite"
                path="M 40 310 C 180 260, 360 290, 500 300 C 640 310, 820 270, 960 330"
              />
            </circle>
          </g>

          <g>
            <circle r={isHovered ? 9 : 7} fill="#10b981" opacity="0.38">
              <animateMotion
                dur={isHovered ? '1.6s' : '3.0s'}
                repeatCount="indefinite"
                path="M 90 410 C 260 360, 400 390, 520 380 C 660 370, 800 420, 920 390"
              />
            </circle>
            <circle r={isHovered ? 4.5 : 3.5} fill="#ecfdf5">
              <animateMotion
                dur={isHovered ? '1.6s' : '3.0s'}
                repeatCount="indefinite"
                path="M 90 410 C 260 360, 400 390, 520 380 C 660 370, 800 420, 920 390"
              />
            </circle>
          </g>

          {/* Circuit Junction Spark Nodes */}
          <g transform="translate(60, 210)">
            <circle r="14" fill="#0284c7" opacity="0.25" className="animate-electric-ring" />
            <circle r="5" fill="#38bdf8" className="animate-electric-spark" />
            <circle r="2.5" fill="#ffffff" />
          </g>

          <g transform="translate(500, 300)">
            <circle r="22" fill="#d97706" opacity="0.25" className="animate-electric-ring" />
            <circle r="8" fill="#fbbf24" className="animate-electric-spark" />
            <circle r="4" fill="#ffffff" />
          </g>

          <g transform="translate(940, 230)">
            <circle r="16" fill="#059669" opacity="0.25" className="animate-electric-ring" />
            <circle r="6" fill="#34d399" className="animate-electric-spark" />
            <circle r="3" fill="#ffffff" />
          </g>
        </svg>

        {/* Protection Shield */}
        <div
          className="absolute inset-0 z-20 select-none bg-transparent"
          style={{
            WebkitTouchCallout: 'none',
            userSelect: 'none',
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
