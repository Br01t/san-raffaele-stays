import React, { useState, useEffect, useRef } from 'react';

interface LazyMapProps {
  title: string;
  src: string;
  className?: string;
}

const LazyMap: React.FC<LazyMapProps> = ({ title, src, className }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading when map is 200px away from viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isIntersecting ? (
        <iframe
          title={title}
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          Caricamento mappa...
        </div>
      )}
    </div>
  );
};

export default LazyMap;
