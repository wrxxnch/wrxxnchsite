import React from 'react';

export const DedsecSkullIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Stylized DedSec Low-poly Skull */}
    <path d="M20 25 L50 10 L80 25 L85 55 L75 75 L62 75 L62 88 L55 92 L52 82 L48 82 L45 92 L38 88 L38 75 L25 75 L15 55 Z" />
    <polygon points="32,40 42,42 38,55 28,52" fill="#06090e" />
    <polygon points="68,40 58,42 62,55 72,52" fill="#06090e" />
    <polygon points="46,58 54,58 50,66" fill="#06090e" />
    {/* Glitch X marks */}
    <line x1="30" y1="42" x2="40" y2="52" stroke="var(--dedsec-accent)" strokeWidth="3" />
    <line x1="40" y1="42" x2="30" y2="52" stroke="var(--dedsec-accent)" strokeWidth="3" />
  </svg>
);

export const DedsecBannerText: React.FC<{ text?: string }> = ({ text = "DEDSEC GIVES YOU THE TRUTH" }) => {
  return (
    <div className="relative inline-block font-mono font-bold tracking-wider uppercase text-sm md:text-base py-1 px-3 bg-black/60 border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]">
      <span className="inline-block animate-pulse mr-2 text-[var(--dedsec-accent)]">▶</span>
      <span>{text}</span>
      <span className="inline-block ml-2 w-2 h-4 bg-[var(--dedsec-primary)] animate-ping" />
    </div>
  );
};
