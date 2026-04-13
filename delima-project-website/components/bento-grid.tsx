"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { UtensilsCrossed, Heart, Lightbulb, Star, Wallet } from "lucide-react"

const pillars = [
  { 
    title: "Delicious", 
    description: "Rasa yang lezat dan menggugah selera.",
    icon: UtensilsCrossed,
  },
  { 
    title: "Loyalty", 
    description: "Membangun kesetiaan pelanggan dengan pelayanan terbaik.",
    icon: Heart,
  },
  { 
    title: "Innovative", 
    description: "Selalu menghadirkan menu baru yang kreatif.",
    icon: Lightbulb,
  },
  { 
    title: "Memorable", 
    description: "Pengalaman kuliner yang tak terlupakan.",
    icon: Star,
  },
  { 
    title: "Affordable", 
    description: "Harga bersahabat untuk semua kalangan.",
    icon: Wallet,
  },
]

export function BentoGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="formula" className="relative overflow-hidden py-16 md:py-20 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f7faef]/40 to-transparent pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="inline-block font-mono text-[#65a30d] text-xs tracking-[0.32em] uppercase mb-3">
            PILAR KAMI
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#84cc16] to-[#65a30d] mx-auto rounded-full" />
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            <span className="green-shimmer" data-text="5 Pilar De'Lima">
              5 Pilar De&apos;Lima
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-[#374151] max-w-2xl mx-auto leading-relaxed">
            Fondasi yang menjadikan De&apos;Lima pilihan utama untuk pengalaman kuliner terbaik
          </p>
        </motion.div>

        {/* Desktop Layout - 5 columns */}
        <div className="hidden lg:grid grid-cols-5 gap-5">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="group relative"
              >
                <div className="relative h-full rounded-3xl border-2 border-[#65a30d]/20 bg-white p-6 shadow-lg transition-all duration-300 hover:border-[#65a30d]/50 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                  {/* Hover background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#84cc16]/10 to-[#65a30d]/5 opacity-0 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : ''}`} />
                  
                  <div className="relative z-10">
                    {/* Icon & Number */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-[#84cc16]/20 to-[#65a30d]/10 transition-all duration-300 group-hover:from-[#84cc16]/30 group-hover:to-[#65a30d]/20">
                        <Icon className="w-6 h-6 text-[#4d7c0f] transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#65a30d]/15 text-xs font-bold text-[#4d7c0f] border border-[#65a30d]/25">
                        {index + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold tracking-tight text-[#1f2937] mb-2 group-hover:text-[#4d7c0f] transition-colors">
                      {pillar.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-[#6b7280]">
                      {pillar.description}
                    </p>

                    {/* Bottom accent line */}
                    <div className="mt-5 h-1 w-10 rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d] group-hover:w-16 transition-all duration-300" />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Tablet Layout - 3 columns then 2 */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-4">
          {pillars.slice(0, 3).map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full rounded-2xl border-2 border-[#65a30d]/20 bg-white p-5 shadow-md transition-all duration-300 hover:border-[#65a30d]/50 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#84cc16]/20 to-[#65a30d]/10">
                      <Icon className="w-5 h-5 text-[#4d7c0f]" />
                    </div>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#65a30d]/15 text-[10px] font-bold text-[#4d7c0f] border border-[#65a30d]/25">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1f2937] mb-1.5">{pillar.title}</h3>
                  <p className="text-xs leading-relaxed text-[#6b7280]">{pillar.description}</p>
                  <div className="mt-4 h-0.5 w-8 rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d]" />
                </div>
              </motion.article>
            )
          })}
        </div>
        
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 mt-4">
          {pillars.slice(3).map((pillar, index) => {
            const Icon = pillar.icon
            const actualIndex = index + 3
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: actualIndex * 0.1 }}
                className="group"
              >
                <div className="relative h-full rounded-2xl border-2 border-[#65a30d]/20 bg-white p-5 shadow-md transition-all duration-300 hover:border-[#65a30d]/50 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#84cc16]/20 to-[#65a30d]/10">
                      <Icon className="w-5 h-5 text-[#4d7c0f]" />
                    </div>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#65a30d]/15 text-[10px] font-bold text-[#4d7c0f] border border-[#65a30d]/25">
                      {actualIndex + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1f2937] mb-1.5">{pillar.title}</h3>
                  <p className="text-xs leading-relaxed text-[#6b7280]">{pillar.description}</p>
                  <div className="mt-4 h-0.5 w-8 rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d]" />
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Mobile Layout - 2 columns, compact */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group"
              >
                <div className="relative h-full rounded-2xl border-2 border-[#65a30d]/20 bg-white p-4 shadow-sm transition-all active:scale-95">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#84cc16]/20 to-[#65a30d]/10">
                      <Icon className="w-4 h-4 text-[#4d7c0f]" />
                    </div>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#65a30d]/15 text-[9px] font-bold text-[#4d7c0f] border border-[#65a30d]/25 flex-shrink-0">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xs font-extrabold text-[#1f2937] mb-1 leading-tight">{pillar.title}</h3>
                  <p className="text-[11px] leading-relaxed text-[#6b7280] line-clamp-2">{pillar.description}</p>
                  <div className="mt-2.5 h-0.5 w-6 rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d]" />
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .green-shimmer {
          position: relative;
          display: inline-block;
          color: #4d7c0f;
        }

        .green-shimmer::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          color: transparent;
          background: linear-gradient(
            110deg,
            rgba(132, 204, 22, 0) 34%,
            rgba(217, 249, 157, 0.95) 49%,
            rgba(132, 204, 22, 0) 64%
          );
          background-size: 220% 100%;
          background-position: 180% 0;
          -webkit-background-clip: text;
          background-clip: text;
          animation: greenShimmer 2.8s linear infinite;
        }

        @keyframes greenShimmer {
          from {
            background-position: 180% 0;
          }
          to {
            background-position: -40% 0;
          }
        }

        @media (max-width: 767px) {
          .green-shimmer::after {
            animation: none;
            background-position: 50% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .green-shimmer::after {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
