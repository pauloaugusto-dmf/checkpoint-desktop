import React from 'react';
import { Gamepad2, CalendarDays, Plus, X } from 'lucide-react';

export default function DayDetailsModal({ data, onClose, onAddEvent, onAddGame }) {
  const dateObj = new Date(data.date + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden scale-in-center">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-700/50">
          <div>
            <h2 className="text-xl font-bold text-txt-main">Detalhes do Dia</h2>
            <p className="text-sm text-txt-muted">{formattedDate}</p>
          </div>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-main transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          {data.games.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Lançamentos de Jogos
              </h3>
              <div className="space-y-2">
                {data.games.map(game => (
                  <div key={game.id} className="flex items-center gap-3 bg-dark-900/50 p-3 rounded-xl border border-dark-700">
                    {game.capa_caminho ? (
                      <img src={game.capa_caminho} alt="" className="w-12 h-16 object-cover rounded-lg shadow-md" />
                    ) : (
                      <div className="w-12 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate">{game.titulo}</h4>
                      <p className="text-xs text-gray-400 truncate">{game.plataforma || 'Plataforma não informada'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.events.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Eventos Marcados
              </h3>
              <div className="space-y-2">
                {data.events.map(event => (
                  <div key={event.id} className="flex items-center gap-3 bg-dark-900/50 p-3 rounded-xl border border-dark-700">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: event.cor + '20' }}>
                      <CalendarDays className="w-5 h-5" style={{ color: event.cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate">{event.titulo}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-dark-900/30 border-t border-dark-700 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onAddEvent}
            className="flex-1 bg-dark-700 hover:bg-dark-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium border border-dark-600 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Evento</span>
          </button>
          <button 
            onClick={onAddGame}
            className="flex-1 bg-primary-600 hover:bg-primary-500 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Jogo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
