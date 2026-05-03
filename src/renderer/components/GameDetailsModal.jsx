import React from 'react';
import { X, Calendar, Clock, Star, Gamepad2, CheckCircle2, ListMinus, Library, Archive, Pause, Edit3, Trash2 } from 'lucide-react';
import { platforms } from '../js/platforms';

export default function GameDetailsModal({ jogo, onClose, onEdit, icon, iconColorClass }) {
  if (!jogo) return null;

  const plataformaObj = platforms.find(p => p.id === jogo.plataforma);
  
  const formattedDate = jogo.data_lancamento 
    ? new Date(jogo.data_lancamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Data não definida';

  const horas = Math.floor((jogo.tempo_jogo_minutos || 0) / 60);
  const minutos = (jogo.tempo_jogo_minutos || 0) % 60;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-dark-800 border border-dark-700 rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-300">
        
        {/* Banner Area */}
        <div className="w-full h-64 md:h-80 relative shrink-0">
          {jogo.banner_caminho ? (
            <img 
              src={jogo.banner_caminho} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-900 flex items-center justify-center">
              <Gamepad2 className="w-24 h-24 text-white/5" />
            </div>
          )}
          
          {/* Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title & Plataform Over Banner */}
          <div className="absolute bottom-8 left-8 right-8 flex items-end gap-6">
            <div className="hidden md:block w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-dark-800 shrink-0 -mb-16 z-10 bg-dark-900">
              {jogo.capa_caminho ? (
                <img src={jogo.capa_caminho} alt={jogo.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-txt-muted">
                  <Gamepad2 className="w-12 h-12" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${iconColorClass} p-1.5 bg-dark-900/80 backdrop-blur rounded-lg border border-white/5`}>
                  {React.cloneElement(icon, { size: 18 })}
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-primary-500 drop-shadow-md">{jogo.status}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-txt-main leading-none drop-shadow-xl truncate">{jogo.titulo}</h2>
            </div>
            
            <button 
              onClick={onEdit}
              className="p-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl transition-all shadow-xl shadow-primary-600/30 group"
            >
              <Edit3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 p-8 pt-20 md:pt-24 overflow-y-auto custom-scrollbar bg-dark-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Stats */}
            <div className="space-y-6">
              <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-700/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-txt-muted mb-4">Informações</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-dark-800 rounded-lg text-primary-400">
                      <Library className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-txt-muted">Plataforma</div>
                      <div className="text-sm font-bold text-txt-main">{jogo.plataforma || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-dark-800 rounded-lg text-emerald-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-txt-muted">Lançamento</div>
                      <div className="text-sm font-bold text-txt-main">{formattedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-dark-800 rounded-lg text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-txt-muted">Tempo de Jogo</div>
                      <div className="text-sm font-bold text-txt-main">{horas}h {minutos}m</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-700/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-txt-muted mb-4">Progresso</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-txt-main">{jogo.percentual_conclusao}%</span>
                    <span className="text-xs font-bold text-txt-muted">Concluído</span>
                  </div>
                  <div className="h-3 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000"
                      style={{ width: `${jogo.percentual_conclusao}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle/Right Column: Genres & Score */}
            <div className="md:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-txt-muted mb-4">Gêneros</h3>
                  <div className="flex flex-wrap gap-2">
                    {jogo.generos && jogo.generos.length > 0 ? (
                      jogo.generos.map(gen => (
                        <span 
                          key={gen.id} 
                          className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                          style={{ 
                            backgroundColor: `${gen.cor}15`, 
                            color: gen.cor, 
                            borderColor: `${gen.cor}30` 
                          }}
                        >
                          {gen.nome}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-txt-muted italic">Nenhum gênero definido</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-primary-600/10 border border-primary-500/20 rounded-[2rem] min-w-[120px]">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1">Nota</h3>
                  <div className="text-5xl font-black text-primary-500">{jogo.nota_pessoal || '0'}</div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} fill={s <= (jogo.nota_pessoal / 2) ? "currentColor" : "none"} className={s <= (jogo.nota_pessoal / 2) ? "text-primary-500" : "text-primary-900"} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Placeholder para mais conteúdo (ex: descrição, reviews, etc) */}
              <div className="bg-dark-900/30 rounded-[2rem] p-8 border border-dark-700/30 flex items-center justify-center border-dashed">
                <p className="text-txt-muted text-sm italic">O Checkpoint está apenas começando. Em breve você poderá adicionar notas pessoais e capturas de tela aqui!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
