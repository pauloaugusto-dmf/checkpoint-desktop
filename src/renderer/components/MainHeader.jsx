import React from 'react';
import { Plus, CalendarDays } from 'lucide-react';

export default function MainHeader({ 
  activeFilter, 
  setIsEventModalOpen, 
  handleOpenAdd 
}) {
  return (
    <header className="h-20 glass flex items-center justify-between px-8 border-b border-dark-700 z-10">
      <h2 className="text-2xl font-bold text-txt-main">{activeFilter}</h2>
      <div className="flex items-center gap-3">
        {activeFilter === 'Calendário' && (


          <button 
            onClick={() => setIsEventModalOpen(true)}
            className="bg-dark-800 hover:bg-dark-700 border border-dark-600 text-txt-main px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Adicionar Evento</span>
          </button>
        )}
        <button 
          onClick={handleOpenAdd}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Jogo</span>
        </button>
      </div>
    </header>
  );
}
