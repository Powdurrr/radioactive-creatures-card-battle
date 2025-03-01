
import React from "react";
import { motion } from "framer-motion";

export const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radiation Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight - 100,
            ],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * 20,
          }}
        />
      ))}
      
      {/* Radiation Symbol */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
        <svg width="600" height="600" viewBox="0 0 100 100" className="text-primary">
          <circle cx="50" cy="50" r="20" fill="currentColor" />
          <path d="M50,20 L50,80" stroke="currentColor" strokeWidth="10" />
          <path 
            d="M50,50 L76.6,80" 
            stroke="currentColor" 
            strokeWidth="10" 
            transform="rotate(45 50 50)"
          />
          <path 
            d="M50,50 L76.6,80" 
            stroke="currentColor" 
            strokeWidth="10" 
            transform="rotate(165 50 50)"
          />
        </svg>
      </div>
    </div>
  );
};
