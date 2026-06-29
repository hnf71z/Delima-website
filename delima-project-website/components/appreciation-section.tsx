"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { Volume2, VolumeX } from "lucide-react"

const customerPhotos = Array.from({ length: 17 }, (_, i) => `/photo${i + 1}.jpeg`)

export function AppreciationSection() {
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsMuted(true))
    }
  }, [])

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      if (isMuted) audioRef.current.play()
    }
  }

  return (
    <div className="bg-[#F5F1E8]">
      <audio ref={audioRef} src="/thanks.mp3" loop />

      <motion.button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-[#8B7355] text-white flex items-center justify-center hover:bg-[#6B5335] transition-colors shadow-lg"
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </motion.button>

      {/* Chapter 1: Opening */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <motion.div
          className="max-w-4xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mb-8"
          >
            <span className="text-[#8B7355] font-poppins text-sm tracking-[0.3em] uppercase">Chapter 1</span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl font-black text-[#3D2817] mb-8 leading-tight font-outfit"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            Sebuah Perjalanan<br />Penuh Makna
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-[#8B7355] leading-relaxed font-poppins max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 1 }}
          >
            Di balik setiap produk Delima, ada cerita tentang kepercayaan, kebahagiaan, dan momen berharga bersama pelanggan kami
          </motion.p>
        </motion.div>
      </section>

      {/* Chapter 2: The Journey */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#F5F1E8] to-[#E8DCC8]">
        <StorySection
          chapter="Chapter 2"
          title="Perjalanan Kami"
          subtitle="Dari mimpi kecil hingga menjadi bagian dari kehidupan Anda"
        >
          <div className="grid md:grid-cols-2 gap-12 mt-16">
            <StatCard number="38" label="Pelanggan Setia" delay={0.3} />
            <StatCard number="63" label="Produk Terjual" delay={0.5} />
          </div>
        </StorySection>
      </section>

      {/* Chapter 3: The People */}
      <section className="py-20 px-6 bg-[#E8DCC8]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-20">
            <motion.span
              className="text-[#8B7355] font-poppins text-sm tracking-[0.3em] uppercase block mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Chapter 3
            </motion.span>
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[#3D2817] font-outfit"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Wajah-Wajah<br />Kebahagiaan
            </motion.h2>
          </div>

          <div className="space-y-24">
            {customerPhotos.map((photo, i) => (
              <PhotoStory key={i} photo={photo} index={i} total={customerPhotos.length} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Chapter 4: Gratitude */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#E8DCC8] to-[#F5F1E8]">
        <motion.div
          className="max-w-4xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <motion.span
            className="text-[#8B7355] font-poppins text-sm tracking-[0.3em] uppercase block mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Chapter 4
          </motion.span>

          <motion.h1
            className="text-6xl sm:text-7xl md:text-9xl font-black text-[#3D2817] mb-12 leading-tight font-outfit"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Terima Kasih
          </motion.h1>

          <motion.p
            className="text-2xl sm:text-3xl text-[#8B7355] leading-relaxed font-poppins"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Untuk setiap senyuman, setiap kepercayaan,<br />dan setiap momen yang Anda bagikan bersama kami
          </motion.p>

          <motion.div
            className="mt-16 p-8 bg-white/50 backdrop-blur-sm rounded-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-lg text-[#3D2817] font-poppins italic">
              "Setiap pelanggan adalah bagian dari keluarga Delima.<br />Terima kasih telah mempercayai kami."
            </p>
            <div className="mt-4 text-[#8B7355] font-poppins font-semibold">- Tim Delima</div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

function StorySection({ chapter, title, subtitle, children }: { chapter: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="max-w-5xl"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1 }}
    >
      <motion.span
        className="text-[#8B7355] font-poppins text-sm tracking-[0.3em] uppercase block mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {chapter}
      </motion.span>

      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl font-black text-[#3D2817] mb-6 font-outfit"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="text-xl text-[#8B7355] font-poppins"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        {subtitle}
      </motion.p>

      {children}
    </motion.div>
  )
}

function StatCard({ number, label, delay }: { number: string; label: string; delay: number }) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-12 shadow-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#A8D5A5]/20 rounded-full -mr-16 -mt-16" />
      <div className="relative">
        <div className="text-7xl sm:text-8xl font-black text-[#3D2817] mb-4 font-outfit">{number}</div>
        <div className="text-xl text-[#8B7355] font-poppins font-semibold">{label}</div>
      </div>
    </motion.div>
  )
}

function PhotoStory({ photo, index, total }: { photo: string; index: number; total: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="w-full md:w-1/2 relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <Image src={photo} alt={`Customer story ${index + 1}`} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D2817]/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="text-sm font-poppins tracking-wider opacity-80">Story {index + 1} of {total}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="w-full md:w-1/2 text-center md:text-left"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-[#8B7355] font-poppins text-sm tracking-wider mb-3">Pelanggan Setia #{index + 1}</div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#3D2817] font-outfit mb-4">
            Momen Kebahagiaan
          </h3>
          <p className="text-[#8B7355] font-poppins leading-relaxed">
            Setiap senyuman adalah cerita. Setiap pembelian adalah kepercayaan. Terima kasih telah menjadi bagian dari perjalanan Delima.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
