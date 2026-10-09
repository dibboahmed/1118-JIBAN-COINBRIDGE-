import { useEffect, useRef, useState } from 'react';

/**
 * High-performance, GPU-accelerated floating light dust particles.
 * Floats gently upward with slow organic drift and subtle shimmering.
 * Automatically halts when reduced motion is preferred or tab is blurred.
 */
export function CinematicLightDust({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Subtle particles with warm/amber/soft tints matching CoinBridge palette
    const particleColors = [
      'rgba(223, 114, 91, ', // Terracotta #df725b
      'rgba(248, 207, 98, ', // Warm Gold #f8cf62
      'rgba(168, 200, 189, ', // Sage/Mint #a8c8bd
      'rgba(250, 246, 235, ', // Warm cream #faf6eb
    ];

    interface Particle {
      x: number;
      y: number;
      radius: number;
      colorPrefix: string;
      baseAlpha: number;
      alpha: number;
      alphaSpeed: number;
      vy: number;
      vx: number;
      wobbleSpeed: number;
      wobbleAngle: number;
    }

    const count = Math.min(12, Math.floor(width / 90));
    const particles: Particle[] = Array.from({ length: count }, () => {
      const baseAlpha = 0.08 + Math.random() * 0.12;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.9 + Math.random() * 1.2,
        colorPrefix: particleColors[Math.floor(Math.random() * particleColors.length)],
        baseAlpha,
        alpha: baseAlpha,
        alphaSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        vy: -(0.12 + Math.random() * 0.2),
        vx: (Math.random() - 0.5) * 0.15,
        wobbleSpeed: 0.008 + Math.random() * 0.015,
        wobbleAngle: Math.random() * Math.PI * 2,
      };
    });

    let isVisible = true;
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const render = () => {
      if (isVisible && !isScrolling) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.vy;
          p.wobbleAngle += p.wobbleSpeed;
          p.x += p.vx + Math.sin(p.wobbleAngle) * 0.18;
          p.alpha += p.alphaSpeed;
          if (p.alpha > p.baseAlpha + 0.14) {
            p.alphaSpeed = -Math.abs(p.alphaSpeed);
          } else if (p.alpha < Math.max(0.04, p.baseAlpha - 0.1)) {
            p.alphaSpeed = Math.abs(p.alphaSpeed);
          }

          // Wrap edges
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          // Draw clean GPU-accelerated circle without expensive canvas shadowBlur
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.colorPrefix}${p.alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-20 h-full w-full opacity-70 transform-gpu ${className}`}
      style={{ contain: 'strict' }}
      aria-hidden="true"
    />
  );
}

/**
 * Atmospheric ambient lighting orbs that slowly drift across the page.
 * Keeps existing background color while creating cinematic illumination and depth.
 */
export function CinematicAmbientGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 transform-gpu"
      style={{ contain: 'paint' }}
      aria-hidden="true"
    >
      {/* Top right subtle terracotta orb */}
      <div
        className="animate-ambient-1 absolute -top-24 right-[-10%] h-[550px] w-[550px] rounded-full sm:h-[750px] sm:w-[750px] transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(223, 114, 91, 0.07) 0%, transparent 70%)',
        }}
      />
      {/* Top left subtle warm gold orb */}
      <div
        className="animate-ambient-2 absolute top-12 left-[-8%] h-[500px] w-[500px] rounded-full sm:h-[700px] sm:w-[700px] transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(248, 207, 98, 0.06) 0%, transparent 70%)',
        }}
      />
      {/* Mid center subtle sage light pulse */}
      <div
        className="animate-pulse-glow absolute top-[36%] left-[45%] -translate-x-1/2 h-[450px] w-[600px] rounded-full transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(168, 200, 189, 0.05) 0%, transparent 70%)',
        }}
      />
      {/* Lower section subtle terracotta / gold reflection */}
      <div
        className="animate-ambient-1 absolute bottom-[15%] right-[5%] h-[600px] w-[600px] rounded-full transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(223, 114, 91, 0.05) 0%, transparent 70%)',
        }}
      />
      {/* Bottom left gentle depth */}
      <div
        className="animate-ambient-2 absolute -bottom-20 left-[2%] h-[500px] w-[500px] rounded-full transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(248, 207, 98, 0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

/**
 * Anamorphic Cinematic Light Beam that sweeps softly across the page.
 * Creates an ultra-premium, slow-moving atmospheric light pass.
 */
export function CinematicLightBeam() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-10 transform-gpu"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      <div
        className="animate-lens-sweep absolute top-[-40%] left-[-20%] h-[180%] w-[45vw] bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}

/**
 * Hook for continuous cinematic scroll depth and subtle parallax across sections.
 */
export function useCinematicScrollDepth() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let frameId: number;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        frameId = requestAnimationFrame(() => {
          const total = document.documentElement.scrollHeight - window.innerHeight;
          const current = window.scrollY;
          setScrollProgress(total > 0 ? Math.min(1, Math.max(0, current / total)) : 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return scrollProgress;
}

/**
 * Hook for smooth, cinematic mouse parallax tracking on desktop.
 * Highly optimized: pauses during scroll and only triggers React updates when significant delta exists.
 */
export function useCinematicParallax(intensity = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    if (window.innerWidth < 768) return; // Desktop only for performance

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastReportedX = 0;
    let lastReportedY = 0;
    let frameId: number;
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isScrolling) return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * 10 * intensity;
      targetY = ((e.clientY - centerY) / centerY) * 10 * intensity;
    };

    const loop = () => {
      if (!isScrolling) {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        // Only trigger React state update if there is significant change (> 0.25px)
        if (Math.abs(currentX - lastReportedX) > 0.25 || Math.abs(currentY - lastReportedY) > 0.25) {
          lastReportedX = Math.round(currentX * 10) / 10;
          lastReportedY = Math.round(currentY * 10) / 10;
          setOffset({ x: lastReportedX, y: lastReportedY });
        }
      }
      frameId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove as any, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    frameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove as any);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
      cancelAnimationFrame(frameId);
    };
  }, [intensity]);

  return offset;
}

/**
 * Hook to trigger cinematic reveal when elements scroll into the viewport.
 */
export function useScrollReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    // Check if already in viewport on mount (e.g. Hero at the top)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const timer = setTimeout(() => {
        el.classList.add('is-revealed');
      }, 60);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Premium Celestial Background Chorki (Pinwheel Vortex / Orbital Wheel)
 * Spins smoothly in the atmospheric background with multi-color iridescent blades,
 * counter-rotating celestial chronometer rings, and soft radiant volumetric glow.
 */
export function PremiumBackgroundChorki() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0 transform-gpu"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Primary Luminous Chorki (Top-Right / Hero Atmospheric Vortex) */}
      <div className="animate-chorki-float absolute -top-24 right-[-14%] sm:right-[-6%] lg:right-[0%] w-[520px] h-[520px]">
        {/* Ambient Halo Behind Chorki */}
        <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-[#df725b]/20 via-[#f8cf62]/25 to-[#38bdf8]/15 blur-2xl opacity-70" />
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="chorkiBlade1" x1="300" y1="300" x2="480" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8cf62" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#df725b" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#df725b" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade2" x1="300" y1="300" x2="520" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#df725b" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#e2136e" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#e2136e" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade3" x1="300" y1="300" x2="450" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2136e" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#5f22d9" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#5f22d9" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade4" x1="300" y1="300" x2="300" y2="520" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5f22d9" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade5" x1="300" y1="300" x2="150" y2="450" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade6" x1="300" y1="300" x2="80" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade7" x1="300" y1="300" x2="150" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiBlade8" x1="300" y1="300" x2="300" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#f8cf62" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#f8cf62" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="chorkiRingGrad" x1="100" y1="100" x2="500" y2="500" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#df725b" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#f8cf62" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* LAYER 1: Counter-Rotating Celestial Rings & Chronometer Ticks */}
          <g className="animate-chorki-counter" style={{ transformOrigin: '300px 300px' }}>
            <circle cx="300" cy="300" r="275" stroke="url(#chorkiRingGrad)" strokeWidth="1.2" strokeDasharray="4 12" opacity="0.65" />
            <circle cx="300" cy="300" r="245" stroke="url(#chorkiRingGrad)" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.45" />
            <circle cx="300" cy="300" r="170" stroke="url(#chorkiRingGrad)" strokeWidth="1" strokeDasharray="6 14" opacity="0.35" />

            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = 300 + 245 * Math.cos(rad);
              const y = 300 + 245 * Math.sin(rad);
              return (
                <g key={i} transform={`translate(${x}, ${y}) rotate(${angle})`}>
                  <rect x="-3" y="-3" width="6" height="6" transform="rotate(45)" fill="#df725b" opacity="0.75" />
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                </g>
              );
            })}
          </g>

          {/* LAYER 2: The Main Spinning Chorki (8 Curved Pinwheel Blades) */}
          <g className="animate-chorki-spin" style={{ transformOrigin: '300px 300px' }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <g key={`blade-${idx}`} transform={`rotate(${angle} 300 300)`}>
                <path
                  d="M300 300 C340 270, 420 220, 520 260 C460 320, 390 330, 300 300 Z"
                  fill={`url(#chorkiBlade${(idx % 8) + 1})`}
                  opacity="0.85"
                />
                <path
                  d="M300 300 C350 265, 430 225, 520 260"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <circle cx="520" cy="260" r="2.5" fill="#ffffff" opacity="0.8" />
              </g>
            ))}
          </g>

          {/* LAYER 3: Luminous Center Hub (Sun/Jewel Prism) */}
          <g>
            <circle cx="300" cy="300" r="48" fill="url(#chorkiRingGrad)" opacity="0.25" className="animate-pulse" />
            <circle cx="300" cy="300" r="30" fill="#ffffff" stroke="#df725b" strokeWidth="2" opacity="0.9" className="shadow-sm" />
            <rect x="292" y="292" width="16" height="16" rx="3" transform="rotate(45 300 300)" fill="#df725b" />
            <circle cx="300" cy="300" r="3.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Secondary Soft Harmonic Chorki (Mid-Lower Section Depth) */}
      <div className="animate-chorki-float absolute top-[45%] left-[-16%] sm:left-[-8%] lg:left-[-4%] w-[420px] h-[420px]">
        <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#06b6d4]/18 via-[#34d399]/20 to-[#f8cf62]/15 blur-2xl opacity-60" />
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <g className="animate-chorki-counter" style={{ transformOrigin: '300px 300px' }}>
            <circle cx="300" cy="300" r="260" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="5 15" opacity="0.5" />
            <circle cx="300" cy="300" r="220" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2 8" opacity="0.4" />
            <circle cx="300" cy="300" r="160" stroke="#f8cf62" strokeWidth="1" strokeDasharray="4 10" opacity="0.3" />

            {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
              <g key={`sec-${idx}`} transform={`rotate(${angle} 300 300)`}>
                <path
                  d="M300 300 C340 270, 410 230, 500 270 C450 320, 380 330, 300 300 Z"
                  fill="url(#chorkiBlade6)"
                  opacity="0.6"
                />
                <path
                  d="M300 300 C350 270, 420 240, 500 270"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </g>
            ))}

            <circle cx="300" cy="300" r="24" fill="#ffffff" opacity="0.85" />
            <rect x="294" y="294" width="12" height="12" rx="2" transform="rotate(45 300 300)" fill="#06b6d4" />
          </g>
        </svg>
      </div>
    </div>
  );
}
