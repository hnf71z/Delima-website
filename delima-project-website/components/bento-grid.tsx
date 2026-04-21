"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Highlighter } from "@/components/ui/highlighter"

const pillars = [
  {
    letter: "D",
    title: "Delicious",
    description: "Mempunyai cita rasa yang lezat dan menggugah selera. Tidak sekadar menyajikan makanan, tapi menghadirkan pengalaman rasa yang membuat setiap pelanggan ingin kembali lagi.",
  },
  {
    letter: "L",
    title: "Loyalty",
    description: "Membangun kesetiaan pelanggan dengan pelayanan terbaik. Kami menjaga hubungan jangka panjang melalui konsistensi rasa dan layanan yang selalu prima.",
  },
  {
    letter: "I",
    title: "Innovative",
    description: "Berusaha selalu menciptakan sesuatu yang baru dan menarik. Dari menu kreatif hingga pengalaman pelanggan yang unik, inovasi menjadi DNA dari setiap langkah kami.",
  },
  {
    letter: "M",
    title: "Memorable",
    description: "Berusaha menyajikan pengalaman kuliner yang selalu diingat oleh konsumen. Setiap kunjungan adalah momen spesial yang kami rancang dengan penuh perhatian.",
  },
  {
    letter: "A",
    title: "Affordable",
    description: "Harga yang tetap bersahabat untuk semua kalangan. Kualitas premium tidak harus mahal, sehingga semua orang bisa menikmati hidangan terbaik dari De'Lima.",
  },
]

function PilarItem({ pillar, isLast }: { pillar: typeof pillars[0]; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" })

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col items-start text-left w-full py-12 lg:py-16 ${!isLast ? 'border-b border-gray-200' : ''}`}
    >
      <motion.div
        className="flex items-center gap-6 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-5xl lg:text-[4.5rem] font-medium leading-none text-[#65a30d]">
          {pillar.letter}
        </span>
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
          <span className="green-shimmer relative z-10 leading-none px-1 block" data-text={pillar.title}>{pillar.title}</span>
        </h3>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        className="text-base leading-relaxed text-gray-600 max-w-2xl"
      >
        {pillar.description}
      </motion.p>
    </motion.div>
  )
}

function MobilePilarItem({ pillar, isLast }: { pillar: typeof pillars[0]; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-5% 0px -5% 0px" })

  return (
    <div ref={ref} className={`flex flex-col items-start text-left py-10 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-medium text-[#65a30d] leading-none"
        >
          {pillar.letter}
        </motion.span>
        <motion.h3
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          <span className="green-shimmer relative z-10 leading-none px-1 block" data-text={pillar.title}>{pillar.title}</span>
        </motion.h3>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="text-sm leading-relaxed text-gray-600 max-w-full"
      >
        {pillar.description}
      </motion.p>
    </div>
  )
}

/* ━━ Main Section ━━ */
export function BentoGrid() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section id="formula" ref={sectionRef} className="relative bg-white py-16 md:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ===== DESKTOP / TABLET ===== */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left — Sticky title pinned at top */}
          <div className="md:col-span-5 relative">
            <div className="sticky top-40 ml-auto w-fit md:mr-8 lg:mr-16">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex flex-col gap-3 items-start">
                  <Highlighter action="underline" color="#65a30d" strokeWidth={3} animationDuration={1500} padding={10}>
                    <span className="green-shimmer text-4xl lg:text-[4.5rem] font-bold tracking-tight leading-none block px-1 pb-2" data-text="De'Lima">De&apos;Lima</span>
                  </Highlighter>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right — Scrolling pilar items */}
          <div className="md:col-span-7 flex justify-start pt-20 lg:pt-24">
            <div className="w-full max-w-2xl">
              <div className="flex flex-col">
                {pillars.map((pillar, index) => (
                  <PilarItem key={pillar.letter} pillar={pillar} isLast={index === pillars.length - 1} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== MOBILE ===== */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-col gap-3 items-start">
              <Highlighter action="underline" color="#65a30d" strokeWidth={3} animationDuration={1500} padding={10}>
                <span className="green-shimmer text-[4rem] font-bold tracking-tight leading-none mt-1 block px-1 pb-2" data-text="De'Lima">De&apos;Lima</span>
              </Highlighter>
            </div>
          </motion.div>

          <div className="flex flex-col">
            {pillars.map((pillar, index) => (
              <MobilePilarItem key={pillar.letter} pillar={pillar} isLast={index === pillars.length - 1} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .green-shimmer {
          position: relative;
          display: inline-block;
          color: #65a30d;
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
