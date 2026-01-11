import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StaggerOptions {
  stagger?: number;
  duration?: number;
  delay?: number;
  from?: 'start' | 'end' | 'center' | 'edges' | 'random';
  ease?: string;
  y?: number;
  x?: number;
  scale?: number;
  opacity?: number;
}

export function useStaggerAnimation<T extends HTMLElement>(
  options: StaggerOptions = {}
) {
  const containerRef = useRef<T>(null);
  const hasAnimated = useRef(false);

  const {
    stagger = 0.08,
    duration = 0.5,
    delay = 0,
    from = 'start',
    ease = 'power3.out',
    y = 30,
    x = 0,
    scale = 1,
    opacity = 0,
  } = options;

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;

    const children = containerRef.current.children;
    if (children.length === 0) return;

    hasAnimated.current = true;

    gsap.fromTo(
      children,
      {
        y,
        x,
        scale: scale !== 1 ? scale : undefined,
        opacity,
      },
      {
        y: 0,
        x: 0,
        scale: 1,
        opacity: 1,
        duration,
        delay,
        stagger: {
          each: stagger,
          from,
        },
        ease,
        clearProps: 'transform',
      }
    );
  }, [stagger, duration, delay, from, ease, y, x, scale, opacity]);

  // Reset function to allow re-animation
  const resetAnimation = () => {
    hasAnimated.current = false;
  };

  return { containerRef, resetAnimation };
}

// Hook for scroll-triggered stagger animation
export function useScrollStagger<T extends HTMLElement>(
  options: StaggerOptions & { 
    triggerStart?: string;
    triggerEnd?: string;
    once?: boolean;
  } = {}
) {
  const containerRef = useRef<T>(null);

  const {
    stagger = 0.08,
    duration = 0.5,
    delay = 0,
    from = 'start',
    ease = 'power3.out',
    y = 40,
    x = 0,
    scale = 1,
    opacity = 0,
    triggerStart = 'top 85%',
    triggerEnd = 'bottom 20%',
    once = true,
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.children;
    if (children.length === 0) return;

    // Set initial state
    gsap.set(children, {
      y,
      x,
      scale: scale !== 1 ? scale : undefined,
      opacity,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(children, {
              y: 0,
              x: 0,
              scale: 1,
              opacity: 1,
              duration,
              delay,
              stagger: {
                each: stagger,
                from,
              },
              ease,
              clearProps: 'transform',
            });

            if (once) {
              observer.disconnect();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [stagger, duration, delay, from, ease, y, x, scale, opacity, triggerStart, triggerEnd, once]);

  return { containerRef };
}
