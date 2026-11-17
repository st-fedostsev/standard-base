import { useLayoutEffect, useRef, useState } from 'react';

export function useContainerWidth() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const measure = () => {
      setWidth(container.clientWidth);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);

      return () => {
        window.removeEventListener('resize', measure);
      };
    }

    const observer = new ResizeObserver(measure);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    containerRef,
    width,
  };
}
