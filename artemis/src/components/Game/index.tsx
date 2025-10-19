import React, { useEffect, useMemo, useRef, useState } from "react";

// Next.js + Tailwind ready, single-file React component
// Drop this into app/components/SpaceGame.tsx and render <SpaceGame />
// No external libs required.

// Types
interface Vec2 { x: number; y: number }
interface AstralObject {
  id: string;
  kind: "planet" | "constellation";
  name: string;
  pos: Vec2;
  r: number; // render radius (for planets); constellations will render as nodes/lines but keep a hit radius
  color: string;
  dialogue: string[]; // lines to show when reached
}

type GameState = "idle" | "moving" | "dialogue";

// Easing for arrival feel
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Simple RNG for stars, seeded for consistent layout
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VIEW_W = 1000;
const VIEW_H = 600;
const SHIP_R = 10;

export default function SpaceGame() {
  // Scene data
  const objects: AstralObject[] = useMemo(
    () => [
      {
        id: "sol",
        kind: "planet",
        name: "Sol",
        pos: { x: 160, y: 320 },
        r: 26,
        color: "#fbbf24",
        dialogue: [
          "Welcome, traveler. I am Sol, the warm heart of this sector.",
          "Your journey begins with curiosity—click anywhere that calls to you.",
        ],
      },
      {
        id: "azura",
        kind: "planet",
        name: "Azura",
        pos: { x: 420, y: 180 },
        r: 18,
        color: "#60a5fa",
        dialogue: [
          "Azura hums with oceans and ion storms.",
          "Budget your fuel; wisdom is the best thruster.",
        ],
      },
      {
        id: "ember",
        kind: "planet",
        name: "Ember",
        pos: { x: 760, y: 420 },
        r: 22,
        color: "#f87171",
        dialogue: [
          "Ember’s mantle cracks like old vinyl—beautiful and a little dangerous.",
          "Keep your sensors open; not all heat is hostile.",
        ],
      },
      {
        id: "lyra",
        kind: "constellation",
        name: "Lyra",
        pos: { x: 650, y: 120 },
        r: 28,
        color: "#a78bfa",
        dialogue: [
          "The Lyra constellation sings of pathways and patterns.",
          "In stars and code alike, design reveals intent.",
        ],
      },
    ],
    []
  );

  // Constellation nodes for Lyra demo
  const lyraNodes = useMemo(() => {
    const c = objects.find((o) => o.id === "lyra");
    if (!c) return [] as Vec2[];
    const { x, y } = c.pos;
    return [
      { x: x - 30, y: y - 18 },
      { x: x + 5, y: y - 32 },
      { x: x + 28, y: y + 4 },
      { x: x - 8, y: y + 20 },
    ];
  }, [objects]);

  // Stars background
  const stars = useMemo(() => {
    const rng = mulberry32(42);
    return new Array(180).fill(0).map(() => ({
      x: Math.floor(rng() * VIEW_W),
      y: Math.floor(rng() * VIEW_H),
      s: rng() * 1.8 + 0.4,
      o: rng() * 0.6 + 0.2,
    }));
  }, []);

  // Ship motion state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [ship, setShip] = useState<Vec2>({ x: 80, y: 520 });
  const [target, setTarget] = useState<Vec2 | null>(null);
  const [activeObject, setActiveObject] = useState<AstralObject | null>(null);
  const [dialogueIdx, setDialogueIdx] = useState(0);

  // Motion timing
  const moveStartRef = useRef<number | null>(null);
  const startPosRef = useRef<Vec2>(ship);
  const durationRef = useRef<number>(0);

  // Start moving to a point
  function goTo(obj: AstralObject) {
    setActiveObject(null);
    setDialogueIdx(0);

    const start = ship;
    const end = obj.pos;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Speed: ~240 px/sec, compute duration based on distance
    const speed = 240; // px/s
    const duration = Math.max(0.35, dist / speed);

    startPosRef.current = start;
    durationRef.current = duration * 1000; // to ms
    moveStartRef.current = performance.now();

    setTarget(end);
    setGameState("moving");
  }

  // RAF loop for movement
  useEffect(() => {
    if (gameState !== "moving") return;
    let raf = 0;

    const tick = (now: number) => {
      if (!target || moveStartRef.current == null) return;
      const startTime = moveStartRef.current;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationRef.current);
      const eased = easeInOutQuad(t);

      const sx = startPosRef.current.x;
      const sy = startPosRef.current.y;
      const nx = sx + (target.x - sx) * eased;
      const ny = sy + (target.y - sy) * eased;
      setShip({ x: nx, y: ny });

      if (t >= 1) {
        // Arrived
        setGameState("dialogue");
        // Determine which object we reached (by proximity)
        const obj = objects.reduce((best, o) => {
          const dd = (o.pos.x - nx) ** 2 + (o.pos.y - ny) ** 2;
          return dd < best.dist ? { dist: dd, obj: o } : best;
        }, { dist: Infinity, obj: objects[0] }).obj;
        setActiveObject(obj);
        moveStartRef.current = null;
        setTarget(null);
        startPosRef.current = { x: nx, y: ny };
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gameState, target, objects]);

  // Click handlers
  function onAstralClick(o: AstralObject) {
    // If currently in dialogue, ignore clicks on space
    if (gameState === "dialogue") return;
    goTo(o);
  }

  function advanceDialogue() {
    if (!activeObject) return;
    if (dialogueIdx < activeObject.dialogue.length - 1) {
      setDialogueIdx((i) => i + 1);
    } else {
      setActiveObject(null);
      setGameState("idle");
    }
  }

  // Utility: distance for hover outline thickness
  function shipDistanceTo(p: Vec2) {
    return Math.hypot(ship.x - p.x, ship.y - p.y);
  }

  return (
    <div className="w-full h-[70vh] md:h-[78vh] lg:h-[82vh] bg-black relative overflow-hidden rounded-2xl shadow-xl">
      {/* Title / HUD */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3 text-slate-200/90">
        <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
        <span className="text-sm md:text-base tracking-wide select-none">
          {gameState === "moving" ? "FTL: En route" : gameState === "dialogue" ? "Hailing frequency open" : "Drift: Awaiting orders"}
        </span>
      </div>

      {/* SVG Space */}
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Starfield navigation map"
      >
        {/* Gradients */}
        <defs>
          <radialGradient id="g-planet" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopOpacity={1} stopColor="#ffffff" />
            <stop offset="40%" stopOpacity={0.9} stopColor="#d1d5db" />
            <stop offset="100%" stopOpacity={0.2} stopColor="#0b1220" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Starfield */}
        <g>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#c7d2fe" opacity={s.o} />
          ))}
        </g>

        {/* Constellation example (Lyra) */}
        <g opacity={0.7} filter="url(#glow)">
          {lyraNodes.length > 0 && (
            <>
              {/* lines */}
              {lyraNodes.map((p, i) => (
                i < lyraNodes.length - 1 ? (
                  <line
                    key={`l-${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={lyraNodes[i + 1].x}
                    y2={lyraNodes[i + 1].y}
                    stroke="#a78bfa"
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                  />
                ) : null
              ))}
              {/* nodes */}
              {lyraNodes.map((p, i) => (
                <circle key={`n-${i}`} cx={p.x} cy={p.y} r={2.2} fill="#ddd6fe" />
              ))}
            </>
          )}
        </g>

        {/* Astral objects (planets + constellation hit area) */}
        {objects.map((o) => {
          const dist = shipDistanceTo(o.pos);
          const isLyra = o.id === "lyra";
          const hoverStroke = Math.max(1.5, 5 - dist / 120);
          return (
            <g
              key={o.id}
              className="cursor-pointer"
              onClick={() => onAstralClick(o)}
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${o.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onAstralClick(o);
              }}
            >
              {o.kind === "planet" ? (
                <>
                  <circle cx={o.pos.x} cy={o.pos.y} r={o.r} fill={o.color} filter="url(#glow)" />
                  <circle
                    cx={o.pos.x}
                    cy={o.pos.y}
                    r={o.r + 6}
                    fill="none"
                    stroke={o.color}
                    strokeWidth={hoverStroke}
                    opacity={0.18}
                  />
                </>
              ) : (
                // Constellation clickable region
                <circle
                  cx={o.pos.x}
                  cy={o.pos.y}
                  r={o.r}
                  fill="#a78bfa"
                  opacity={0.12}
                />
              )}
              <text
                x={o.pos.x}
                y={o.pos.y - (o.kind === "planet" ? o.r + 14 : o.r + 10)}
                textAnchor="middle"
                className="fill-white"
                fontSize={12}
                opacity={0.9}
              >
                {o.name}
              </text>
            </g>
          );
        })}

        {/* Ship */}
        <g>
          {/* motion trail */}
          <circle cx={ship.x} cy={ship.y} r={SHIP_R + 9} fill="#22d3ee" opacity={0.06} />
          <circle cx={ship.x} cy={ship.y} r={SHIP_R + 4} fill="#22d3ee" opacity={0.12} />
          <circle cx={ship.x} cy={ship.y} r={SHIP_R} fill="#67e8f9" />
          {/* tiny heading pointer */}
          {target && (
            <line
              x1={ship.x}
              y1={ship.y}
              x2={target.x}
              y2={target.y}
              stroke="#38bdf8"
              strokeDasharray="6 6"
              strokeOpacity={0.25}
            />
          )}
        </g>
      </svg>

      {/* Dialogue overlay */}
      {gameState === "dialogue" && activeObject && (
        <button
          type="button"
          onClick={advanceDialogue}
          className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-6 z-20 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-4 md:p-5 text-left text-slate-100 shadow-2xl"
          aria-label="Advance dialogue"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
            <span className="uppercase tracking-wider text-xs text-slate-300/80">{activeObject.kind}</span>
            <span className="text-sm md:text-base font-semibold">{activeObject.name}</span>
          </div>
          <p className="text-sm md:text-base leading-relaxed select-none">
            {activeObject.dialogue[dialogueIdx]}
          </p>
          <div className="mt-3 text-xs text-slate-400">Click anywhere on this box to continue…</div>
        </button>
      )}

      {/* Hint when idle */}
      {gameState === "idle" && (
        <div className="absolute bottom-3 right-4 text-[11px] md:text-xs text-cyan-200/80 select-none">
          Tip: Click a planet or constellation name to travel there.
        </div>
      )}
    </div>
  );
}
