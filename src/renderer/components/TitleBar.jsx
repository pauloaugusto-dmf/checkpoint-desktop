import React from 'react';
import { Gamepad2, Minus, Square, X } from 'lucide-react';

export default function TitleBar() {
  return (
    <div className="h-10 bg-dark-900 border-b border-dark-700 flex justify-between items-center select-none shrink-0" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-2 px-4 text-txt-muted">
        <Gamepad2 className="w-4 h-4 text-primary-500" />
        <span className="text-xs font-bold tracking-widest">CHECKPOINT</span>
      </div>
      
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <button 
          onClick={() => window.windowControls?.minimize()} 
          className="px-4 hover:bg-dark-700 text-txt-muted hover:text-txt-main transition-colors flex items-center justify-center h-full"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          onClick={() => window.windowControls?.maximize()} 
          className="px-4 hover:bg-dark-700 text-txt-muted hover:text-txt-main transition-colors flex items-center justify-center h-full"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => window.windowControls?.close()} 
          className="px-4 hover:bg-red-500 text-txt-muted hover:text-txt-main transition-colors flex items-center justify-center h-full group"
        >
          <X className="w-4 h-4 group-hover:text-txt-main" />
        </button>
      </div>
    </div>
  );
}
