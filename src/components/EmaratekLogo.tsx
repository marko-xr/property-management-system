import React from 'react';

interface EmaratekLogoProps {
  className?: string;
  showText?: boolean;
}

export const EmaratekLogo: React.FC<EmaratekLogoProps> = ({ className = "h-14", showText = true }) => {
  return (
    <div className={`flex items-center justify-between gap-3 py-2 px-3 bg-white rounded-lg border border-slate-300 shadow-xs text-slate-900 select-none ${className}`}>
      {/* Left side English Banner */}
      {showText && (
        <div className="text-left font-sans leading-tight hidden sm:block">
          <div className="font-black text-xs tracking-wider text-slate-950 uppercase font-mono">
            EMARATEK REAL ESTATE
          </div>
          <div className="text-[10px] font-bold text-slate-600 tracking-tight">
            Ajman - Al Jurf - McDonald's Roundabout
          </div>
        </div>
      )}

      {/* Center UAE Flag & Chart Map Logo Emblem */}
      <div className="relative flex items-center justify-center shrink-0 w-16 h-12">
        <svg viewBox="0 0 160 110" className="w-full h-full drop-shadow-xs" preserveAspectRatio="xMidYMid meet">
          {/* Black UAE Map Silhouette Base */}
          <path
            d="M 12 68 C 25 82, 45 98, 80 98 C 115 98, 140 78, 152 60 C 135 80, 95 86, 60 82 C 32 78, 18 72, 12 68 Z"
            fill="#090d16"
          />
          <path
            d="M 15 72 C 30 88, 55 98, 90 96 C 120 94, 145 80, 152 64 C 138 78, 110 88, 70 85 C 40 82, 22 76, 15 72 Z"
            fill="#000000"
          />

          {/* White Sweeping Wave Ribbon */}
          <path
            d="M 8 60 C 35 78, 75 78, 110 60 C 130 50, 145 38, 155 30 C 145 42, 125 56, 105 66 C 70 82, 30 80, 8 60 Z"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* 1. Red Column (Left - Tall) */}
          <path d="M 22 30 L 36 30 L 36 67 C 30 65, 25 62, 22 60 Z" fill="#dc2626" stroke="#000000" strokeWidth="1.5" />
          <path d="M 32 30 L 36 30 L 36 38 L 32 38 Z" fill="#991b1b" />

          {/* 2. Red Column (Left - Short) */}
          <path d="M 39 42 L 51 42 L 51 72 C 45 71, 41 70, 39 68 Z" fill="#ef4444" stroke="#000000" strokeWidth="1.5" />
          <path d="M 47 42 L 51 42 L 51 48 L 47 48 Z" fill="#991b1b" />

          {/* 3. White Column (Middle - Left) */}
          <path d="M 55 48 L 68 48 L 68 74 C 62 74, 58 74, 55 73 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />

          {/* 4. White Column (Middle - Right) */}
          <path d="M 72 52 L 85 52 L 85 73 C 78 74, 74 74, 72 73 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />

          {/* 5. Green Column (Right - Short) */}
          <path d="M 89 34 L 102 34 L 102 66 C 96 69, 91 71, 89 72 Z" fill="#16a34a" stroke="#000000" strokeWidth="1.5" />

          {/* 6. Green Column (Right - Tallest) */}
          <path d="M 106 14 L 120 14 L 120 54 C 114 58, 109 61, 106 63 Z" fill="#15803d" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Right side Arabic Banner */}
      {showText && (
        <div className="text-right font-sans leading-tight">
          <div className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950">
            إماراتك العقارية
          </div>
          <div className="text-[10px] font-bold text-slate-600">
            عجمان - الجرف - دوار ماكدونالدز
          </div>
        </div>
      )}
    </div>
  );
};

