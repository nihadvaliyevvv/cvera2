'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing6() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-out-cubic',
    });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 cursor-none">
      {/* Mouse cursor effect */}
      <div
        className="fixed w-6 h-6 bg-emerald-500 rounded-full pointer-events-none z-50 mix-blend-multiply transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 12}px, ${mousePosition.y - 12}px)`,
        }}
      />
      <div
        className="fixed w-12 h-12 border-2 border-emerald-300 rounded-full pointer-events-none z-40 transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 24}px, ${mousePosition.y - 24}px)`,
        }}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Landing Page 6</h1>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Ana Səhifəyə Qayıt
          </Link>
        </div>
      </div>
    </div>
  );
}
