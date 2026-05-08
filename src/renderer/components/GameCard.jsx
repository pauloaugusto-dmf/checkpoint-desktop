import React, { memo } from 'react';
import { Gamepad2, Clock } from 'lucide-react';
import { platforms } from '../js/platforms';

const GameCard = memo(function GameCard({ jogo, icon, iconColorClass, onClick }) {
  const plataformaObj = platforms.find(p => p.id === jogo.plataforma);

  return (
    <div onClick={onClick} className="bg-dark-800/80 border border-white/5 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group shadow-lg" style={{ willChange: 'transform' }}>
      <div className="h-48 bg-dark-800 relative">
        {jogo.capa_caminho ? (
          <img src={jogo.capa_caminho} alt={jogo.titulo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="flex items-center justify-center h-full text-dark-600">
            <Gamepad2 className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-2 shadow-lg border border-white/10">
          {React.cloneElement(icon, { className: `w-4 h-4 transition-colors ${iconColorClass || ''}` })}
          <span className="text-xs font-semibold text-txt-main">{jogo.status}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-txt-main truncate">{jogo.titulo}</h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {plataformaObj ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-sm inline-block" style={{ backgroundColor: plataformaObj.bgColor, color: plataformaObj.color }}>
              {plataformaObj.name}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-700 text-txt-muted">
              {jogo.plataforma || 'N/A'}
            </span>
          )}
          
          {jogo.generos && jogo.generos.slice(0, 2).map(gen => (
            <span 
              key={gen.id} 
              className="text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{ 
                backgroundColor: `${gen.cor}20`, 
                color: gen.cor, 
                borderColor: `${gen.cor}40` 
              }}
            >
              {gen.nome}
            </span>
          ))}
          {jogo.generos && jogo.generos.length > 2 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-900/50 text-txt-muted border border-dark-600">
              +{jogo.generos.length - 2}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-txt-muted uppercase font-bold tracking-widest">Nota</span>
            <span className="text-sm font-bold text-primary-400">{jogo.nota_pessoal}/10</span>
          </div>
          
          <div className="flex flex-col items-end text-right">
             <span className="text-[10px] text-txt-muted uppercase font-bold tracking-widest">Tempo</span>
             <div className="flex items-center gap-1">
               <Clock className="w-3 h-3 text-txt-muted" />
               <span className="text-sm font-bold text-txt-main">
                 {Math.floor((jogo.tempo_jogo_minutos || 0) / 60)}h
               </span>
             </div>
          </div>
        </div>

        <div className="mt-3">
           <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-txt-muted uppercase font-bold tracking-widest">Progresso</span>
              <span className="text-xs font-bold text-txt-main">{jogo.percentual_conclusao || 0}%</span>
           </div>
           <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: `${jogo.percentual_conclusao || 0}%` }} />
           </div>
        </div>
      </div>
    </div>
  );
});

export default GameCard;
