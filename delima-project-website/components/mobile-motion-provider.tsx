"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileMotionProviderProps {
  children: ReactNode
}

export function MobileMotionProvider({ children }: MobileMotionProviderProps) {
  const isMobile = useIsMobile()

  return <MotionConfig reducedMotion={isMobile ? "always" : "user"}>{children}</MotionConfig>
}
