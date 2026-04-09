import dynamic from "next/dynamic"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"

interface SectionPlaceholderProps {
  id?: string
  minHeightClass: string
  className?: string
}

function SectionPlaceholder({ id, minHeightClass, className = "" }: SectionPlaceholderProps) {
  return <section id={id} aria-hidden="true" className={`${minHeightClass} ${className}`} />
}

const FlavorCarousel = dynamic(() => import("@/components/flavor-carousel").then((mod) => mod.FlavorCarousel), {
  loading: () => <SectionPlaceholder id="flavours" minHeightClass="min-h-[42vh] md:min-h-[24rem]" />,
})

const ActivationsSection = dynamic(() => import("@/components/activations-section").then((mod) => mod.ActivationsSection), {
  loading: () => <SectionPlaceholder minHeightClass="min-h-[34vh] md:min-h-[20rem]" />,
})

const BentoGrid = dynamic(() => import("@/components/bento-grid").then((mod) => mod.BentoGrid), {
  loading: () => <SectionPlaceholder id="formula" minHeightClass="min-h-[40vh] md:min-h-[22rem]" />,
})

const TestimonialSection = dynamic(() => import("@/components/testimonial-section").then((mod) => mod.TestimonialSection), {
  loading: () => <SectionPlaceholder id="testimonials" minHeightClass="min-h-[44vh] md:min-h-[24rem]" className="bg-white" />,
})

const ContactSection = dynamic(() => import("@/components/contact-section").then((mod) => mod.ContactSection), {
  loading: () => <SectionPlaceholder id="creators" minHeightClass="min-h-[36vh] md:min-h-[20rem]" className="bg-white" />,
})

const Footer = dynamic(() => import("@/components/footer").then((mod) => mod.Footer), {
  loading: () => <SectionPlaceholder id="careers" minHeightClass="min-h-[24vh] md:min-h-[12rem]" className="bg-[#121212]" />,
})

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <div className="bg-mesh-gradient">
        <FlavorCarousel />
        <ActivationsSection />
        <BentoGrid />
      </div>
      <div className="bg-white">
        <TestimonialSection />
        <ContactSection />
      </div>
      <Footer />
    </main>
  )
}
