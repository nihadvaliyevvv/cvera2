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
    document.documentElement.style.cursor = 'none';

    // Apply cursor: none to all elements including iframes and third-party widgets
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after, 
      html, body, div, span, iframe, 
      input, button, a, img,
      [role], [tabindex] {
        cursor: none !important;
      }
      
      /* Force hide cursor on all interactive elements */
      button:hover,
      a:hover,
      input:hover,
      [onclick]:hover,
      [role="button"]:hover {
        cursor: none !important;
      }
      
      /* Specifically target Tawk.to and other chat widgets */
      #tawkchat-minified-container,
      #tawkchat-minified-container *,
      #tawkchat-container,
      #tawkchat-container *,
      iframe[src*="tawk.to"],
      iframe[src*="tawk.to"] *,
      iframe[title*="chat"],
      iframe[title*="Chat"],
      iframe[title*="tawk"],
      iframe[title*="Tawk"],
      .tawk-chat,
      .tawk-chat *,
      .intercom-chat,
      .intercom-chat *,
      .zendesk-chat,
      .zendesk-chat * {
        cursor: none !important;
      }
      
      /* Target all iframes */
      iframe,
      iframe * {
        cursor: none !important;
      }
      
      /* Override any inline styles */
      [style*="cursor"],
      [style*="cursor"] * {
        cursor: none !important;
      }
      
      /* Additional Tawk.to specific targeting */
      div[id^="tawk"],
      div[class*="tawk"],
      div[data-tawk] {
        cursor: none !important;
      }
    `;

    // Add style with highest priority
    style.setAttribute('data-custom-cursor', 'true');
    document.head.appendChild(style);

    // Additional iframe cursor override using mutation observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Apply cursor none to new iframes
              if (element.tagName === 'IFRAME') {
                (element as HTMLElement).style.cursor = 'none';
              }

              // Apply cursor none to Tawk.to related elements
              if (element.id && element.id.includes('tawk')) {
                (element as HTMLElement).style.cursor = 'none';
              }

              // Apply to all children recursively
              const iframes = element.querySelectorAll('iframe');
              iframes.forEach((iframe) => {
                (iframe as HTMLElement).style.cursor = 'none';
              });

              const tawkElements = element.querySelectorAll('[id*="tawk"], [class*="tawk"]');
              tawkElements.forEach((elem) => {
                (elem as HTMLElement).style.cursor = 'none';
              });
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Force cursor override on existing elements after a delay
    setTimeout(() => {
      // Specifically target existing Tawk.to elements
      const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"], iframe[src*="tawk"]');
      tawkElements.forEach((elem) => {
        (elem as HTMLElement).style.cursor = 'none';
        (elem as HTMLElement).style.setProperty('cursor', 'none', 'important');
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      observer.disconnect();

      // Remove custom styles
      const customStyles = document.querySelectorAll('[data-custom-cursor]');
      customStyles.forEach(style => style.remove());
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        transform: 'translate(-10px, -10px)',
        transition: 'all 0.1s ease-out',
        zIndex: 2147483647, // Maximum z-index
        willChange: 'transform',
        position: 'fixed',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
          fill="#2563eb"
          stroke="#1d4ed8"
          strokeWidth="1"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
        />
      </svg>
    </div>
  );
}
