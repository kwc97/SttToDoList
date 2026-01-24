'use client';

import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
    </div>
  );
}
