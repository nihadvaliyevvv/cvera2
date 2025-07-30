'use client';

import { useEffect, useState } from 'react';

export default function SimpleCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
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
      
      /* Specifically target Tawk.to and other chat widgets with highest priority */
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
      .zendesk-chat *,
      div[id^="tawk"],
      div[class*="tawk"],
      div[data-tawk],
      div[data-tawk] * {
        cursor: none !important;
        pointer-events: auto !important;
      }
      
      /* Target all iframes with enhanced specificity */
      iframe,
      iframe *,
      iframe body,
      iframe body * {
        cursor: none !important;
      }
      
      /* Override any inline styles with maximum specificity */
      [style*="cursor"] {
        cursor: none !important;
      }
    `;

    // Add style with highest priority and unique identifier
    style.setAttribute('data-custom-cursor', 'enhanced-tawk-fix');
    style.setAttribute('id', 'custom-cursor-override');
    document.head.appendChild(style);

    // Enhanced iframe and tawk.to cursor override using mutation observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Apply cursor none to new iframes and all their contents
              if (element.tagName === 'IFRAME') {
                const iframe = element as HTMLIFrameElement;
                iframe.style.setProperty('cursor', 'none', 'important');

                // Try to access iframe content if same-origin
                try {
                  iframe.onload = () => {
                    try {
                      if (iframe.contentDocument) {
                        iframe.contentDocument.body.style.setProperty('cursor', 'none', 'important');
                        iframe.contentDocument.documentElement.style.setProperty('cursor', 'none', 'important');
                      }
                    } catch (e) {
                      // Cross-origin iframe, can't access content
                      console.log('Cross-origin iframe detected, cursor override limited to frame element');
                    }
                  };
                } catch (e) {
                  // Ignore cross-origin errors
                }
              }

              // Enhanced Tawk.to targeting
              if (element.id && (element.id.includes('tawk') || element.id.includes('chat'))) {
                (element as HTMLElement).style.setProperty('cursor', 'none', 'important');

                // Apply to all descendants
                const allDescendants = element.querySelectorAll('*');
                allDescendants.forEach((desc) => {
                  (desc as HTMLElement).style.setProperty('cursor', 'none', 'important');
                });
              }

              // Apply to all children recursively
              const iframes = element.querySelectorAll('iframe');
              iframes.forEach((iframe) => {
                (iframe as HTMLElement).style.setProperty('cursor', 'none', 'important');
              });

              const tawkElements = element.querySelectorAll('[id*="tawk"], [class*="tawk"], [id*="chat"], [class*="chat"]');
              tawkElements.forEach((elem) => {
                (elem as HTMLElement).style.setProperty('cursor', 'none', 'important');
              });
            }
          });
        }
      });
    });

    // Start observing with enhanced options
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'id']
    });

    // Multiple attempts to override existing elements
    const forceOverride = () => {
      // Specifically target existing Tawk.to elements with enhanced selectors
      const selectors = [
        '[id*="tawk"]', '[class*="tawk"]', 'iframe[src*="tawk"]',
        '[id*="chat"]', '[class*="chat"]', 'iframe[src*="chat"]',
        'iframe[title*="chat"]', 'iframe[title*="support"]',
        'div[role="dialog"]', 'div[role="button"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((elem) => {
          const htmlElem = elem as HTMLElement;
          htmlElem.style.setProperty('cursor', 'none', 'important');
          htmlElem.style.setProperty('pointer-events', 'auto', 'important');

          // Also apply to all children
          const children = htmlElem.querySelectorAll('*');
          children.forEach(child => {
            (child as HTMLElement).style.setProperty('cursor', 'none', 'important');
          });
        });
      });
    };

    // Apply overrides multiple times to catch dynamically loaded content
    setTimeout(forceOverride, 100);
    setTimeout(forceOverride, 500);
    setTimeout(forceOverride, 1000);
    setTimeout(forceOverride, 2000);

    // Set up periodic checks for persistent override
    const intervalId = setInterval(forceOverride, 3000);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      observer.disconnect();
      clearInterval(intervalId);

      // Remove custom styles
      const customStyles = document.querySelectorAll('[data-custom-cursor="enhanced-tawk-fix"]');
      customStyles.forEach(style => style.remove());

      const customStyleById = document.getElementById('custom-cursor-override');
      if (customStyleById) customStyleById.remove();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor element with maximum z-index and enhanced positioning */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-10px, -10px)',
          transition: 'all 0.05s ease-out',
          zIndex: 2147483647, // Maximum possible z-index
          willChange: 'transform',
          position: 'fixed',
          pointerEvents: 'none',
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
            transition: 'transform 0.15s ease-out'
          }}
        >
          <path
            d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
            fill={isHovering ? "#1d4ed8" : "#2563eb"}
            stroke={isHovering ? "#1e40af" : "#1d4ed8"}
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Additional cursor ring for better visibility over complex backgrounds */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-15px, -15px)',
          transition: 'all 0.1s ease-out',
          zIndex: 2147483646, // Slightly lower than main cursor
          willChange: 'transform',
          position: 'fixed',
          pointerEvents: 'none',
          opacity: isHovering ? 0.6 : 0.3,
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            border: `2px solid ${isHovering ? '#1d4ed8' : '#2563eb'}`,
            borderRadius: '50%',
            transform: isHovering ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.15s ease-out',
          }}
        />
      </div>
    </>
  );
}
