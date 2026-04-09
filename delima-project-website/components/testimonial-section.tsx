"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { Star } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

const testimonials = [
    {
        name: "Rina Sari",
        role: "Mahasiswa",
        avatar: "RS",
        rating: 5,
        review: "Dimsum nya enak banget! Rasanya autentik dan harganya sangat terjangkau untuk mahasiswa seperti saya. Pasti repeat order!",
    },
    {
        name: "Budi Santoso",
        role: "Karyawan Swasta",
        avatar: "BS",
        rating: 5,
        review: "Infus Water nya segar banget, cocok buat teman kerja di kantor. Rasa buahnya terasa alami, bukan artificial.",
    },
    {
        name: "Dewi Anggraini",
        role: "Ibu Rumah Tangga",
        avatar: "DA",
        rating: 5,
        review: "Anak-anak suka banget sama dimsum nya! Jadi cemilan favorit keluarga. Kualitasnya terjaga dan rasanya konsisten.",
    },
    {
        name: "Ahmad Fauzi",
        role: "Pengusaha",
        avatar: "AF",
        rating: 4,
        review: "Sudah jadi langganan De'Lima. Pelayanannya ramah dan pengiriman cepat. Dimsum dan Infus Water nya top!",
    },
    {
        name: "Siti Nurhaliza",
        role: "Content Creator",
        avatar: "SN",
        rating: 5,
        review: "Pernah review De'Lima di TikTok dan followers ku langsung penasaran. Memang seenak itu sih, highly recommended!",
    },
    {
        name: "Rizky Pratama",
        role: "Atlet",
        avatar: "RP",
        rating: 5,
        review: "Infus Water De'Lima jadi minuman andalan setelah latihan. Segar dan menyehatkan tanpa bahan kimia berlebihan.",
    },
    {
        name: "Kartika Putri",
        role: "Dosen",
        avatar: "KP",
        rating: 4,
        review: "Sering pesan dimsum De'Lima buat acara kampus. Mahasiswa dan kolega selalu suka. Porsinya pas, rasanya mantap!",
    },
    {
        name: "Hendra Wijaya",
        role: "Freelancer",
        avatar: "HW",
        rating: 5,
        review: "Kalau lagi deadline, Infus Water De'Lima bikin semangat lagi. Dimsum nya juga jadi teman ngemil yang sempurna.",
    },
]

const accentColors = ["#AFFF00", "#84cc16", "#22c55e", "#10b981", "#AFFF00", "#84cc16", "#22c55e", "#10b981"]

function TestimonialCard({ testimonial, index }: { testimonial: (typeof testimonials)[0]; index: number }) {
    const accent = accentColors[index % accentColors.length]

    return (
        <div className="p-4 w-full">
            <motion.div
                className="bg-gray-50 rounded-2xl p-5 border border-gray-200 hover:border-[#65a30d]/40 transition-all duration-300 cursor-default group shadow-sm"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                {/* Header: Avatar + Name + Role */}
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                        style={{ backgroundColor: accent }}
                    >
                        {testimonial.avatar}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[#121212] font-bold text-sm truncate">{testimonial.name}</h4>
                        <p className="text-[#121212]/50 font-mono text-xs truncate">{testimonial.role}</p>
                    </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className="w-3.5 h-3.5"
                            fill={i < testimonial.rating ? accent : "transparent"}
                            stroke={i < testimonial.rating ? accent : "rgba(255,255,255,0.2)"}
                        />
                    ))}
                </div>

                {/* Review text */}
                <p className="text-[#121212]/70 text-sm leading-relaxed font-mono">
                    &ldquo;{testimonial.review}&rdquo;
                </p>
            </motion.div>
        </div>
    )
}

function VerticalMarquee({ items, direction = "up", speed = 25 }: { items: (typeof testimonials); direction?: "up" | "down"; speed?: number }) {
    const isMobile = useIsMobile()
    const shouldReduceMotion = useReducedMotion() || isMobile
    const duplicated = [...items, ...items]
    const animationDuration = items.length * speed

    if (shouldReduceMotion) {
        return (
            <div className="relative max-h-[460px] overflow-y-auto pr-1">
                {items.map((testimonial, index) => (
                    <motion.div
                        key={`${testimonial.name}-${index}`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.24, delay: Math.min(index * 0.04, 0.2) }}
                    >
                        <TestimonialCard testimonial={testimonial} index={index} />
                    </motion.div>
                ))}
            </div>
        )
    }

    return (
        <div className="relative h-[460px] md:h-[550px] overflow-hidden">
            {/* Top fade */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

            <div
                className={`flex flex-col ${direction === "up" ? "animate-marquee-up" : "animate-marquee-down"}`}
                style={{
                    animationDuration: `${animationDuration}s`,
                }}
            >
                {duplicated.map((testimonial, index) => (
                    <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} index={index} />
                ))}
            </div>
        </div>
    )
}

export function TestimonialSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const firstColumn = testimonials.filter((_, i) => i % 2 === 0)
    const secondColumn = testimonials.filter((_, i) => i % 2 !== 0)

    return (
        <section id="testimonials" className="relative py-16 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                    className="text-center mb-10"
                >
                    <motion.span
                        className="inline-block font-mono text-[#65a30d] text-[10px] tracking-[0.3em] uppercase"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 0.1 }}
                    >
                        TESTIMONI
                    </motion.span>

                    <div className="overflow-hidden mt-2">
                        <motion.h2
                            className="text-3xl md:text-4xl font-black text-[#121212] tracking-tight"
                            initial={{ y: 60 }}
                            animate={isInView ? { y: 0 } : { y: 60 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1], delay: 0.15 }}
                        >
                            Apa Kata <span className="text-[#65a30d]">Mereka?</span>
                        </motion.h2>
                    </div>

                    <motion.div
                        className="h-[2px] w-12 bg-[#65a30d] mx-auto mt-3 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                    />
                </motion.div>

                {/* Responsive Marquee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile: 1 column with all items */}
                    <div className="block md:hidden">
                        <VerticalMarquee items={testimonials} direction="up" speed={4} />
                    </div>
                    {/* Desktop: 2 columns */}
                    <div className="hidden md:block">
                        <VerticalMarquee items={firstColumn} direction="up" speed={6} />
                    </div>
                    <div className="hidden md:block">
                        <VerticalMarquee items={secondColumn} direction="down" speed={6} />
                    </div>
                </div>
            </div>
        </section>
    )
}
