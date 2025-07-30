'use client';

import { useEffect, useState } from 'react';

export default function SimpleCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        transition: 'all 0.1s ease-out'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
          fill="#2563eb"
          stroke="#1d4ed8"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
