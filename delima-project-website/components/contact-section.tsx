"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Instagram, MapPin, MessageCircle } from "lucide-react"

const socialLinks = [
    {
        icon: Instagram,
        label: "Instagram",
        handle: "@delimafnb.id",
        href: "https://instagram.com/delimafnb.id",
        color: "#E4405F",
        bgGradient: "from-[#833AB4] via-[#E4405F] to-[#FCAF45]",
        description: "Follow kami untuk update menu terbaru",
    },
    {
        icon: () => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.11V9.01a6.29 6.29 0 00-.79-.05 6.33 6.33 0 00-6.33 6.33A6.33 6.33 0 009.49 21.6a6.33 6.33 0 006.33-6.33V8.87a8.18 8.18 0 004.77 1.52V6.94a4.84 4.84 0 01-1-.25z" />
            </svg>
        ),
        label: "TikTok",
        handle: "@delimafnb",
        href: "https://tiktok.com/@delimafnb",
        color: "#000000",
        bgGradient: "from-[#69C9D0] via-[#010101] to-[#EE1D52]",
        description: "Tonton video konten seru kami",
    },
    {
        icon: () => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        ),
        label: "WhatsApp",
        handle: "+62 822-4337-0144",
        href: "https://wa.me/6282243370144?text=Halo%20De%27Lima%2C%20apakah%20masih%20tersedia%3F",
        color: "#25D366",
        bgGradient: "from-[#25D366] to-[#128C7E]",
        description: "Chat langsung untuk pemesanan",
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1],
        },
    },
}

export function ContactSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <section id="creators" className="relative py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                    className="text-center mb-12"
                >
                    <motion.span
                        className="font-mono text-[#65a30d] text-xs tracking-widest inline-block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        HUBUNGI KAMI
                    </motion.span>
                    <h2 className="text-3xl md:text-5xl font-black text-[#121212] tracking-tighter mt-2 overflow-hidden">
                        <motion.span
                            className="inline-block"
                            initial={{ y: 100 }}
                            whileInView={{ y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1], delay: 0.2 }}
                        >
                            TEMUKAN{" "}
                        </motion.span>
                        <motion.span
                            className="text-[#65a30d] inline-block"
                            initial={{ y: 100 }}
                            whileInView={{ y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1], delay: 0.3 }}
                        >
                            DE&apos;LIMA
                        </motion.span>
                    </h2>
                    <motion.p
                        className="text-sm text-[#121212]/60 font-mono mt-3 max-w-xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        Ikuti media sosial kami atau langsung kunjungi lokasi De&apos;Lima.
                    </motion.p>
                </motion.div>

                {/* Social Media Cards */}
                <motion.div
                    ref={ref}
                    className="grid md:grid-cols-3 gap-4 mb-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {socialLinks.map((social) => {
                        const IconComponent = social.icon
                        return (
                            <motion.a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                variants={itemVariants}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { type: "spring", stiffness: 400, damping: 17 },
                                }}
                                className="group relative bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-[#65a30d]/30 cursor-pointer overflow-hidden transition-colors duration-300 shadow-sm"
                            >
                                {/* Hover gradient overlay */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${social.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                />

                                <div className="relative z-10">
                                    {/* Icon */}
                                    <motion.div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
                                        style={{ backgroundColor: `${social.color}20` }}
                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <div style={{ color: social.color }}>
                                            <IconComponent />
                                        </div>
                                    </motion.div>

                                    {/* Label */}
                                    <h3 className="text-lg font-black text-[#121212] tracking-tight mb-1">
                                        {social.label}
                                    </h3>

                                    {/* Handle */}
                                    <p className="font-mono text-sm mb-2 text-[#121212]/60 font-medium">
                                        {social.handle}
                                    </p>

                                    {/* Description */}
                                    <p className="text-[#121212]/50 font-mono text-xs leading-relaxed">
                                        {social.description}
                                    </p>

                                    {/* Arrow */}
                                    <motion.div
                                        className="flex items-center gap-1 mt-4 text-[#121212]/40 group-hover:text-[#121212]/80 font-mono text-xs transition-colors duration-300"
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        Kunjungi
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </motion.a>
                        )
                    })}
                </motion.div>

                {/* Google Maps + Location Info */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                    className="grid md:grid-cols-5 gap-4"
                >
                    {/* Map */}
                    <div className="md:col-span-3 relative rounded-2xl overflow-hidden border border-gray-200 group shadow-sm">
                        <div className="aspect-[16/9] md:aspect-auto md:h-[300px] relative">
                            <iframe
                                src="https://maps.google.com/maps?q=Jalan%20Perumda%20Tembalang%20Baru,%20Semarang&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: "saturate(0.8) brightness(1.05)" }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi De'Lima"
                                className="absolute inset-0"
                            />
                            {/* Map overlay on hover */}
                            <div className="absolute inset-0 bg-[#65a30d]/0 group-hover:bg-[#65a30d]/5 transition-colors duration-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Location info card */}
                    <motion.div
                        className="md:col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-between shadow-sm"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    className="w-12 h-12 rounded-xl bg-[#65a30d]/15 flex items-center justify-center"
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <MapPin className="w-6 h-6 text-[#65a30d]" />
                                </motion.div>
                                <div>
                                    <h3 className="text-lg font-black text-[#121212] tracking-tight">Lokasi Kami</h3>
                                    <p className="text-[#121212]/40 font-mono text-xs">Kunjungi langsung</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#65a30d]/10 rounded-xl p-4">
                                    <p className="text-[#121212]/80 text-sm font-medium mb-1">Alamat</p>
                                    <p className="text-[#121212]/50 font-mono text-xs leading-relaxed">
                                        Jl. Perumda Tembalang Baru, Semarang, Jawa Tengah
                                    </p>
                                </div>

                                <div className="bg-[#65a30d]/10 rounded-xl p-4">
                                    <p className="text-[#121212]/80 text-sm font-medium mb-1">Jam Operasional</p>
                                    <p className="text-[#121212]/50 font-mono text-xs leading-relaxed">
                                        Senin - Sabtu: 09.00 - 21.00 WIB
                                    </p>
                                </div>

                                <div className="bg-[#65a30d]/10 rounded-xl p-4">
                                    <p className="text-[#121212]/80 text-sm font-medium mb-1">Pemesanan</p>
                                    <p className="text-[#121212]/50 font-mono text-xs leading-relaxed">
                                        Via WhatsApp di 082243370144 atau kunjungi langsung
                                    </p>
                                </div>
                            </div>
                        </div>

                        <motion.a
                            href="https://wa.me/6282243370144?text=Halo%20De%27Lima%2C%20apakah%20masih%20tersedia%3F"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex items-center justify-center gap-2 bg-[#65a30d] text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide relative overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.5 }}
                            />
                            <MessageCircle className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Pesan Sekarang</span>
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* De'Lima Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-10 text-center max-w-2xl mx-auto"
                >
                    <p className="text-[#121212]/50 font-mono text-xs leading-relaxed">
                        <span className="text-[#121212] font-bold">De&apos;Lima</span> adalah brand UMKM di bidang F&B asal Semarang yang menghadirkan inovasi kuliner berupa{" "}
                        <span className="text-[#65a30d]">Dimsum</span> dan{" "}
                        <span className="text-[#65a30d]">Infus Water</span>.
                        Menggabungkan kualitas, inovasi, dan harga terjangkau untuk memberikan pengalaman kuliner terbaik bagi pelanggan.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
