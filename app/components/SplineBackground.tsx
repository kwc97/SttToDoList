'use client';

import { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function SplineBackground() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Mouse interaction for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for mouse movement - More responsive now
  const springConfig = { damping: 20, stiffness: 100 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / innerHeight) * 2 - 1;
      
      // Increased range for dynamic feel (50px movement)
      mouseX.set(normalizedX * 50); 
      mouseY.set(normalizedY * 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-gray-50">
      {/* Parallax Container - Moves with mouse */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ x, y }}
      >
        {/* Animation Container - Continuous movement */}
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: [1.1, 1.2, 1.1], // Dynamic Breathing
            rotate: 360, // Continuous Full Rotation
          }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 120, repeat: Infinity, ease: "linear" }, // 120 seconds per rotation
          }}
        >
          <Spline 
            scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
            onLoad={() => setIsLoaded(true)}
          />
        </motion.div>
      </motion.div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="w-8 h-8 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-none" />
      
      {/* Dynamic Gradient Overlay for Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
    </div>
  );
}
