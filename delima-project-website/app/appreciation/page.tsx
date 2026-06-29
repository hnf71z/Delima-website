"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Users, ShoppingCart, Volume2, VolumeX, Play, Home } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Highlighter } from "@/components/ui/highlighter"
import { SmoothCursor } from "@/components/ui/smooth-cursor"

// Pre-rendered (optimized) gallery URLs we warm into cache before Step 3 shows.
const PHOTO_PRELOAD_WIDTH = 640
const PHOTO_QUALITY = 65

// ----------------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------------
const customerPhotos = Array.from({ length: 17 }, (_, i) => `/photo${i + 1}.jpeg`)

// Step 1 ~7.5s, Step 2 ~5.5s, Step 3 loops forever (no auto-advance).
const STEP_DURATIONS = [7500, 5500]

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------
export default function AppreciationPage() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sequential step advance via timers (Step 3 is terminal / loops on its own).
  useEffect(() => {
    if (!started) return
    if (currentStep >= STEP_DURATIONS.length) return
    const t = setTimeout(() => setCurrentStep((s) => s + 1), STEP_DURATIONS[currentStep])
    return () => clearTimeout(t)
  }, [started, currentStep])

  // Warm the gallery images into the browser cache as soon as the page mounts,
  // hitting the exact optimized URLs next/image will request, so by the time the
  // "Our Customer" step appears (~13s later) every photo paints instantly.
  useEffect(() => {
    customerPhotos.forEach((src) => {
      const img = new window.Image()
      img.src = `/_next/image?url=${encodeURIComponent(src)}&w=${PHOTO_PRELOAD_WIDTH}&q=${PHOTO_QUALITY}`
    })
  }, [])

  const handleStart = () => {
    setStarted(true)
    setCurrentStep(0)
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.7
      audio.play().catch(() => {})
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }

  return (
    <main className="appreciation-page fixed inset-0 h-screen w-screen overflow-hidden bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <SmoothCursor />
      <audio ref={audioRef} src="/thanks.mp3" loop preload="auto" />

      {/* Intro overlay — gives us a user gesture so audio can autoplay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-white to-gray-50 px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="font-script text-5xl text-gray-900 sm:text-6xl"
            >
              Sebuah Persembahan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="max-w-md text-base text-gray-500"
            >
              Luangkan waktu sejenak untuk sebuah ucapan terima kasih dari De&apos;Lima.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={handleStart}
              className="group flex items-center gap-3 rounded-full bg-[#22C55E] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-green-500/30 transition hover:scale-105 hover:bg-[#16A34A]"
            >
              <Play className="h-5 w-5 fill-white" />
              Mulai
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute toggle */}
      {started && (
        <button
          onClick={toggleMute}
          aria-label={muted ? "Aktifkan suara" : "Bisukan suara"}
          className="absolute right-5 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 shadow-sm backdrop-blur transition hover:text-gray-900"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}

      {/* Progress dots */}
      {started && (
        <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                Math.min(currentStep, 2) === i ? "w-8 bg-[#22C55E]" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Steps */}
      {started && (
        <AnimatePresence mode="wait">
          {currentStep === 0 && <StepThankYou key="step-1" />}
          {currentStep === 1 && <StepMilestone key="step-2" />}
          {currentStep >= 2 && <StepGallery key="step-3" />}
        </AnimatePresence>
      )}
    </main>
  )
}

// ----------------------------------------------------------------------------
// Step 1 — Thank-you story (cursive, sequential reveal, highlighted keywords)
// ----------------------------------------------------------------------------
// A keyword that only gets its rough-notation annotation once `active`.
// While inactive it renders the same inline text (so layout never shifts and
// the annotation, drawn later, lands in the correct, final position).
function Mark({
  active,
  children,
  ...props
}: {
  active: boolean
  children: React.ReactNode
  action?: "highlight" | "underline"
  color?: string
  strokeWidth?: number
  padding?: number
}) {
  if (!active) return <span>{children}</span>
  return <Highlighter {...props}>{children}</Highlighter>
}

function StepThankYou() {
  // Each line is a render function of `active` so the highlight is applied only
  // when the line is revealed — but all lines stay mounted to reserve layout.
  const lineDefs = [
    () => <>Sebuah perjalanan dimulai dari</>,
    (active: boolean) => (
      <>
        satu{" "}
        <Mark active={active} action="highlight" color="#AFFF00" padding={4}>
          Langkah Berarti
        </Mark>
        .
      </>
    ),
    (active: boolean) => (
      <>
        <Mark active={active} action="highlight" color="#AFFF00" padding={4}>
          Terima Kasih
        </Mark>{" "}
        telah menemani
      </>
    ),
    (active: boolean) => (
      <>
        perjalanan{" "}
        <Mark active={active} action="underline" color="#22C55E" strokeWidth={3}>
          De&apos;Lima
        </Mark>
        .
      </>
    ),
  ]

  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const timers = lineDefs.map((_, i) =>
      setTimeout(() => setVisible((v) => Math.max(v, i + 1)), 500 + i * 1500)
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
    >
      {lineDefs.map((def, i) => {
        const active = i < visible
        return (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="font-script text-4xl leading-relaxed text-gray-900 sm:text-5xl md:text-6xl"
          >
            {def(active)}
          </motion.p>
        )
      })}
    </motion.section>
  )
}

// ----------------------------------------------------------------------------
// Step 2 — Milestone with NumberTicker + fireworks celebration
// ----------------------------------------------------------------------------
function StepMilestone() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6 text-center"
    >
      <Fireworks />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#15803D] sm:text-sm">
          Milestone
        </span>
        <h2 className="font-script text-5xl text-gray-900 sm:text-6xl">
          Pencapaian De&apos;Lima
        </h2>
      </motion.div>

      <div className="relative z-10 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <MetricCard
          icon={<Users className="h-8 w-8" />}
          value={38}
          label="Customers"
          delay={0.4}
        />
        <MetricCard
          icon={<ShoppingCart className="h-8 w-8" />}
          value={63}
          label="Produk Terjual"
          delay={0.7}
        />
      </div>
    </motion.section>
  )
}

function MetricCard({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode
  value: number
  label: string
  delay: number
}) {
  // Trigger a zoom "pop" once NumberTicker has settled on the real value.
  const [popped, setPopped] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setPopped(true), delay * 1000 + 1900)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, type: "spring", bounce: 0.35 }}
      className="relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-gray-100 bg-white/80 px-8 py-10 shadow-xl shadow-green-900/5 backdrop-blur-sm"
    >
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E2F5D6] opacity-60 blur-2xl" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#22C55E] text-white shadow-lg shadow-green-500/30">
        {icon}
      </div>

      <motion.div
        animate={popped ? { scale: [1, 1.45, 0.95, 1] } : { scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", times: [0, 0.4, 0.7, 1] }}
        className="relative"
      >
        <NumberTicker
          value={value}
          delay={delay}
          className="bg-gradient-to-b from-[#22C55E] to-[#15803D] bg-clip-text text-6xl font-black text-transparent sm:text-7xl"
        />
      </motion.div>

      <span className="relative text-sm font-semibold uppercase tracking-wide text-gray-500 sm:text-base">
        {label}
      </span>
    </motion.div>
  )
}

// Lively CSS/Framer fireworks — no external deps. Many staggered bursts that
// keep re-launching across the whole screen, on desktop and mobile alike.
function Fireworks() {
  const palette = [
    "#AFFF00",
    "#22C55E",
    "#84CC16",
    "#FACC15",
    "#34D399",
    "#A3E635",
    "#F472B6",
    "#38BDF8",
  ]

  const bursts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, b) => {
        const count = 18
        const color = palette[b % palette.length]
        return {
          id: b,
          left: 6 + Math.random() * 88,
          top: 8 + Math.random() * 64,
          delay: Math.random() * 3,
          repeatDelay: 1.2 + Math.random() * 2.2,
          color,
          flash: 24 + Math.random() * 20,
          particles: Array.from({ length: count }, (_, p) => {
            const angle = (p / count) * Math.PI * 2 + Math.random() * 0.25
            const dist = 70 + Math.random() * 90
            return {
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              // gravity: drift downward at the end
              yEnd: Math.sin(angle) * dist + 40 + Math.random() * 30,
              size: 4 + Math.random() * 5,
            }
          }),
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{ left: `${burst.left}%`, top: `${burst.top}%` }}
        >
          {/* center flash */}
          <motion.span
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: burst.flash,
              height: burst.flash,
              background: `radial-gradient(circle, ${burst.color} 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1.6, 0.3] }}
            transition={{
              duration: 0.9,
              delay: burst.delay,
              repeat: Infinity,
              repeatDelay: burst.repeatDelay + 0.5,
              ease: "easeOut",
            }}
          />
          {/* spark particles */}
          {burst.particles.map((pt, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                width: pt.size,
                height: pt.size,
                backgroundColor: burst.color,
                boxShadow: `0 0 6px ${burst.color}`,
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: [0, pt.x],
                y: [0, pt.yEnd],
                scale: [1, 1, 0.2],
              }}
              transition={{
                duration: 1.5,
                delay: burst.delay,
                repeat: Infinity,
                repeatDelay: burst.repeatDelay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Step 3 — "Our Customer" testimonial-style vertical marquee
// ----------------------------------------------------------------------------
function StepGallery() {
  const colA = customerPhotos.filter((_, i) => i % 2 === 0)
  const colB = customerPhotos.filter((_, i) => i % 2 === 1)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="font-script text-5xl text-gray-900 sm:text-6xl"
      >
        Our Customer
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="max-w-xl text-center text-base text-gray-500 sm:text-lg"
      >
        Terima kasih telah membantu perjalanan{" "}
        <span className="font-semibold text-[#15803D]">De&apos;Lima</span>. Setiap
        senyum kalian adalah langkah berarti bagi kami.
      </motion.p>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
        <PhotoMarquee items={colA} direction="up" speed={4} />
        <PhotoMarquee items={colB} direction="down" speed={4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-full bg-[#22C55E] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-500/30 transition hover:scale-105 hover:bg-[#16A34A]"
        >
          <Home className="h-5 w-5" />
          Kembali ke Beranda
        </Link>
      </motion.div>
    </motion.section>
  )
}

function PhotoMarquee({
  items,
  direction,
  speed,
}: {
  items: string[]
  direction: "up" | "down"
  speed: number
}) {
  const duplicated = [...items, ...items]
  const duration = items.length * speed

  return (
    <div className="relative h-[42vh] overflow-hidden sm:h-[52vh]">
      {/* gradient fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-gray-50 to-transparent" />

      <div
        className={direction === "up" ? "animate-marquee-up-always" : "animate-marquee-down-always"}
        style={{ animationDuration: `${duration}s` }}
      >
        {duplicated.map((src, i) => (
          <div key={i} className="p-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md">
              <Image
                src={src}
                alt="De'Lima customer"
                fill
                sizes="(max-width: 768px) 45vw, 320px"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
