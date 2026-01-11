import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  enabled?: boolean;
}

export const useTypewriter = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  enabled = true,
}: UseTypewriterOptions) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const reset = useCallback(() => {
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    reset();
    
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete, enabled, reset]);

  return {
    displayedText,
    isComplete,
    isTyping,
    reset,
  };
};

// Component version for easier use
interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
  onComplete?: () => void;
  enabled?: boolean;
}

import { forwardRef } from 'react';

export const Typewriter = forwardRef<HTMLSpanElement, TypewriterProps>(
  function Typewriter(
    {
      text,
      speed = 50,
      delay = 0,
      className = '',
      cursorClassName = '',
      showCursor = true,
      onComplete,
      enabled = true,
    },
    ref
  ) {
    const { displayedText, isTyping, isComplete } = useTypewriter({
      text,
      speed,
      delay,
      onComplete,
      enabled,
    });

    return (
      <span ref={ref} className={className}>
        {displayedText}
        {showCursor && !isComplete && (
          <span
            className={`inline-block w-[2px] h-[1em] bg-current ml-1 ${isTyping ? 'animate-pulse' : ''} ${cursorClassName}`}
            style={{ verticalAlign: 'text-bottom' }}
            aria-hidden="true"
          />
        )}
      </span>
    );
  }
);

export default useTypewriter;
