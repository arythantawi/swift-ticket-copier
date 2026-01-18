import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import logo44Trans from '@/assets/logo-44trans.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const logo = logoRef.current;
    const text = textRef.current;
    const progressBar = progressRef.current;

    if (!container || !logo || !text || !progressBar) return;

    // Create timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out and call complete
        gsap.to(container, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: onComplete
        });
      }
    });

    // Initial state
    gsap.set(logo, { scale: 0, rotation: -180, opacity: 0 });
    gsap.set(text, { y: 30, opacity: 0 });
    gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });

    // Logo entrance with spin
    tl.to(logo, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 1,
      ease: 'back.out(1.7)'
    });

    // Logo pulse effect
    tl.to(logo, {
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    });

    // Text fade in
    tl.to(text, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3');

    // Progress bar animation
    tl.to(progressBar, {
      scaleX: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: function() {
        setProgress(Math.round(this.progress() * 100));
      }
    }, '-=0.3');

    // Final logo glow effect
    tl.to(logo, {
      boxShadow: '0 0 40px rgba(180, 142, 38, 0.6)',
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.2');

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5"
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Logo container */}
      <div
        ref={logoRef}
        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary bg-white p-2 shadow-2xl flex items-center justify-center"
      >
        <img
          src={logo44Trans}
          alt="44 Trans Jawa Bali"
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      {/* Text */}
      <div ref={textRef} className="mt-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          44 Trans Jawa Bali
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mempersiapkan perjalanan Anda...
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-64 md:w-80">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          />
        </div>
        <p className="mt-2 text-sm text-center text-muted-foreground">
          {progress}%
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
