"use client";

import React, { useEffect, useRef, useState } from "react";
const rocketImg = new window.Image();
rocketImg.src = "/images/rocketnobg.png";
const asteroidImg = new window.Image();
asteroidImg.src = "/images/asteroidnobg.png";
const planetImg = new window.Image();
planetImg.src = "/images/planetnobg.png";
import Image from "next/image";

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;
const SHIP_SIZE = 70;
const MAX_RISK_BUFFER = 5;
const ASTEROID_COUNT = 15;
const ASTEROID_SPEED = 1.5;
const BASE_PLANET_SCORE = 100;
const CORRECT_ANSWER_BONUS = 200;
const HIT_COST = 1;
const MAP_SIZE = 180;

interface Vec2 {
  x: number;
  y: number;
}

interface Asteroid {
  id: string;
  pos: Vec2;
  velocity: Vec2;
  radius: number;
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface CelestialBody {
  id: string;
  type: "planet" | "constellation";
  name: string;
  pos: Vec2;
  radius: number;
  planetFact: string;
  financialFact: string;
  quizQuestion: string;
  quizOptions: QuizOption[];
  color: string;
  scoreMultiplier: number;
  visited: boolean;
}

const initialCelestialBodies: CelestialBody[] = [
  {
    id: "polaris",
    type: "planet",
    name: "Polaris (North Star)",
    pos: { x: 2500, y: 500 },
    radius: 35,
    color: "#fbbf24",
    planetFact: "Polaris is the North Star, located almost directly above Earth's North Pole. It has guided travelers for centuries!",
    financialFact: "Like Polaris guiding travelers, **setting clear financial goals** helps you navigate your money journey. Always keep your 'North Star' in sight!",
    quizQuestion: "Which financial concept is best represented by Polaris, the 'North Star'?",
    quizOptions: [
      { text: "Tracking stock prices", isCorrect: false },
      { text: "Setting long-term financial goals", isCorrect: true },
      { text: "Buying cryptocurrency", isCorrect: false },
      { text: "Paying monthly rent", isCorrect: false },
    ],
    scoreMultiplier: 1.8,
    visited: false
  },
  {
    id: "yildun",
    type: "planet",
    name: "Yildun",
    pos: { x: 2300, y: 700 },
    radius: 30,
    color: "#94a3b8",
    planetFact: "Yildun is the second star from Polaris in the Little Dipper's handle. Its name means 'star' in Turkish!",
    financialFact: "Building a **strong credit foundation** is like following the stars - start with the basics: pay bills on time and keep debt low.",
    quizQuestion: "What is the foundational principle of a strong credit score?",
    quizOptions: [
      { text: "Opening many new credit cards at once", isCorrect: false },
      { text: "Paying bills on time and using low credit limits", isCorrect: true },
      { text: "Investing in volatile assets", isCorrect: false },
      { text: "Avoiding banks entirely", isCorrect: false },
    ],
    scoreMultiplier: 1.5,
    visited: false
  },
  {
    id: "epsilon",
    type: "planet",
    name: "Epsilon Ursae Minoris",
    pos: { x: 2000, y: 1000 },
    radius: 28,
    color: "#8b5cf6",
    planetFact: "Epsilon is the third star in the handle, connecting to the bowl of the Little Dipper.",
    financialFact: "**Diversification** spreads risk across different investments. Don't put all your eggs in one basket!",
    quizQuestion: "The financial fact about Epsilon suggests you should NOT:",
    quizOptions: [
      { text: "Invest all your money into a single company's stock", isCorrect: true },
      { text: "Save money in a high-yield savings account", isCorrect: false },
      { text: "Regularly check your bank account balance", isCorrect: false },
      { text: "Use a budget tracker", isCorrect: false },
    ],
    scoreMultiplier: 1.7,
    visited: false
  },
  {
    id: "delta",
    type: "planet",
    name: "Delta (Yildiz)",
    pos: { x: 1600, y: 1200 },
    radius: 32,
    color: "#60a5fa",
    planetFact: "Delta marks the transition from handle to bowl. It's also called Yildiz, meaning 'star' in Arabic.",
    financialFact: "**Emergency savings** create a buffer between you and financial disaster. Aim for 3-6 months of expenses!",
    quizQuestion: "What is the primary function of an 'Emergency Fund'?",
    quizOptions: [
      { text: "To buy luxury goods", isCorrect: false },
      { text: "To invest in high-risk stocks", isCorrect: false },
      { text: "To act as a financial buffer during unexpected events", isCorrect: true },
      { text: "To pay off long-term mortgages", isCorrect: false },
    ],
    scoreMultiplier: 1.6,
    visited: false
  },
  {
    id: "gamma",
    type: "planet",
    name: "Gamma (Pherkad)",
    pos: { x: 1200, y: 1500 },
    radius: 33,
    color: "#ec4899",
    planetFact: "Pherkad is one of the 'Guardians of the Pole.' It forms the outer corner of the Little Dipper's bowl.",
    financialFact: "Guard your financial future! Start **investing early** - even small amounts grow significantly over time through compound interest.",
    quizQuestion: "What powerful principle makes early investing so effective?",
    quizOptions: [
      { text: "Inflation", isCorrect: false },
      { text: "Compound Interest", isCorrect: true },
      { text: "Financial Leverage", isCorrect: false },
      { text: "Asset Liquidation", isCorrect: false },
    ],
    scoreMultiplier: 2.0,
    visited: false
  },
  {
    id: "beta",
    type: "planet",
    name: "Beta (Kochab)",
    pos: { x: 800, y: 1350 },
    radius: 36,
    color: "#f59e0b",
    planetFact: "Kochab is the brightest star in the Little Dipper after Polaris. It was Earth's North Pole star around 1500 BC!",
    financialFact: "Like how pole stars shift over time, your financial priorities will change. **Review and adjust your budget** regularly!",
    quizQuestion: "Why is it important to regularly review your personal budget?",
    quizOptions: [
      { text: "Because currency rates are always changing", isCorrect: false },
      { text: "Because your income, expenses, and goals change over time", isCorrect: true },
      { text: "Because banks require it for account maintenance", isCorrect: false },
      { text: "Only when you get a new job", isCorrect: false },
    ],
    scoreMultiplier: 1.9,
    visited: false
  },
  {
    id: "zeta",
    type: "planet",
    name: "Zeta Ursae Minoris",
    pos: { x: 950, y: 1700 },
    radius: 30,
    color: "#ef4444",
    planetFact: "Zeta forms the bottom of the Little Dipper's bowl along with Eta. Together they complete the constellation!",
    financialFact: "Complete your financial foundation: budget, save, invest, and **protect with insurance**. All parts work together!",
    quizQuestion: "Which component is essential for completing a solid financial foundation and mitigating risk?",
    quizOptions: [
      { text: "Taking out a personal loan", isCorrect: false },
      { text: "Getting adequate insurance coverage", isCorrect: true },
      { text: "Trading options and futures", isCorrect: false },
      { text: "Holding physical gold", isCorrect: false },
    ],
    scoreMultiplier: 1.5,
    visited: false
  }
];

export default function SpaceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<Vec2>({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const [shipPos, setShipPos] = useState<Vec2>({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const [celestialBodies, setCelestialBodies] = useState<CelestialBody[]>(initialCelestialBodies);
  const [riskBuffer, setRiskBuffer] = useState(MAX_RISK_BUFFER);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<{
    body: CelestialBody;
    step: number;
    isQuizResultCorrect: boolean | null;
  } | null>(null);
  const [isInvincible, setIsInvincible] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const newAsteroids: Asteroid[] = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = ASTEROID_SPEED;
      newAsteroids.push({
        id: `asteroid-${i}`,
        pos: {
          x: Math.random() * WORLD_WIDTH,
          y: Math.random() * WORLD_HEIGHT
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        radius: 15 + Math.random() * 10
      });
    }
    setAsteroids(newAsteroids);
    setCelestialBodies(initialCelestialBodies.map(body => ({
        ...body,
        scoreMultiplier: 1.5 + Math.random() * 1.5,
        visited: false
    })));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      const viewportMouseX = (e.clientX - rect.left) * scaleX;
      const viewportMouseY = (e.clientY - rect.top) * scaleY;
      const centerX = GAME_WIDTH / 2;
      const centerY = GAME_HEIGHT / 2;
      const cameraX = Math.max(0, Math.min(WORLD_WIDTH - GAME_WIDTH, shipPos.x - centerX));
      const cameraY = Math.max(0, Math.min(WORLD_HEIGHT - GAME_HEIGHT, shipPos.y - centerY));
      setMousePos({
        x: viewportMouseX + cameraX,
        y: viewportMouseY + cameraY
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [shipPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      if (dialogueOpen) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      const viewportClickX = (e.clientX - rect.left) * scaleX;
      const viewportClickY = (e.clientY - rect.top) * scaleY;
      const centerX = GAME_WIDTH / 2;
      const centerY = GAME_HEIGHT / 2;
      const cameraX = Math.max(0, Math.min(WORLD_WIDTH - GAME_WIDTH, shipPos.x - centerX));
      const cameraY = Math.max(0, Math.min(WORLD_HEIGHT - GAME_HEIGHT, shipPos.y - centerY));
      const worldClickX = viewportClickX + cameraX;
      const worldClickY = viewportClickY + cameraY;

      for (const body of celestialBodies) {
        const dist = Math.hypot(worldClickX - body.pos.x, worldClickY - body.pos.y);
        if (dist < body.radius) {
          setDialogueOpen(true);
          setCurrentDialogue({
            body: body,
            step: 0,
            isQuizResultCorrect: null
          });
          break;
        }
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [dialogueOpen, celestialBodies, shipPos]);

  useEffect(() => {
    if (gameOver || dialogueOpen) return;

    const interval = setInterval(() => {
      setShipPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1
      }));
      setAsteroids(prev => prev.map(asteroid => {
        let newX = asteroid.pos.x + asteroid.velocity.x;
        let newY = asteroid.pos.y + asteroid.velocity.y;
        let newVelX = asteroid.velocity.x;
        let newVelY = asteroid.velocity.y;
        if (newX < asteroid.radius || newX > WORLD_WIDTH - asteroid.radius) {
          newVelX *= -1;
          newX = Math.max(asteroid.radius, Math.min(WORLD_WIDTH - asteroid.radius, newX));
        }
        if (newY < asteroid.radius || newY > WORLD_HEIGHT - asteroid.radius) {
          newVelY *= -1;
          newY = Math.max(asteroid.radius, Math.min(WORLD_HEIGHT - asteroid.radius, newY));
        }

        return {
          ...asteroid,
          pos: { x: newX, y: newY },
          velocity: { x: newVelX, y: newVelY }
        };
      }));
      if (!isInvincible) {
        asteroids.forEach(asteroid => {
          const dist = Math.hypot(shipPos.x - asteroid.pos.x, shipPos.y - asteroid.pos.y);
          if (dist < SHIP_SIZE / 2 + asteroid.radius) {
            setRiskBuffer(prev => {
              const newBuffer = prev - HIT_COST;
              if (newBuffer <= 0) {
                setGameOver(true);
              }
              return newBuffer;
            });
            setIsInvincible(true);
            setTimeout(() => setIsInvincible(false), 1500);
          }
        });
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [mousePos, shipPos, asteroids, gameOver, dialogueOpen, isInvincible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const cameraX = Math.max(0, Math.min(WORLD_WIDTH - GAME_WIDTH, shipPos.x - centerX));
    const cameraY = Math.max(0, Math.min(WORLD_HEIGHT - GAME_HEIGHT, shipPos.y - centerY));
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    ctx.fillStyle = "#1a2156";
    ctx.fillRect(cameraX, cameraY, GAME_WIDTH, GAME_HEIGHT);
    for (let i = 0; i < 300; i++) {
      const x = (i * 137.5) % WORLD_WIDTH;
      const y = (i * 241.3) % WORLD_HEIGHT;
      const size = (i % 3) * 0.7 + 0.7;
      ctx.globalAlpha = 0.6 + (i % 4) * 0.1; 
      ctx.fillStyle = "#eaf6ff";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#FFE8B3";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const connectStar = (index: number) => {
        const body = celestialBodies[index];
        return { x: body.pos.x, y: body.pos.y };
    };
    ctx.moveTo(connectStar(0).x, connectStar(0).y);
    ctx.lineTo(connectStar(1).x, connectStar(1).y);
    ctx.lineTo(connectStar(2).x, connectStar(2).y);
    ctx.lineTo(connectStar(3).x, connectStar(3).y);
    ctx.lineTo(connectStar(4).x, connectStar(4).y);
    ctx.lineTo(connectStar(5).x, connectStar(5).y);
    ctx.lineTo(connectStar(6).x, connectStar(6).y);
    ctx.lineTo(connectStar(4).x, connectStar(4).y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    celestialBodies.forEach((body, i) => {
      const size = body.radius * 2;
      ctx.save();
      ctx.translate(body.pos.x, body.pos.y);
      if (i % 2 === 1) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(planetImg, i % 2 === 1 ? -size + body.radius : -body.radius, -body.radius, size, size);
      ctx.restore();
      if (body.visited) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(body.pos.x, body.pos.y, body.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#FFE8B3";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(body.name, body.pos.x, body.pos.y - body.radius - 20);
      ctx.fillStyle = body.visited ? "#94a3b8" : "#fbbf24";
      ctx.font = "12px monospace";
      ctx.fillText(`${body.scoreMultiplier.toFixed(1)}x`, body.pos.x, body.pos.y - body.radius - 5);
    });
    asteroids.forEach(asteroid => {
      const size = asteroid.radius * 2;
      ctx.save();
      ctx.translate(asteroid.pos.x, asteroid.pos.y);
      ctx.drawImage(asteroidImg, -asteroid.radius, -asteroid.radius, size, size);
      ctx.restore();
    });
    if (isInvincible) {
      ctx.globalAlpha = 0.5;
    }
    const dx = mousePos.x - shipPos.x;
    const dy = mousePos.y - shipPos.y;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    ctx.save();
    ctx.translate(shipPos.x, shipPos.y);
    ctx.rotate(angle);
    ctx.drawImage(rocketImg, -SHIP_SIZE / 2, -SHIP_SIZE / 2, SHIP_SIZE, SHIP_SIZE);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.restore();
    const mapX = GAME_WIDTH - MAP_SIZE - 20;
    const mapY = 20;
    ctx.fillStyle = "rgba(42, 40, 80, 0.8)";
    ctx.fillRect(mapX, mapY, MAP_SIZE, MAP_SIZE);
    ctx.strokeStyle = "#FFE8B3";
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, MAP_SIZE, MAP_SIZE);
    ctx.fillStyle = "#FFE8B3";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("World Map", mapX + MAP_SIZE / 2, mapY + 15);
    const scaleX = MAP_SIZE / WORLD_WIDTH;
    const scaleY = MAP_SIZE / WORLD_HEIGHT;
    ctx.strokeStyle = "#FFE8B3";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mapX + celestialBodies[0].pos.x * scaleX, mapY + celestialBodies[0].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[1].pos.x * scaleX, mapY + celestialBodies[1].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[2].pos.x * scaleX, mapY + celestialBodies[2].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[3].pos.x * scaleX, mapY + celestialBodies[3].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[4].pos.x * scaleX, mapY + celestialBodies[4].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[5].pos.x * scaleX, mapY + celestialBodies[5].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[6].pos.x * scaleX, mapY + celestialBodies[6].pos.y * scaleY);
    ctx.lineTo(mapX + celestialBodies[4].pos.x * scaleX, mapY + celestialBodies[4].pos.y * scaleY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    celestialBodies.forEach(body => {
      const x = mapX + body.pos.x * scaleX;
      const y = mapY + body.pos.y * scaleY;

      if (body.visited) {
        ctx.fillStyle = body.color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX + cameraX * scaleX, mapY + cameraY * scaleY, GAME_WIDTH * scaleX, GAME_HEIGHT * scaleY);
    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.arc(mapX + shipPos.x * scaleX, mapY + shipPos.y * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [shipPos, asteroids, celestialBodies, isInvincible]);

  const handleDialogueAdvance = () => {
    if (!currentDialogue) return;

    if (currentDialogue.step < 2) {
      setCurrentDialogue(prev => (prev ? { ...prev, step: prev.step + 1 } : null));
    } else if (currentDialogue.step === 2) {
        if (currentDialogue.isQuizResultCorrect !== null) {
            setDialogueOpen(false);
            setCurrentDialogue(null);
        }
    }
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (!currentDialogue || currentDialogue.isQuizResultCorrect !== null) return;

    setCurrentDialogue(prev => (prev ? { ...prev, isQuizResultCorrect: isCorrect } : null));

    if (isCorrect) {
      const body = currentDialogue.body;
      const pointsAwarded = Math.floor(BASE_PLANET_SCORE * body.scoreMultiplier);
      const finalPoints = pointsAwarded + CORRECT_ANSWER_BONUS;

      setScore(prev => prev + finalPoints);

      setCelestialBodies(prev => prev.map(b =>
        b.id === body.id ? { ...b, visited: true } : b
      ));
    } else {
        setScore(prev => Math.max(0, prev - 50));
    }
  };

  const handleRestart = () => {
    setDialogueOpen(false);
    setCurrentDialogue(null);
    setRiskBuffer(MAX_RISK_BUFFER);
    setGameOver(false);
    setShipPos({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
    setIsInvincible(false);
    setScore(0);
    setCelestialBodies(prev => prev.map(body => ({
      ...body,
      scoreMultiplier: 1.5 + Math.random() * 1.5,
      visited: false
    })));
    const newAsteroids: Asteroid[] = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = ASTEROID_SPEED;
      newAsteroids.push({
        id: `asteroid-${i}`,
        pos: {
          x: Math.random() * WORLD_WIDTH,
          y: Math.random() * WORLD_HEIGHT
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        radius: 15 + Math.random() * 10
      });
    }
    setAsteroids(newAsteroids);
  };

  return (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f0a1e] p-4">
      <div className="relative border-4 border-[#FFE8B3]/50 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 z-10 pointer-events-none">
          <div className="bg-[#2A2850]/90 backdrop-blur-sm rounded-xl px-5 py-3 border border-[#FFE8B3]/20 pointer-events-auto">
            <p className="font-mono text-[#FFE8B3] text-sm mb-1">Learning Score</p>
            <p className="font-mono text-[#fbbf24] text-3xl font-bold">{score}</p>
          </div>
          <div className="flex flex-col items-end pointer-events-auto">
            <p className="font-mono text-[#FFE8B3]/80 text-sm mb-1">Risk Buffer (Emergency Fund)</p>
            <div className="flex gap-2 items-center">
              {[...Array(MAX_RISK_BUFFER)].map((_, i) => (
                <img
                  key={i}
                  src="/images/mineheart.png"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src.endsWith("mineheart.png")) target.src = "/images/mineheart.png";
                  }}
                  alt={i < riskBuffer ? "Heart full" : "Heart empty"}
                  className={`${i < riskBuffer ? '' : 'opacity-30 grayscale'} drop-shadow-[0_0_6px_rgba(255,0,0,0.4)]`}
                  width={28}
                  height={28}
                />
              ))}
            </div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-[#0f0a1e]"
        />
        {dialogueOpen && currentDialogue && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8 z-20">
            <div className="bg-[#2A2850] rounded-3xl border-2 border-[#FFE8B3]/30 p-8 max-w-2xl w-full">
              <h3 className="font-mono text-[#FFE8B3] text-3xl mb-4 text-center">{currentDialogue.body.name}</h3>
              <div className="h-64 overflow-y-auto">
                {currentDialogue.step === 0 && (
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/deer.svg"
                        alt="Space Guide"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                    <p className="font-mono text-[#FFE8B3] text-lg leading-relaxed">
                      <span className="text-[#fbbf24] font-bold">Space Guide:</span> {currentDialogue.body.planetFact}
                    </p>
                  </div>
                )}
                {currentDialogue.step === 1 && (
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/bunny.svg"
                        alt="Finance Broker"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                    <p className="font-mono text-[#67e8f9] text-lg leading-relaxed">
                      <span className="text-[#FFE8B3] font-bold">Finance Broker:</span> {currentDialogue.body.financialFact}
                    </p>
                  </div>
                )}
                {currentDialogue.step === 2 && (
                    <div className="space-y-4">
                        <p className="font-mono text-[#FFE8B3] text-xl font-bold mb-4">Quiz: Test Your Astro-Finance Knowledge!</p>
                        <p className="font-mono text-[#fbbf24] text-lg">{currentDialogue.body.quizQuestion}</p>
                        
                        <div className="space-y-2 pt-2">
                            {currentDialogue.body.quizOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuizAnswer(option.isCorrect)}
                                    disabled={currentDialogue.isQuizResultCorrect !== null}
                                    className={`w-full text-left font-mono px-4 py-3 rounded-xl transition-all ${
                                        currentDialogue.isQuizResultCorrect === null
                                            ? 'bg-[#36336A] text-[#FFE8B3] hover:bg-[#36336A]/80'
                                            : option.isCorrect
                                                ? 'bg-green-600 text-white border-2 border-green-400'
                                                : !option.isCorrect && currentDialogue.isQuizResultCorrect === false
                                                    ? 'bg-red-600 text-white border-2 border-red-400 opacity-50'
                                                    : 'bg-[#36336A] opacity-50'
                                    }`}
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                        
                        {currentDialogue.isQuizResultCorrect !== null && (
                            <div className={`mt-4 p-3 rounded-lg text-center font-mono ${currentDialogue.isQuizResultCorrect ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
                                {currentDialogue.isQuizResultCorrect ? 
                                    `Correct! +${Math.floor(BASE_PLANET_SCORE * currentDialogue.body.scoreMultiplier) + CORRECT_ANSWER_BONUS} Pts Awarded!` : 
                                    "Incorrect. Study the facts and try another star!"}
                            </div>
                        )}
                    </div>
                )}
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                    onClick={handleDialogueAdvance}
                    disabled={currentDialogue.step === 2 && currentDialogue.isQuizResultCorrect === null}
                    className="bg-[#FFE8B3] text-[#36336A] font-mono px-6 py-3 rounded-full hover:bg-[#FFE8B3]/90 transition-all text-base font-bold"
                >
                    {currentDialogue.step === 0 ? "Next: Financial Insight (1/3)" : currentDialogue.step === 1 ? "Next: Start Quiz (2/3)" : "Close (3/3)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-30">
            <div className="bg-[#2A2850] rounded-3xl border-2 border-[#FFE8B3]/30 p-12 text-center max-w-md">
              <h2 className="font-mono text-[#FFE8B3] text-4xl mb-4">Risk Buffer Depleted!</h2>
              <p className="font-mono text-[#FFE8B3]/80 text-lg mb-6">Mission complete. Your financial knowledge saved you, but your risk tolerance was breached!</p>

              <div className="bg-[#36336A]/50 rounded-2xl p-6 mb-6 border border-[#FFE8B3]/20">
                <p className="font-mono text-[#FFE8B3]/70 text-sm mb-2">Final Learning Score</p>
                <p className="font-mono text-[#fbbf24] text-5xl font-bold mb-3">{score}</p>
                <p className="font-mono text-[#FFE8B3]/70 text-sm">Stars Mastered (Quizzed): {celestialBodies.filter(b => b.visited).length}/7</p>
                {celestialBodies.filter(b => b.visited).length === 7 && (
                  <p className="font-mono text-green-400 text-sm mt-2">⭐ Full Celestial Portfolio Achieved!</p>
                )}
              </div>

              <button
                onClick={handleRestart}
                className="bg-[#FFE8B3] text-[#36336A] font-mono px-8 py-4 rounded-full hover:bg-[#FFE8B3]/90 transition-all text-xl font-bold"
              >
                Start New Expedition
              </button>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full text-center py-4 bg-[#0f0a1e]/80 border-t border-[#FFE8B3]/20">
          <p className="font-mono text-[#FFE8B3]/80 text-sm">
            Move mouse to navigate. Click stars to master facts and earn points. Avoid asteroids (market volatility)!
          </p>
        </div>
      </div>
    </div>
  );
}