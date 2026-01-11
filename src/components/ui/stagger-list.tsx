import * as React from 'react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface StaggerListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stagger?: number;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  from?: 'start' | 'end' | 'center' | 'edges' | 'random';
  ease?: string;
  once?: boolean;
  as?: 'div' | 'ul' | 'ol';
}

const StaggerList = React.forwardRef<HTMLDivElement, StaggerListProps>(
  (
    {
      children,
      className,
      stagger = 0.08,
      duration = 0.5,
      delay = 0,
      direction = 'up',
      from = 'start',
      ease = 'power3.out',
      once = true,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    // Get animation properties based on direction
    const getFromProps = () => {
      switch (direction) {
        case 'up':
          return { y: 40, opacity: 0 };
        case 'down':
          return { y: -40, opacity: 0 };
        case 'left':
          return { x: 40, opacity: 0 };
        case 'right':
          return { x: -40, opacity: 0 };
        case 'scale':
          return { scale: 0.8, opacity: 0 };
        case 'fade':
          return { opacity: 0 };
        default:
          return { y: 40, opacity: 0 };
      }
    };

    useEffect(() => {
      if (!containerRef.current) return;

      const children = containerRef.current.children;
      if (children.length === 0) return;

      // Set initial state
      gsap.set(children, getFromProps());

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && (!once || !hasAnimated.current)) {
              hasAnimated.current = true;

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
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }, [stagger, duration, delay, direction, from, ease, once]);

    const Comp = Component as React.ElementType;

    return (
      <Comp
        ref={(node: HTMLDivElement) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
StaggerList.displayName = 'StaggerList';

// Individual stagger item wrapper for more control
interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: 'div' | 'li' | 'span';
}

const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, as: Component = 'div', ...props }, ref) => {
    const Comp = Component as React.ElementType;
    return (
      <Comp ref={ref} className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }
);
StaggerItem.displayName = 'StaggerItem';

export { StaggerList, StaggerItem };
