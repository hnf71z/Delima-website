"use client"

import { motion } from "framer-motion"

const pillars = [
  { title: "Delicious", description: "Rasa yang lezat." },
  { title: "Loyalty", description: "Membangun kesetiaan pelanggan." },
  { title: "Innovative", description: "Selalu ada menu baru." },
  { title: "Memorable", description: "Pengalaman yang berkesan." },
  { title: "Affordable", description: "Harga yang tetap bersahabat." },
]

export function BentoGrid() {
  return (
    <section id="formula" className="relative overflow-hidden py-10 md:py-14">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 text-center">
          <p className="inline-block font-mono text-[#65a30d] text-xs tracking-[0.32em] uppercase">
            PILAR KAMI
          </p>
          <div className="h-[2px] w-24 bg-[#65a30d] mx-auto mt-3 rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#65a30d]/25 bg-white/90 p-4 shadow-[0_15px_45px_-20px_rgba(101,163,13,0.45)] sm:p-5 md:p-7"
        >
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              <span className="green-shimmer" data-text="5 Pilar De'Lima">
                5 Pilar De&apos;Lima
              </span>
            </h2>
          </div>

          <div className="mt-6 grid grid-flow-col auto-cols-[82%] gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5 lg:gap-3">
            {pillars.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="group relative snap-start sm:snap-none rounded-2xl border border-[#65a30d]/20 bg-gradient-to-b from-white to-[#f7faef] px-4 py-4 shadow-[0_10px_24px_-18px_rgba(101,163,13,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#65a30d]/45"
              >
                <div className="absolute right-3 top-3 h-7 w-7 rounded-full bg-[#65a30d]/10 transition-colors group-hover:bg-[#65a30d]/20" />
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#65a30d]/35 text-[11px] font-bold text-[#4d7c0f]">
                  {index + 1}
                </span>
                <h3 className="mt-2 text-base font-extrabold tracking-tight text-[#1f2937]">{pillar.title}</h3>
                <p className="mt-1.5 text-sm leading-snug text-[#374151]">{pillar.description}</p>
                <div className="mt-3 h-[2px] w-10 rounded-full bg-[#65a30d]/65" />
              </motion.article>
            ))}
          </div>
        </motion.div>
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
