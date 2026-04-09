"use client"

import { motion, useInView } from "framer-motion"
import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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

export function Footer() {
  const [isHovering, setIsHovering] = useState(false)
  const footerRef = useRef(null)
  const isInView = useInView(footerRef, { once: true, margin: "-100px" })

  const footerLinks = [
    {
      title: "Produk",
      links: [
        { label: "Dimsum", href: "#flavours" },
        { label: "Infus Water", href: "#flavours" },
        { label: "Coming Soon", href: "#flavours" },
        { label: "Paket Hemat", href: "#flavours" },
      ],
    },
    {
      title: "Menu",
      links: [
        { label: "Beranda", href: "#hero" },
        { label: "Produk", href: "#flavours" },
        { label: "Testimonial", href: "#testimonials" },
        { label: "Pilar", href: "#formula" },
      ],
    },
    {
      title: "Perusahaan",
      links: [
        { label: "Kontak", href: "#creators" },
      ],
    },
  ]

  return (
    <footer ref={footerRef} id="careers" className="relative bg-[#121212] pt-16 pb-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-white/10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {footerLinks.map((section) => (
            <motion.div key={section.title} variants={itemVariants}>
              <h4 className="font-bold text-white text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((item) => (
                  <li key={item.label}>
                    <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                      <Link
                        href={item.href}
                        className="text-white/60 hover:text-[#AFFF00] font-mono text-xs transition-colors inline-block"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/10 gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Image
              src="/delima-logo-white.webp"
              alt="De'Lima"
              width={170}
              height={50}
              className="h-10 w-auto"
            />
          </motion.div>

          <p className="text-white/40 font-mono text-xs">© 2026 De&apos;Lima. All rights reserved.</p>

          <motion.p
            className="text-white/30 font-mono text-xs cursor-pointer"
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            animate={
              isHovering
                ? {
                  rotate: [0, -5, 5, -5, 5, 0],
                  scale: [1, 1.1, 1],
                  color: "#AFFF00",
                }
                : {
                  rotate: 0,
                  scale: 1,
                  color: "rgba(255,255,255,0.3)",
                }
            }
            transition={{ duration: 0.5 }}
          >
            F & B
          </motion.p>
        </motion.div>
      </div >

      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[15rem] md:text-[30rem] font-black text-white/[0.02] pointer-events-none select-none leading-none"
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        De&apos;Lima
      </motion.div>
    </footer >
  )
}
