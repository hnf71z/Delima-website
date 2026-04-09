"use client"

import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface LenisProviderProps {
  children: ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  )
}
