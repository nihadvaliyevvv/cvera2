'use client';

import { useEffect, useState } from 'react';

export default function SimpleCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Track mouse movement
    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Hide default cursor globally
    document.body.style.cursor = 'none';

    // Apply cursor: none to all elements including iframes and third-party widgets
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
      
      /* Specifically target Tawk.to and other chat widgets */
      #tawkchat-minified-container,
      #tawkchat-container,
      iframe[src*="tawk.to"],
      iframe[src*="intercom"],
      iframe[src*="zendesk"],
      .tawk-chat,
      .intercom-chat,
      .zendesk-chat {
        cursor: none !important;
      }
      
      /* Override any inline styles */
      [style*="cursor"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.style.cursor = '';
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        transform: 'translate(-10px, -10px)', // Center the cursor
        transition: 'all 0.1s ease-out',
        zIndex: 2147483647, // Maximum z-index value
        willChange: 'transform', // Optimize for animations
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
          fill="#2563eb"
          stroke="#1d4ed8"
          strokeWidth="1"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
        />
      </svg>
    </div>
  );
}
