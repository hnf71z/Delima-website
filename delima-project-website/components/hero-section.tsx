"use client"

import { motion, useScroll, useTransform, useSpring, AnimatePresence, useReducedMotion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { useLenis } from "lenis/react"
import { AnimatedShinyButton } from "./ui/animated-shiny-button"
import { useIsMobile } from "@/hooks/use-mobile"

const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      delay: 0.3,
    },
  },
}

const heroImages = ["/images/infusedwater.jpg", "/images/dimsum-image.jpeg"]

export function HeroSection() {
  const ref = useRef(null)
  const lenis = useLenis()
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion || isMobile
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion || isMobile) {
      return
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 3800)

    return () => clearInterval(interval)
  }, [isMobile, prefersReducedMotion])
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const y = useSpring(rawY, springConfig)

  const rawTextX1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const textX1 = useSpring(rawTextX1, springConfig)

  const rawTextX2 = useTransform(scrollYProgress, [0, 1], [0, 100])
  const textX2 = useSpring(rawTextX2, springConfig)

  const rawScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const scale = useSpring(rawScale, springConfig)

  const rawOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const opacity = useSpring(rawOpacity, springConfig)

  const scrollToFlavours = () => {
    const target = document.querySelector("#flavours") as HTMLElement | null
    if (!target) {
      return
    }

    if (lenis) {
      lenis.scrollTo("#flavours", { offset: -100 })
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white noise-overlay"
    >
      {/* Clean white background */}
      <div className="absolute inset-0 bg-white" />

      <motion.div
        className="absolute top-20 left-10 w-24 h-24 rounded-full bg-[#AFFF00]/20 blur-3xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }
        }
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-[#AFFF00]/10 blur-3xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
              x: [0, -40, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }
        }
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10 sm:pb-12">
        <div className="grid lg:grid-cols-2 gap-7 md:gap-8 items-center">
          {/* Text Content */}
          <motion.div style={shouldReduceMotion ? undefined : { opacity }} className="space-y-5">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 bg-white text-[#121212] border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-mono tracking-wider"
            >
              <motion.span
                className="w-2 h-2 bg-[#84cc16] rounded-full"
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              INOVASI KULINER F&B
            </motion.div>

            <div className="space-y-1 overflow-hidden">
              <motion.h1
                style={shouldReduceMotion ? undefined : { x: textX1 }}
                className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#121212] leading-[0.9]"
              >
                <motion.span
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="inline-block"
                >
                  DELIMA
                </motion.span>
              </motion.h1>
              <motion.h1
                style={shouldReduceMotion ? undefined : { x: textX2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[#121212] leading-[0.9] mt-2"
              >
                <motion.span
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="inline-block text-[#AFFF00]"
                >
                  TEMAN HARIMU
                </motion.span>
              </motion.h1>
              <motion.p
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="text-lg md:text-xl font-mono text-[#121212]/60 tracking-tight pt-2 max-w-md"
              >
                Dimsum lezat & Infus Water segar. Kuliner inovatif yang bikin ketagihan.
              </motion.p>
            </div>

            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex flex-wrap gap-3 pt-2 items-center"
            >
              <AnimatedShinyButton url="https://wa.me/6282243370144?text=Halo%20De%27Lima%2C%20apakah%20masih%20tersedia%3F" className="rounded-full">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Pesan
              </AnimatedShinyButton>
              <motion.button
                onClick={scrollToFlavours}
                className="border border-gray-300 text-[#121212] bg-white px-6 py-3 rounded-full font-bold text-sm tracking-wide relative overflow-hidden"
                whileHover={{ scale: 1.02, backgroundColor: "#ecfccb", borderColor: "#84cc16", color: "#121212" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Lihat Produk
              </motion.button>
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={5}
              className="flex flex-wrap gap-4 pt-2"
            >
              {["Dimsum Lezat", "Infus Water Segar", "Harga Bersahabat", "Rasa Inovatif"].map((benefit, i) => (
                <motion.div
                  key={benefit}
                  className="flex items-center gap-2 text-xs font-mono text-[#121212]/60"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className="w-1.5 h-1.5 bg-[#AFFF00] rounded-full" />
                  {benefit}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div style={shouldReduceMotion ? undefined : { y, scale }} className="relative flex justify-center mt-2 lg:mt-0">
            <motion.div variants={scaleInVariants} initial="hidden" animate="visible" className="relative">
              <motion.div
                className="absolute inset-0 bg-[#84cc16]/30 blur-[80px] rounded-full scale-75"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                      scale: [0.75, 0.85, 0.75],
                      opacity: [0.3, 0.5, 0.3],
                    }
                }
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />

              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                      y: [0, -15, 0],
                      rotate: [0, 2, 0],
                    }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                      duration: 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }
                }
                className="relative w-[240px] h-[360px] sm:w-[300px] sm:h-[450px] md:w-[350px] md:h-[525px]"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Image
                      src={heroImages[currentImageIndex]}
                      alt="De'Lima - Dimsum & Infus Water"
                      width={350}
                      height={525}
                      className="relative z-10 drop-shadow-2xl object-contain"
                      sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 350px"
                      priority={currentImageIndex === 0}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="w-5 h-8 border-2 border-[#121212]/30 rounded-full flex justify-center pt-1.5">
              <motion.div
                className="w-1 h-2 bg-[#121212]/30 rounded-full"
                animate={{ y: [0, 6, 0], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
