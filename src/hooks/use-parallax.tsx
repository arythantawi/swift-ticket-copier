import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxOptions {
  speed?: number; // -1 to 1, negative = slower, positive = faster
  direction?: 'vertical' | 'horizontal';
  start?: string;
  end?: string;
  scrub?: number | boolean;
}

export const useParallax = <T extends HTMLElement>(
  options: ParallaxOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const {
    speed = 0.3,
    direction = 'vertical',
    start = 'top bottom',
    end = 'bottom top',
    scrub = 1,
  } = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const movement = speed * 100;
    const props = direction === 'vertical' 
      ? { yPercent: movement }
      : { xPercent: movement };

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        ...props,
        ease: 'none',
        scrollTrigger: {
          trigger: elementRef.current,
          start,
          end,
          scrub,
        },
      });
    });

    return () => ctx.revert();
  }, [speed, direction, start, end, scrub]);

  return elementRef;
};

// Multiple parallax layers hook
interface ParallaxLayerConfig {
  selector: string;
  speed: number;
  direction?: 'vertical' | 'horizontal';
}

export const useParallaxLayers = (
  containerRef: RefObject<HTMLElement>,
  layers: ParallaxLayerConfig[]
) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      layers.forEach(({ selector, speed, direction = 'vertical' }) => {
        const elements = containerRef.current?.querySelectorAll(selector);
        if (!elements?.length) return;

        const movement = speed * 100;
        const props = direction === 'vertical'
          ? { yPercent: movement }
          : { xPercent: movement };

        gsap.to(elements, {
          ...props,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, layers]);
};

// Fade parallax effect
export const useFadeParallax = <T extends HTMLElement>(
  options: { fadeStart?: number; fadeEnd?: number } = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const { fadeStart = 1, fadeEnd = 0 } = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: fadeStart },
        {
          opacity: fadeEnd,
          ease: 'none',
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top center',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [fadeStart, fadeEnd]);

  return elementRef;
};

// Scale parallax effect
export const useScaleParallax = <T extends HTMLElement>(
  options: { scaleStart?: number; scaleEnd?: number } = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const { scaleStart = 1, scaleEnd = 0.8 } = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { scale: scaleStart },
        {
          scale: scaleEnd,
          ease: 'none',
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [scaleStart, scaleEnd]);

  return elementRef;
};

export default useParallax;
