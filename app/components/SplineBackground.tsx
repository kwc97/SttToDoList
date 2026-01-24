'use client';

import { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SplineBackground() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Mouse interaction for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 30, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / innerHeight) * 2 - 1;
      
      mouseX.set(normalizedX * 20); // Move 20px max
      mouseY.set(normalizedY * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-gray-50">
      {/* Animated Container */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ x, y, scale: 1.1 }} // Scale up slightly to avoid edges
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          rotate: [0, 5, 0, -5, 0], // Subtle continuous rotation
        }}
        transition={{
          opacity: { duration: 1.5 },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" }
        }}
      >
        <Spline 
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
          onLoad={() => setIsLoaded(true)}
        />
      </motion.div>

      {/* Loading State Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Glass Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none" />
      
      {/* Gradient Overlay for sophistication */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/50 pointer-events-none" />
    </div>
  );
}
