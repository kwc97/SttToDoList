'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SplineBackground() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-[#050505]">
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5 }}
      >
        <iframe 
          src='https://my.spline.design/boxeshover-oAeh9mj12ut2hz7MokR3Ue4e/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          onLoad={() => setIsLoaded(true)}
          title="Spline 3D Background"
          className="w-full h-full"
        />
      </motion.div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="w-8 h-8 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Glass Overlay - Kept for consistency with dark theme */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-none" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
    </div>
  );
}
