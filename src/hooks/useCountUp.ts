import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

export const useCountUp = (
  targetValue: string | number,
  options: UseCountUpOptions = {}
) => {
  const {
    duration = 1500,
    delay = 0,
    easing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOutQuad
  } = options;

  const [displayValue, setDisplayValue] = useState<string | number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Convert target value to number for calculation
  const getNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    // Remove commas and convert to number
    const numericString = value.toString().replace(/,/g, '');
    return parseFloat(numericString) || 0;
  };

  // Format number back to string if original was string
  const formatValue = (current: number, target: string | number): string | number => {
    if (typeof target === 'number') {
      return Math.round(current);
    }
    
    // If target is string, maintain formatting (with commas)
    const roundedCurrent = Math.round(current);
    return roundedCurrent.toLocaleString();
  };

  const animate = (currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
    }

    const elapsed = currentTime - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);

    const targetNumeric = getNumericValue(targetValue);
    const currentNumeric = easedProgress * targetNumeric;
    
    setDisplayValue(formatValue(currentNumeric, targetValue));

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(targetValue);
      setIsAnimating(false);
    }
  };

  const startAnimation = () => {
    if (getNumericValue(targetValue) === 0) {
      setDisplayValue(targetValue);
      return;
    }

    setIsAnimating(true);
    setDisplayValue(0);
    startTimeRef.current = undefined;

    const delayedStart = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (delay > 0) {
      setTimeout(delayedStart, delay);
    } else {
      delayedStart();
    }
  };

  useEffect(() => {
    if (targetValue !== undefined && targetValue !== null) {
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    value: displayValue,
    isAnimating
  };
};