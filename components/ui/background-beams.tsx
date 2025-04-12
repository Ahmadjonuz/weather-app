"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!beamsRef.current) return;

    const moveBeam = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const bounds = beamsRef.current!.getBoundingClientRect();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;
      const xPercent = (x / bounds.width) * 100;
      const yPercent = (y / bounds.height) * 100;
      
      beamsRef.current!.style.setProperty("--x", `${xPercent}%`);
      beamsRef.current!.style.setProperty("--y", `${yPercent}%`);
    };

    window.addEventListener("mousemove", moveBeam);
    return () => window.removeEventListener("mousemove", moveBeam);
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "relative overflow-hidden bg-transparent [--x:50%] [--y:50%]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20" />
        <div
          className="absolute inset-0 opacity-50 mix-blend-soft-light"
          style={{
            backgroundImage: `
              radial-gradient(
                circle at var(--x) var(--y),
                rgba(255,255,255,0.1) 0%,
                transparent 25%
              ),
              radial-gradient(
                circle at var(--x) var(--y),
                rgba(79,70,229,0.4) 0%,
                transparent 40%
              ),
              radial-gradient(
                circle at var(--x) var(--y),
                rgba(59,130,246,0.3) 0%,
                transparent 50%
              )
            `,
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
    </div>
  );
}; 