import React, { useState, useEffect } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from './utils';

export function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  style, 
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

  useEffect(() => {
    if (!src) setStatus('error');
  }, [src]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted flex items-center justify-center shrink-0", 
        className
      )}
      style={style}
    >
      {/* Skeleton / Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-primary/5 flex items-center justify-center">
           <Loader2 className="size-5 text-primary/20 animate-spin" />
        </div>
      )}

      {/* Error / Fallback State */}
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center w-full h-full bg-primary/5 text-primary/40 p-4 text-center">
          <ImageOff className="size-8 mb-2 opacity-50" />
          <span className="text-[10px] font-medium uppercase tracking-tight leading-none">No Image</span>
        </div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          status === 'loaded' ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        {...props}
      />
    </div>
  );
}
