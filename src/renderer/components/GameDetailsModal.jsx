import React from 'react';
import { Gamepad2, X, Star, Clock, Edit3 } from 'lucide-react';
import { platforms } from '../js/platforms';

export default function GameDetailsModal({ jogo, onClose, onEdit, icon, iconColorClass }) {
  const plataformaObj = platforms.find(p => p.id === jogo.plataforma);
  const formattedDate = jogo.data_lancamento ? new Date(jogo.data_lancamento).toLocaleDateString('pt-BR') : 'Data não definida';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-dark-800 border border-dark-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] scale-in-center">
        {/* Left Side: Cover */}
        <div className="w-full md:w-2/5 h-64 md:h-auto bg-dark-900 relative overflow-hidden group">
          {jogo.capa_caminho ? (
            <img src={jogo.capa_caminho} alt={jogo.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="flex items-center justify-center h-full text-dark-700">
              <Gamepad2 className="w-32 h-32 opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-4 left-4">
             <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/10">
                <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-txt-main mb-2 tracking-tight">{jogo.titulo}</h2>
              <div className="flex items-center gap-3">
                {plataformaObj && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm" style={{ backgroundColor: plataformaObj.bgColor, color: plataformaObj.color }}>
                    {plataformaObj.name}
                  </span>
                )}
                <span className="text-txt-muted text-sm font-medium">{formattedDate}</span>
              </div>
              
              {jogo.generos && jogo.generos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {jogo.generos.map(gen => (
                    <span 
                      key={gen.id} 
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all"
                      style={{ 
                        backgroundColor: `${gen.cor}15`, 
                        color: gen.cor, 
                        borderColor: `${gen.cor}30` 
                      }}
                    >
                      {gen.nome}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700">
              <p className="text-[10px] text-txt-muted uppercase font-bold tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                {React.cloneElement(icon, { className: `w-5 h-5 ${iconColorClass}` })}
                <span className="text-sm font-bold text-txt-main">{jogo.status}</span>
              </div>
            </div>
            
            <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700">
              <p className="text-[10px] text-txt-muted uppercase font-bold tracking-widest mb-1">Nota Pessoal</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-black text-txt-main">{jogo.nota_pessoal || 'N/A'}<span className="text-xs text-txt-muted font-normal ml-1">/10</span></span>
              </div>
            </div>

            <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700">
              <p className="text-[10px] text-txt-muted uppercase font-bold tracking-widest mb-1">Progresso</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${jogo.percentual_conclusao || 0}%` }} />
                </div>
                <span className="text-sm font-bold text-txt-main">{jogo.percentual_conclusao || 0}%</span>
              </div>
            </div>

            <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700 col-span-2 sm:col-span-1">
              <p className="text-[10px] text-txt-muted uppercase font-bold tracking-widest mb-1">Tempo de Jogo</p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-txt-muted" />
                <span className="text-sm font-bold text-txt-main">{Math.floor((jogo.tempo_jogo_minutos || 0) / 60)}h {jogo.tempo_jogo_minutos % 60}m</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-dark-700 flex gap-4">
            <button 
              onClick={onEdit}
              className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-xl shadow-primary-500/20"
            >
              <Edit3 className="w-5 h-5" />
              <span>Editar</span>
            </button>
            <button 
              onClick={onClose}
              className="px-8 bg-dark-700 hover:bg-dark-600 text-txt-main py-4 rounded-2xl transition-all font-bold border border-dark-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
