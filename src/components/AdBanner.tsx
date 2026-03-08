"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  zoneId?: string;
  className?: string;
}

export function AdBanner({ zoneId = "3193409", className }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    try {
      const script = document.createElement("script");
      script.type = "text/javascript";
      // This is a standard Adsterra placeholder format
      script.src = `//pl25841234.highperformanceformat.com/${zoneId.substring(0,2)}/${zoneId.substring(2,4)}/${zoneId.substring(4,6)}/${zoneId}.js`; 
      script.async = true;
      
      adRef.current.innerHTML = "";
      adRef.current.appendChild(script);
    } catch (e) {
      console.error("Ad Banner loading failed", e);
    }
  }, [zoneId]);

  return (
    <div 
      ref={adRef} 
      className={`w-full min-h-[90px] bg-slate-100 flex items-center justify-center border rounded-xl overflow-hidden text-slate-400 text-[10px] font-bold uppercase tracking-widest ${className}`}
    >
      Sponsored Content
    </div>
  );
}
