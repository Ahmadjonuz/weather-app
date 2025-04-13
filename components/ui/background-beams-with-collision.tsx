"use client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import React, { useRef, useState, useEffect } from "react"

// Define a shadow glow style for the droplets based on theme
const shadowGlowStyle = {
  light: {
    boxShadow: "0 0 8px 2px rgba(37, 99, 235, 0.8)"
  },
  dark: {
    boxShadow: "0 0 8px 2px rgba(219, 234, 254, 0.8)"
  }
};

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const [beams, setBeams] = useState<Array<{
    initialX: number
    translateX: number
    duration: number
    repeatDelay: number
    delay: number
    className?: string
  }>>([])
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Use fewer beams on mobile for better performance
    const beamCount = isMobile ? 8 : 20
    const spacing = isMobile ? 40 : 80
    
    setBeams(
      Array.from({ length: beamCount }, (_, i) => ({
        initialX: i * spacing + 10,
        translateX: i * spacing + 10,
        duration: Math.random() * 4 + 4,
        repeatDelay: Math.random() * 3 + 2,
        delay: Math.random() * 2,
        className: ["h-4", "h-6", "h-8", "h-10", "h-12", "h-16"][Math.floor(Math.random() * 6)],
      }))
    )
  }, [isMobile])

  // Add CSS variables for theme-based styling
  const containerStyle = {
    '--beam-from-color-light': 'var(--blue-600)',
    '--beam-via-color-light': 'var(--blue-500)',
    '--beam-from-color-dark': 'var(--blue-300)',
    '--beam-via-color-dark': 'var(--blue-100)',
    '--glow-color-light': 'rgba(37, 99, 235, 0.8)',
    '--glow-color-dark': 'rgba(219, 234, 254, 0.8)',
    '--glow-shadow-light': '0 0 8px 2px var(--glow-color-light)',
    '--glow-shadow-dark': '0 0 8px 2px var(--glow-color-dark)',
  } as React.CSSProperties;

  return (
    <div
      ref={parentRef}
      style={containerStyle}
      className={cn(
        "h-96 md:h-[40rem] bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900 relative flex items-center w-full justify-center overflow-hidden [--glow-shadow:var(--glow-shadow-light)] dark:[--glow-shadow:var(--glow-shadow-dark)]",
        className
      )}
    >
      {beams.map((beam, i) => (
        <CollisionMechanism
          key={`beam-${i}`}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
          isMobile={isMobile}
        />
      ))}
      {children}
      <div
        ref={containerRef}
        className="absolute bottom-0 bg-blue-100 dark:bg-blue-800 w-full inset-x-0 pointer-events-none"
        style={{
          boxShadow:
            "0 0 24px rgba(37, 99, 235, 0.1), 0 1px 1px rgba(37, 99, 235, 0.05), 0 0 0 1px rgba(37, 99, 235, 0.1), 0 0 4px rgba(37, 99, 235, 0.1), 0 16px 68px rgba(37, 99, 235, 0.1), 0 1px 0 rgba(255, 255, 255, 0.2) inset",
        }}
      />
    </div>
  )
}

const CollisionMechanism = React.forwardRef<
  HTMLDivElement,
  {
    containerRef: React.RefObject<HTMLDivElement | null>
    parentRef: React.RefObject<HTMLDivElement | null>
    isMobile?: boolean
    beamOptions?: {
      initialX?: number
      translateX?: number
      initialY?: number
      translateY?: number
      rotate?: number
      className?: string
      duration?: number
      delay?: number
      repeatDelay?: number
    }
  }
>(({ parentRef, containerRef, beamOptions = {}, isMobile = false }, ref) => {
  const beamRef = useRef<HTMLDivElement>(null)
  const [collision, setCollision] = useState<{
    detected: boolean
    coordinates: { x: number; y: number } | null
  }>({
    detected: false,
    coordinates: null,
  })
  const [beamKey, setBeamKey] = useState(0)
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false)

  useEffect(() => {
    const checkCollision = () => {
      if (beamRef.current && containerRef.current && parentRef.current && !cycleCollisionDetected) {
        const beamRect = beamRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const parentRect = parentRef.current.getBoundingClientRect()

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2
          const relativeY = beamRect.bottom - parentRect.top

          setCollision({
            detected: true,
            coordinates: { x: relativeX, y: relativeY },
          })
          setCycleCollisionDetected(true)
        }
      }
    }

    // Check less frequently on mobile for better performance
    const interval = isMobile ? 100 : 50
    const animationInterval = setInterval(checkCollision, interval)

    return () => clearInterval(animationInterval)
  }, [cycleCollisionDetected, containerRef, isMobile])

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null })
        setCycleCollisionDetected(false)
      }, 2000)

      setTimeout(() => {
        setBeamKey((prevKey) => prevKey + 1)
      }, 2000)
    }
  }, [collision])

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={{
          translateY: beamOptions.initialY || "-200px",
          translateX: beamOptions.initialX || "0px",
          rotate: beamOptions.rotate || 0,
        }}
        variants={{
          animate: {
            translateY: beamOptions.translateY || "1800px",
            translateX: beamOptions.translateX || "0px",
            rotate: beamOptions.rotate || 0,
          },
        }}
        transition={{
          duration: isMobile ? (beamOptions.duration || 8) * 1.5 : beamOptions.duration || 8, // Slower on mobile for better appearance
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay || 0,
          repeatDelay: beamOptions.repeatDelay || 0,
        }}
        className={cn(
          "absolute left-0 top-20 m-auto w-px rounded-full bg-gradient-to-t from-blue-700 via-blue-600 to-transparent dark:from-blue-200 dark:via-blue-50 dark:to-transparent",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && !isMobile && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
})

CollisionMechanism.displayName = "CollisionMechanism"

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 15 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }))

  return (
    <div {...props} className={cn("absolute z-50 h-3 w-3", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-3 w-12 rounded-full bg-gradient-to-r from-transparent via-blue-700 dark:via-blue-50 to-transparent blur-sm"
      />
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-2 w-2 rounded-full bg-blue-700 dark:bg-blue-50"
          style={{
            boxShadow: "var(--glow-shadow)",
          }}
        />
      ))}
    </div>
  )
}
