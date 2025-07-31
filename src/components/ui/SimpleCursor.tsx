'use client';

import { useEffect, useState } from 'react';

export default function SimpleCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile/touch devices
    const checkIfMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024;
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;

      return isTouchDevice || isSmallScreen || isCoarsePointer || noHover;
    };

    setIsMobile(checkIfMobile());

    // If mobile, don't initialize cursor at all
    if (checkIfMobile()) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check if hovering over interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('[role="button"]') ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Track mouse movement
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Hide default cursor globally with enhanced targeting
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';

    // Apply cursor: none to all elements including iframes and third-party widgets
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after, 
      html, body, div, span, iframe, 
      object, embed, canvas, svg,
      input, textarea, select, button, a,
      .tawk-min-container, .tawk-chat-panel,
      #tawk_chat_iframe, .tawk-chat {
        cursor: none !important;
      }
      
      /* Override any potential third-party cursor styles */
      [style*="cursor"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);

      // Reset cursor
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';

      // Remove the style element
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Don't render anything on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        transform: 'translate(-10px, -10px)',
        transition: '0.05s ease-out',
        zIndex: 2147483647,
        willChange: 'transform',
        position: 'fixed',
        pointerEvents: 'none',
        display: isVisible ? 'block' : 'none',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
          transform: isHovering ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
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
