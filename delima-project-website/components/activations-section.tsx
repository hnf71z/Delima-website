"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { Sparkles, HandshakeIcon, Target, Heart } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

const activations = [
  {
    icon: HandshakeIcon,
    title: "Suplier Terpercaya",
    description: "Menggandeng suplier dimsum terpercaya untuk kualitas terbaik.",
    cta: "Selengkapnya",
  },
  {
    icon: Target,
    title: "Fokus Rasa & Harga",
    description: "Mengutamakan cita rasa terbaik dengan harga yang bersahabat.",
    cta: "Selengkapnya",
  },
  {
    icon: Heart,
    title: "Kesetiaan Pelanggan",
    description: "De'Lima menjaga kesetiaan kepada setiap pelanggan.",
    cta: "Selengkapnya",
  },
  {
    icon: Sparkles,
    title: "Inovasi Rasa",
    description: "Terus berinovasi menciptakan rasa baru yang mengesankan.",
    cta: "Selengkapnya",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
}

function ShimmerGreenText({ children }: { children: string }) {
  const isMobile = useIsMobile()
  const shouldReduceMotion = useReducedMotion() || isMobile

  return (
    <motion.span
      className="inline-block bg-[length:220%_100%] bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(110deg, #365314 15%, #65a30d 42%, #a3e635 50%, #65a30d 58%, #365314 85%)",
      }}
      animate={shouldReduceMotion ? undefined : { backgroundPosition: ["200% 0", "-120% 0"] }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    >
      {children}
    </motion.span>
  )
}

function ActivationCard({ activation }: { activation: typeof activations[0] }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -12,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 17 },
      }}
      className="group bg-white rounded-[2rem] p-5 sm:p-7 lg:p-10 border border-gray-100 shadow-xl shadow-gray-200/30 cursor-pointer relative overflow-hidden flex flex-col min-h-[260px] sm:min-h-[300px] lg:h-[350px]"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#84cc16]/0 via-transparent to-[#84cc16]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-auto group-hover:bg-[#84cc16] transition-colors duration-500 shadow-sm"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <activation.icon className="w-8 h-8 text-[#121212]/40 group-hover:text-white transition-colors duration-500" />
        </motion.div>

        <div className="mt-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mb-3">
            <ShimmerGreenText>{activation.title}</ShimmerGreenText>
          </h3>
          <p className="text-[#121212]/60 font-mono text-sm leading-relaxed mb-6 max-w-sm">
            {activation.description}
          </p>

          <motion.div
            className="flex items-center gap-2 text-[#84cc16] font-bold text-xs tracking-widest uppercase transition-colors duration-300"
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {activation.cta}
            <motion.svg
              className="w-4 h-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </motion.svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function ActivationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="distributors" className="relative py-24 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            className="font-mono text-[#65a30d] text-xs tracking-[0.3em] uppercase inline-block mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            CORE VALUES
          </motion.span>
          <div className="h-[2px] w-16 bg-[#65a30d] mt-6 mx-auto" />
        </motion.div>

        <motion.div
          ref={ref}
          className="grid md:grid-cols-2 gap-6 lg:gap-12 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left Column (items 0, 2) */}
          <div className="flex flex-col gap-6 lg:gap-12 md:mt-24">
            {[0, 2].map((i) => (
              <ActivationCard key={activations[i].title} activation={activations[i]} />
            ))}
          </div>

          {/* Right Column (items 1, 3) */}
          <div className="flex flex-col gap-6 lg:gap-12">
            {[1, 3].map((i) => (
              <ActivationCard key={activations[i].title} activation={activations[i]} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
