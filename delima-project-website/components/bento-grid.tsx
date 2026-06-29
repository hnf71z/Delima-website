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

/* ━━ Desktop / Tablet pillar row ━━ */
function PilarItem({ pillar, isLast }: { pillar: typeof pillars[0]; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="flex gap-6 lg:gap-8 rounded-3xl p-5 lg:p-7 transition-all duration-500 hover:bg-gradient-to-br hover:from-lime-50 hover:to-white hover:shadow-xl hover:shadow-lime-200/40">
        {/* Letter + connecting spine */}
        <div className="flex flex-col items-center flex-shrink-0">
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.08 }}
            className="text-6xl lg:text-7xl font-black leading-none text-[#365314] transition-transform duration-500 group-hover:scale-110"
          >
            {pillar.letter}
          </motion.span>
          {!isLast && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="w-[2px] flex-1 mt-3 origin-top rounded-full bg-gradient-to-b from-[#84cc16] via-[#65a30d]/40 to-transparent"
            />
          )}
        </div>

        {/* Content */}
        <div className="pb-6 pt-1">
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
              <span className="green-shimmer relative z-10 leading-none px-1 block" data-text={pillar.title}>{pillar.title}</span>
            </h3>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="text-base leading-relaxed text-gray-600 max-w-xl"
          >
            {pillar.description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

/* ━━ Mobile pillar card — static (no animation) to avoid jank on mobile ━━ */
function MobilePilarItem({ pillar }: { pillar: typeof pillars[0] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-lime-100 bg-gradient-to-br from-white to-lime-50/40 p-6 shadow-lg shadow-lime-200/30">
      <div className="relative z-10">
        <h3 className="text-xl font-bold tracking-tight mb-3">
          <span className="green-shimmer relative z-10 leading-none block" data-text={pillar.title}>{pillar.title}</span>
        </h3>
        <p className="text-sm leading-relaxed text-gray-600">
          {pillar.description}
        </p>
      </div>
    </div>
  )
}

/* ━━ Main Section ━━ */
export function BentoGrid() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section id="formula" ref={sectionRef} className="relative overflow-hidden bg-white pt-0 pb-16 md:py-24">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#84cc16]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#65a30d]/[0.06] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">

        {/* ===== DESKTOP / TABLET ===== */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12">

          {/* Left — Sticky title pinned at top */}
          <div className="md:col-span-5 relative">
            <div className="sticky top-28 ml-auto w-fit md:mr-8 lg:mr-16">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-5 items-start"
              >
                <span className="font-mono text-[#65a30d] text-xs tracking-[0.3em] uppercase">
                  Filosofi Kami
                </span>
                <Highlighter action="underline" color="#65a30d" strokeWidth={3} animationDuration={1500} padding={5}>
                  <span className="green-shimmer text-4xl lg:text-[4.5rem] font-bold tracking-tight leading-none block px-1" data-text="De'Lima">De&apos;Lima</span>
                </Highlighter>
                <p className="max-w-xs text-base leading-relaxed text-gray-500">
                  Lima nilai yang menjadi rasa, layanan, dan janji di setiap sajian kami.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right — Scrolling pilar items */}
          <div className="md:col-span-7 flex justify-start pt-8 lg:pt-12">
            <div className="w-full max-w-2xl">
              <div className="flex flex-col gap-2">
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
            className="sticky top-20 z-20 -mx-6 mb-6 flex flex-col gap-3 items-start bg-white/85 px-6 pb-5 pt-0 backdrop-blur-md"
          >
            <span className="font-mono text-[#65a30d] text-[0.65rem] tracking-[0.3em] uppercase">
              Filosofi Kami
            </span>
            <Highlighter action="underline" color="#65a30d" strokeWidth={3} animationDuration={1500} padding={4}>
              <span className="green-shimmer text-[3rem] font-bold tracking-tight leading-none mt-1 block px-1" data-text="De'Lima">De&apos;Lima</span>
            </Highlighter>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Lima nilai yang menjadi rasa, layanan, dan janji di setiap sajian kami.
            </p>
          </motion.div>

          <div className="flex flex-col gap-5">
            {pillars.map((pillar) => (
              <MobilePilarItem key={pillar.letter} pillar={pillar} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
