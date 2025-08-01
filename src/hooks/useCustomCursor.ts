'use client';

import { useState, useEffect } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export function useCustomCursor() {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on desktop (not mobile/tablet)
    const isDesktop = window.innerWidth >= 1024; // lg breakpoint
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], .clickable');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Hide default cursor completely
    document.body.style.cursor = 'none';

    // Create global style to hide cursor on all elements
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = `
      * { 
        cursor: none !important; 
      }
      *:hover { 
        cursor: none !important; 
      }
      input, textarea, button, a, [role="button"], .clickable {
        cursor: none !important;
      }
    `;

    // Remove existing style if any
    const existingStyle = document.getElementById('custom-cursor-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });

      // Restore default cursor
      document.body.style.cursor = 'auto';

      // Remove custom style
      const styleToRemove = document.getElementById('custom-cursor-style');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  return { cursorPosition, isHovering };
}
