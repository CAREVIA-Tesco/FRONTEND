import React from 'react';

export default function AnimatedCTA({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transform hover:-translate-y-0.5 transition-transform shadow-lg"
    >
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#ffffff_50%,#000000_100%)] opacity-80" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#1A3789] px-6 py-2 text-base font-medium text-white backdrop-blur-3xl overflow-hidden relative">
        <span className="relative z-10">{children}</span>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
          <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[20%] animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[60%] left-[80%] animate-pulse" style={{ animationDuration: '2s' }}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full top-[40%] left-[50%] animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[70%] left-[30%] animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}></div>
        </div>
      </span>
    </button>
  );
}
