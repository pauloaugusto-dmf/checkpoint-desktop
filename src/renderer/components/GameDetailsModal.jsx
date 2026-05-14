import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, Star, Gamepad2, CheckCircle2, ListMinus, Library, Archive, Pause, Edit3, Trash2, Search, Loader2, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'sonner';

import { platforms } from '../js/platforms';
import { calculateDaysLeft } from '../js/dateUtils';

export default function GameDetailsModal({ jogo, onClose, onEdit, onUpdate, icon, iconColorClass, proximoLancamento }) {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!jogo) return null;

  const handleSyncHLTB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading(`Buscando dados completos para "${jogo.titulo}"...`);
    
    try {
      const result = await window.api.fetchHLTB(jogo.titulo);
      if (result) {
        // howlongtobeatpy retorna horas decimais (ex: 60.02)
        // Convertemos para minutos para o nosso banco de dados
        const mainMinutos = Math.round((result.gameplayMain || 0) * 60);
        const extraMinutos = Math.round((result.gameplayMainExtra || 0) * 60);
        const completionistMinutos = Math.round((result.gameplayCompletionist || 0) * 60);
        
        await onUpdate(jogo.id, { 
          tempo_estimado_hltb: mainMinutos,
          hltb_main_extra: extraMinutos,
          hltb_completionist: completionistMinutos
        });
        toast.success('Comparativos sincronizados!', { id: toastId });
      } else {
        toast.error('Nenhum dado encontrado.', { id: toastId });
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro na sincronização.', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (min) => {
    if (!min || isNaN(min)) return '--';
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m > 0 ? m + 'm' : ''}`;
  };

  const getProgressWidth = (bench) => {
    if (!bench || bench <= 0 || !jogo.tempo_jogo_minutos) return 0;
    const p = (jogo.tempo_jogo_minutos / bench) * 100;
    return Math.min(p, 100);
  };




  const plataformaObj = platforms.find(p => p.id === jogo.plataforma);

  const formattedDate = jogo.data_lancamento 
    ? new Date(jogo.data_lancamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Data não definida';

  const horas = Math.floor((jogo.tempo_jogo_minutos || 0) / 60);
  const minutos = (jogo.tempo_jogo_minutos || 0) % 60;

  // Cálculo da Meta Diária (Insight de Produtividade)
  const metaDiaria = useMemo(() => {
    if (jogo.status !== 'Jogando') return null;
    if (!proximoLancamento || !jogo.percentual_conclusao || jogo.percentual_conclusao >= 100) return null;

    const diasRestantes = calculateDaysLeft(proximoLancamento.data_lancamento);
    if (diasRestantes <= 0) return null;

    const tempoAtual = jogo.tempo_jogo_minutos || 0;
    const percentual = jogo.percentual_conclusao;
    
    // Estimativa: se 9h = 50%, então 100% = 18h. Faltam 9h.
    const tempoTotalEstimado = (tempoAtual / percentual) * 100;
    const tempoRestanteMin = tempoTotalEstimado - tempoAtual;
    const minPorDia = tempoRestanteMin / diasRestantes;

    return {
      horas: Math.floor(minPorDia / 60),
      minutos: Math.round(minPorDia % 60),
      dias: diasRestantes,
      proximoTitulo: proximoLancamento.titulo
    };
  }, [jogo, proximoLancamento]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 animate-in fade-in duration-500"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-dark-800 border border-white/10 rounded-[3rem] w-full max-w-6xl h-full max-h-[850px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row animate-in zoom-in-95 duration-500 relative"
      >

        
        {/* Lado Esquerdo: Poster e Ações Rápidas (Fixo) */}
        <div className="w-full md:w-80 bg-dark-900 shrink-0 border-r border-white/5 relative flex flex-col">
          {/* Background Poster Blur */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl scale-150"
            style={{ backgroundImage: `url(${jogo.capa_caminho})`, backgroundSize: 'cover' }}
          />
          
          <div className="relative p-10 flex flex-col h-full z-10">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 group ring-1 ring-white/10">
              <img 
                src={jogo.capa_caminho || 'https://via.placeholder.com/300x450?text=Sem+Capa'} 
                alt={jogo.titulo}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className={`p-2.5 rounded-xl ${iconColorClass} bg-opacity-20`}>
                  {React.cloneElement(icon, { size: 20, className: iconColorClass.replace('bg-', 'text-') })}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-txt-muted tracking-widest">Status</div>
                  <div className="text-sm font-black text-txt-main">{jogo.status}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="p-2.5 rounded-xl bg-primary-500/20 text-primary-500">
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-txt-muted tracking-widest">Plataforma</div>
                  <div className="text-sm font-black text-txt-main">
                    {plataformaObj ? plataformaObj.name : (jogo.plataforma || 'N/A')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 flex gap-3">
              <button 
                onClick={onEdit}
                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20 active:scale-95"
              >
                <Edit3 size={16} /> Editar
              </button>
              <button 
                onClick={onClose}
                className="p-4 bg-dark-700 hover:bg-dark-600 text-white rounded-2xl transition-all border border-white/5 active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Conteúdo Imersivo (Rolável) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-800 relative flex flex-col">
          {/* Banner Hero */}
          <div className="h-80 shrink-0 relative overflow-hidden">
            <img 
              src={jogo.banner_caminho || jogo.capa_caminho} 
              className="w-full h-full object-cover"
              alt="Banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-12 w-full">
              <div className="flex items-center gap-2 mb-4">
                {jogo.generos && jogo.generos.map(g => (
                  <span key={g.id} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20 backdrop-blur-xl shadow-lg" style={{ backgroundColor: `${g.cor}66` }}>
                    {g.nome}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4 drop-shadow-2xl">
                {jogo.titulo}
              </h1>
              <div className="flex items-center gap-6 text-xs font-bold text-white/50 tracking-wide uppercase">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary-500" />
                  {formattedDate}
                </div>
                <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-500" fill="currentColor" />
                  <span className="text-white text-sm">{jogo.nota_pessoal || '0'}</span> / 10
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Conteúdo */}
          <div className="p-12 space-y-10">
            
            {/* 1. Quick Stats (O Principal: Sua Experiência) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest mb-2">Sua Nota</span>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-amber-500" fill="currentColor" />
                  <span className="text-3xl font-black text-white">{jogo.nota_pessoal || '0'}</span>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest mb-2">Seu Tempo</span>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary-500" />
                  <span className="text-2xl font-black text-white">{formatTime(jogo.tempo_jogo_minutos)}</span>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest mb-2">Progresso</span>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-white">{jogo.percentual_conclusao || 0}%</span>
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${jogo.percentual_conclusao || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest mb-2">Lançamento</span>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-xl font-black text-white">
                    {jogo.data_lancamento ? new Date(jogo.data_lancamento).getFullYear() : '----'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Meta Diária / Insight de Produtividade */}
            {metaDiaria && (
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 shrink-0">
                  <Sparkles className="w-8 h-8 text-primary-400 animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-300 mb-1">Missão de Produtividade</h3>
                  <p className="text-txt-main text-lg font-bold leading-tight">
                    Para terminar <span className="text-white">"{jogo.titulo}"</span> antes do lançamento de <span className="text-primary-400">{metaDiaria.proximoTitulo}</span> ({metaDiaria.dias} dias), você precisa jogar:
                  </p>
                </div>
                <div className="bg-dark-900/80 px-8 py-6 rounded-3xl border border-white/10 shadow-2xl min-w-[200px]">
                  <div className="text-3xl font-black text-white flex items-baseline gap-1 justify-center">
                    {metaDiaria.horas > 0 && (
                      <>
                        {metaDiaria.horas}<span className="text-sm text-primary-400 uppercase mr-2">h</span>
                      </>
                    )}
                    {metaDiaria.minutos}<span className="text-sm text-primary-400 uppercase">m</span>
                  </div>
                  <div className="text-[10px] font-black text-txt-muted uppercase tracking-widest text-center mt-1">por dia</div>
                </div>
              </div>
            )}

            {/* 2. Seção Secundária: HLTB (Compacta) */}
            <div className="bg-dark-900/50 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                    <Search size={16} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-txt-main">Referências da Comunidade</h3>
                    <p className="text-[9px] text-txt-muted font-bold uppercase tracking-wider">Médias do HowLongToBeat</p>
                  </div>
                </div>
                <button 
                  onClick={handleSyncHLTB}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-[9px] font-black uppercase tracking-widest text-txt-muted hover:text-white rounded-xl border border-white/5 transition-all"
                >
                  {isSyncing ? 'Buscando...' : 'Atualizar Dados'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'História', val: jogo.tempo_estimado_hltb, color: 'bg-primary-500/50' },
                  { label: 'Extras', val: jogo.hltb_main_extra, color: 'bg-emerald-500/50' },
                  { label: '100%', val: jogo.hltb_completionist, color: 'bg-amber-500/50' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-txt-muted">
                      <span>{item.label}</span>
                      <span className="text-txt-main">{formatTime(item.val)}</span>
                    </div>
                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${getProgressWidth(item.val)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                  jogo.tempo_jogo_minutos >= (jogo.hltb_completionist || 999999) ? 'bg-amber-500/20 text-amber-500' :
                  jogo.tempo_jogo_minutos >= (jogo.tempo_estimado_hltb || 999999) ? 'bg-emerald-500/20 text-emerald-500' :
                  'bg-primary-500/20 text-primary-500'
                }`}>
                  Status Comparativo: {
                    jogo.tempo_jogo_minutos >= (jogo.hltb_completionist || 999999) ? 'Mestre 100%' :
                    jogo.tempo_jogo_minutos >= (jogo.tempo_estimado_hltb || 999999) ? 'Finalizado' :
                    'Em Jornada'
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );


}
