
import React from 'react';

export const COLORS = {
  primary: '#8B5CF6',
  secondary: '#3B82F6',
  highlight: '#EC4899',
  bgLight: '#FFFFFF',
  bgGray: '#F9FAFB',
  bgDark: '#111827',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

export const Logo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 32, showText = true }) => (
  <div className="flex items-center gap-3">
    <div 
      className="flex items-center justify-center shrink-0 overflow-hidden rounded-xl" 
      style={{ width: size, height: size }}
    >
      <img 
        src="https://i.imgur.com/YEfas0N.png" 
        alt="Alurio Logo" 
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback caso a imagem falhe
          (e.target as HTMLImageElement).src = 'https://i.imgur.com/YEfas0N.png';
        }}
      />
    </div>
    {showText && <span className="font-bold text-2xl tracking-tighter text-gray-900 bg-alurio-gradient bg-clip-text text-transparent">alurio</span>}
  </div>
);
