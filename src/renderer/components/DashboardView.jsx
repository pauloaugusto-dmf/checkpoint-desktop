import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Gamepad2, Flame, CalendarDays, Dice5, Clock, Trophy, Play, Library, Sparkles, ChevronLeft, ChevronRight, RefreshCw, Star } from 'lucide-react';
import GameCard from './GameCard';
import { platforms } from '../js/platforms';

function MiniBannerCard({ jogo, onGameClick, statusIcons, getIconColorClass }) {
  const plataformaObj = platforms.find(p => p.id === jogo.plataforma);
  return (
    <div 
      onClick={() => onGameClick(jogo)}
      className="relative rounded-2xl overflow-hidden border border-white/5 group hover:border-primary-500/50 transition-all cursor-pointer flex flex-col justify-end p-4 shadow-lg min-h-[140px] flex-1"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-dark-800">
        {jogo.capa_caminho ? (
          <img src={jogo.capa_caminho} alt={jogo.titulo} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-12 h-12 text-dark-600" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent"></div>
      </div>

      {/* Top Right Status Badge */}
      <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 z-10">
        {statusIcons[jogo.status] && React.cloneElement(statusIcons[jogo.status], { className: `w-3.5 h-3.5 ${getIconColorClass(jogo.status)}` })}
        <span className="text-[10px] font-bold text-txt-main">{jogo.status}</span>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col gap-1.5">
        {plataformaObj ? (
          <span className="text-[9px] font-black px-2 py-0.5 rounded shadow-sm w-max uppercase tracking-wider" style={{ backgroundColor: plataformaObj.bgColor, color: plataformaObj.color }}>
            {plataformaObj.name}
          </span>
        ) : (
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-dark-700 text-txt-muted w-max uppercase tracking-wider">
            {jogo.plataforma || 'N/A'}
          </span>
        )}
        <h4 className="text-base font-black text-white line-clamp-2 leading-tight group-hover:text-primary-300 transition-colors">{jogo.titulo}</h4>
        
        {/* Tempo e Progresso na mesma linha */}
        <div className="flex items-center justify-between gap-2 mt-1 pt-1.5 border-t border-white/10 text-[11px] font-bold text-gray-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-txt-muted" />
            {Math.floor((jogo.tempo_jogo_minutos || 0) / 60)}h
          </span>
          {jogo.percentual_conclusao !== undefined && (
            <span className="text-primary-400 font-extrabold">
              {jogo.percentual_conclusao}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardView({ jogos, eventos, onGameClick, statusIcons, getIconColorClass }) {
  
  // 1. Hero Section (Carrossel)
  const jogandoGames = useMemo(() => {
    const list = jogos.filter(j => j.status === 'Jogando');
    // Fallback: se não tiver nenhum jogando, puxar algum pausado ou backlog pra não ficar vazio
    if (list.length === 0) {
      const fallback = jogos.filter(j => j.status === 'Pausado' || j.status === 'Backlog');
      return fallback.length > 0 ? [fallback[0]] : [];
    }
    return list;
  }, [jogos]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroTimerKey, setHeroTimerKey] = useState(0);

  useEffect(() => {
    if (jogandoGames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % jogandoGames.length);
    }, 6000); // Muda a cada 6 segundos
    return () => clearInterval(interval);
  }, [jogandoGames, heroTimerKey]);

  const handlePrevHero = useCallback((e) => {
    e.stopPropagation();
    setCurrentHeroIndex(prev => (prev === 0 ? jogandoGames.length - 1 : prev - 1));
    setHeroTimerKey(k => k + 1);
  }, [jogandoGames.length]);

  const handleNextHero = useCallback((e) => {
    e.stopPropagation();
    setCurrentHeroIndex(prev => (prev + 1) % jogandoGames.length);
    setHeroTimerKey(k => k + 1);
  }, [jogandoGames.length]);

  const handleSelectHero = useCallback((e, idx) => {
    e.stopPropagation();
    setCurrentHeroIndex(idx);
    setHeroTimerKey(k => k + 1);
  }, []);

  // 2. Fila de prioridades (Quase lá)
  const prioridades = useMemo(() => {
    return jogos
      .filter(j => (j.status === 'Pausado' || j.status === 'Jogando') && (j.percentual_conclusao || 0) >= 60 && (j.percentual_conclusao || 0) < 100)
      .sort((a, b) => (b.percentual_conclusao || 0) - (a.percentual_conclusao || 0))
      .slice(0, 4);
  }, [jogos]);

  // 3. Fila Dinâmica (Pausados e Backlog)
  const filaGames = useMemo(() => {
    const prioridadesIds = prioridades.map(p => p.id);
    return jogos.filter(j => (j.status === 'Backlog' || j.status === 'Pausado') && !prioridadesIds.includes(j.id));
  }, [jogos, prioridades]);

  const [displayedFila, setDisplayedFila] = useState([]);
  
  const shuffleFila = useCallback(() => {
    if (filaGames.length === 0) {
      setDisplayedFila([]);
      return;
    }
    const shuffled = [...filaGames].sort(() => 0.5 - Math.random());
    setDisplayedFila(shuffled.slice(0, 4));
  }, [filaGames]);

  useEffect(() => {
    shuffleFila();
    const interval = setInterval(shuffleFila, 15000); // Alterna os jogos a cada 15 segundos automaticamente
    return () => clearInterval(interval);
  }, [shuffleFila]);

  // 4. Radar de Lançamentos e Eventos (Próximos 45 dias separados)
  // Helper para obter a data local no formato YYYY-MM-DD
  const getLocalDateString = (dateObj = new Date()) => {
    return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const { radarLancamentos, radarEventos } = useMemo(() => {
    const today = getLocalDateString();
    const nextMonthDate = new Date();
    nextMonthDate.setDate(nextMonthDate.getDate() + 45);
    const nextMonth = getLocalDateString(nextMonthDate);

    const proximosLancamentos = jogos
      .filter(j => j.data_lancamento && j.data_lancamento >= today && j.data_lancamento <= nextMonth)
      .sort((a, b) => a.data_lancamento.localeCompare(b.data_lancamento))
      .slice(0, 4);
    
    const proximosEventos = eventos
      .filter(e => e.data_evento && e.data_evento >= today && e.data_evento <= nextMonth)
      .sort((a, b) => a.data_evento.localeCompare(b.data_evento))
      .slice(0, 4);
    
    return { radarLancamentos: proximosLancamentos, radarEventos: proximosEventos };
  }, [jogos, eventos]);

  // 5. Roleta do Backlog
  const [roletaGame, setRoletaGame] = useState(null);

  const girarRoleta = useCallback(() => {
    const backlog = jogos.filter(j => j.status === 'Backlog');
    if (backlog.length === 0) {
      setRoletaGame(null);
      return;
    }
    const curtos = backlog.filter(j => j.tempo_estimado_hltb > 0 && j.tempo_estimado_hltb <= 600);
    const arrayToPick = curtos.length > 0 ? curtos : backlog;
    let randomIndex = Math.floor(Math.random() * arrayToPick.length);
    if (arrayToPick.length > 1 && roletaGame) {
      while (arrayToPick[randomIndex].id === roletaGame.id) {
        randomIndex = Math.floor(Math.random() * arrayToPick.length);
      }
    }
    setRoletaGame(arrayToPick[randomIndex]);
  }, [jogos, roletaGame]);

  useEffect(() => {
    setRoletaGame(prev => {
      const backlog = jogos.filter(j => j.status === 'Backlog');
      if (backlog.length === 0) return null;
      if (prev && backlog.some(j => j.id === prev.id)) return prev;
      const curtos = backlog.filter(j => j.tempo_estimado_hltb > 0 && j.tempo_estimado_hltb <= 600);
      const arrayToPick = curtos.length > 0 ? curtos : backlog;
      return arrayToPick[Math.floor(Math.random() * arrayToPick.length)];
    });
  }, [jogos]);

  // 6. Insights
  const stats = useMemo(() => {
    const completed = jogos.filter(j => j.status === 'Completado').length;
    const backlogCount = jogos.filter(j => j.status === 'Backlog').length;
    const totalMinutos = jogos.reduce((acc, j) => acc + (j.tempo_jogo_minutos || 0), 0);
    const totalHoras = Math.floor(totalMinutos / 60);
    return { completed, backlogCount, totalHoras };
  }, [jogos]);

  const formatDayMonth = (dateString) => {
    if (!dateString) return { text: '', day: '', month: '' };
    const date = new Date(dateString + 'T00:00:00');
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
    const monthText = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return {
      text: `${day} de ${monthText}`,
      day,
      month: monthText
    };
  };

  const calculateDaysLeft = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString + 'T00:00:00');
    const diffTime = eventDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative flex flex-col gap-8 custom-scrollbar">
      
      {/* 1. Hero Section Carrossel */}
      {jogandoGames.length > 0 && (
        <section className="relative w-full h-[550px] lg:h-[650px] 2xl:h-[75vh] min-h-[600px] rounded-[32px] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)] group bg-dark-900 border border-white/5">
          {jogandoGames.map((jogo, index) => {
            const isActive = index === currentHeroIndex;
            return (
              <div 
                key={jogo.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer flex flex-col justify-end p-8 md:p-12 lg:p-20 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                onClick={() => onGameClick(jogo)}
              >
                {/* Background Banner */}
                <div className="absolute inset-0">
                  <img 
                    src={jogo.banner_caminho || jogo.capa_caminho} 
                    alt={jogo.titulo} 
                    className={`w-full h-full object-cover transition-transform duration-[15000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/60 to-transparent"></div>
                </div>
                
                {/* Overlay Content */}
                <div className="relative z-20 flex items-end gap-10 transform transition-transform duration-700">
                  
                  {/* Capa do Jogo (Flutuante) */}
                  <div className="w-48 h-64 lg:w-64 lg:h-96 shrink-0 rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/10 hidden md:block group-hover:-translate-y-3 transition-transform duration-500 bg-dark-800">
                    {jogo.capa_caminho ? (
                      <img src={jogo.capa_caminho} alt={`Capa de ${jogo.titulo}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-16 h-16 text-dark-600" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex flex-col items-start gap-4 lg:gap-6 flex-1 pb-4 lg:pb-8">
                    <div className="flex items-center gap-2 bg-primary-500/20 backdrop-blur-md border border-primary-500/50 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                      <Play className="w-4 h-4 lg:w-5 lg:h-5 text-primary-400" fill="currentColor" />
                      <span className="text-xs lg:text-sm font-black text-primary-100 tracking-widest uppercase shadow-sm">Continue Jogando</span>
                    </div>
                    
                    <div className="w-full">
                      <h2 className="text-5xl lg:text-7xl font-black text-white mb-4 lg:mb-6 drop-shadow-xl tracking-tight leading-none line-clamp-2">{jogo.titulo}</h2>
                      <div className="inline-flex flex-wrap items-center gap-4 lg:gap-6 text-sm lg:text-base text-gray-200 font-medium bg-dark-900/60 px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl backdrop-blur-md border border-white/5 shadow-lg">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-txt-muted"/> <span className="font-bold">{Math.floor((jogo.tempo_jogo_minutos || 0) / 60)}h</span> jogadas</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-dark-600"></span>
                        <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500"/> <span className="font-bold">{(jogo.percentual_conclusao || 0)}%</span> concluído</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-dark-600"></span>
                        <span className="font-black tracking-widest text-xs uppercase text-primary-300">{jogo.plataforma || 'N/A'}</span>
                      </div>
                    </div>

                  <div className="w-full max-w-2xl mt-2 group-hover:scale-[1.02] transition-transform origin-left">
                      <div className="flex justify-between text-xs lg:text-sm font-bold text-txt-muted mb-1.5 px-1">
                        <span className="uppercase tracking-widest">Progresso da Campanha</span>
                        <span className="text-primary-400 font-black">{(jogo.percentual_conclusao || 0)}%</span>
                      </div>
                      <div className="h-3 lg:h-4 bg-dark-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full relative" style={{ width: `${jogo.percentual_conclusao || 0}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Controles do Carrossel */}
          {jogandoGames.length > 1 && (
            <div className="absolute bottom-12 right-12 z-30 flex items-center gap-3">
              <button 
                onClick={handlePrevHero}
                className="w-12 h-12 rounded-full bg-dark-800/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary-600 hover:border-primary-500 transition-all hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex gap-2.5 bg-dark-900/60 backdrop-blur-md px-4 py-3 rounded-full border border-white/5">
                {jogandoGames.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => handleSelectHero(e, idx)}
                    className={`h-2.5 rounded-full transition-all ${idx === currentHeroIndex ? 'w-8 bg-primary-500 shadow-[0_0_12px_rgba(var(--primary),0.8)]' : 'w-2.5 bg-dark-600 hover:bg-dark-500'}`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNextHero}
                className="w-12 h-12 rounded-full bg-dark-800/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary-600 hover:border-primary-500 transition-all hover:scale-110 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Listas de Jogos */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* 2. Quase lá (Prioridades) */}
          {prioridades.length > 0 && (
            <section className="bg-dark-800/50 backdrop-blur-xl border border-white/5 p-7 rounded-3xl shadow-xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500/20 p-2 rounded-xl border border-rose-500/30">
                    <Flame className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-black text-txt-main tracking-wide">Foco Final (Quase Lá)</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-5 flex-1">
                {prioridades.map(jogo => (
                  <MiniBannerCard 
                    key={jogo.id} 
                    jogo={jogo} 
                    onGameClick={onGameClick} 
                    statusIcons={statusIcons} 
                    getIconColorClass={getIconColorClass} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* 3. Fila Dinâmica (Pausados e Backlog) */}
          {displayedFila.length > 0 && (
            <section className="bg-dark-800/50 backdrop-blur-xl border border-white/5 p-7 rounded-3xl shadow-xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
                    <Library className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-txt-main tracking-wide">Desenterrando da Fila</h3>
                    <p className="text-xs text-txt-muted font-medium mt-1">Jogos pausados ou no backlog. Rotação a cada 15s.</p>
                  </div>
                </div>
                <button 
                  onClick={shuffleFila} 
                  className="flex items-center gap-2 px-4 py-2 bg-dark-700/50 hover:bg-dark-600 border border-white/5 rounded-xl transition-all text-xs font-bold text-txt-main hover:text-primary-400 group"
                  title="Girar a Fila"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Girar Fila
                </button>
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-5 flex-1">
                {displayedFila.map(jogo => (
                  <MiniBannerCard 
                    key={jogo.id} 
                    jogo={jogo} 
                    onGameClick={onGameClick} 
                    statusIcons={statusIcons} 
                    getIconColorClass={getIconColorClass} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Coluna Direita: Radar, Backlog & Stats */}
        <div className="flex flex-col gap-8">
          
          {/* 5. Insights Premium */}
          <section className="grid grid-cols-2 gap-5">
            <div className="bg-dark-800/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <Trophy className="w-24 h-24 text-yellow-500" />
              </div>
              <Trophy className="w-6 h-6 text-yellow-500 mb-3 relative z-10" />
              <span className="text-4xl font-black text-txt-main relative z-10 drop-shadow-lg">{stats.completed}</span>
              <span className="text-[10px] text-txt-muted font-black uppercase tracking-[0.2em] relative z-10 mt-1">Jogos Zerados</span>
            </div>
            
            <div className="bg-dark-800/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                <Clock className="w-24 h-24 text-primary-500" />
              </div>
              <Clock className="w-6 h-6 text-primary-400 mb-3 relative z-10" />
              <span className="text-4xl font-black text-txt-main relative z-10 drop-shadow-lg">{stats.totalHoras}h</span>
              <span className="text-[10px] text-txt-muted font-black uppercase tracking-[0.2em] relative z-10 mt-1">Tempo Total</span>
            </div>
          </section>

          {/* 6. Roleta do Backlog */}
          {roletaGame && (
            <section className="bg-gradient-to-br from-primary-900/40 to-dark-800/80 backdrop-blur-xl border border-primary-500/30 p-7 rounded-3xl shadow-[0_10px_30px_rgba(var(--primary),0.15)] relative overflow-hidden group cursor-pointer" onClick={() => onGameClick(roletaGame)}>
              <div className="absolute -right-10 -bottom-10 opacity-20 rotate-12 group-hover:rotate-45 group-hover:scale-125 transition-transform duration-700">
                <Dice5 className="w-40 h-40 text-primary-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-500 p-1.5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-[11px] font-black text-primary-300 uppercase tracking-widest shadow-sm">Sugestão do Destino</h3>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      girarRoleta();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-dark-800/80 hover:bg-dark-700 border border-white/10 rounded-xl text-xs font-bold text-primary-300 hover:text-white transition-all shadow-md group/btn"
                    title="Sortear outro jogo"
                  >
                    <RefreshCw className="w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500" />
                    Rolar
                  </button>
                </div>
                <h4 className="text-2xl font-black text-white mb-2 line-clamp-2 drop-shadow-md">{roletaGame.titulo}</h4>
                <p className="text-sm text-primary-200/80 mb-6 font-medium">
                  {roletaGame.tempo_estimado_hltb > 0 
                    ? `Perfeito para o fim de semana: leva só ~${Math.floor(roletaGame.tempo_estimado_hltb / 60)}h para zerar.` 
                    : `Um tesouro escondido no seu backlog. Que tal começar?`}
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-black text-primary-900 bg-primary-400 px-4 py-2 rounded-xl group-hover:bg-primary-300 transition-colors shadow-lg shadow-primary-500/20">
                  Jogar Agora <Play className="w-3 h-3 fill-current" />
                </div>
              </div>
            </section>
          )}

          {/* 4. Radar (Dividido) */}
          <section className="bg-dark-800/50 backdrop-blur-xl border border-white/5 p-7 rounded-3xl shadow-xl flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30">
                <CalendarDays className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-txt-main tracking-wide">Radar</h3>
            </div>
            
            {/* Lançamentos de Jogos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Gamepad2 className="w-4 h-4 text-txt-muted" />
                <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Próximos Lançamentos</h4>
              </div>
              {radarLancamentos.length > 0 ? (
                <div className="space-y-3">
                  {radarLancamentos.map(jogo => {
                    const daysLeft = calculateDaysLeft(jogo.data_lancamento);
                    return (
                      <div key={jogo.id} className="flex items-center gap-3 bg-dark-900/60 p-2 rounded-2xl border border-white/5 hover:border-primary-500/30 hover:bg-dark-700/60 transition-all cursor-pointer group" onClick={() => onGameClick(jogo)}>
                        <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 shadow-md bg-dark-800 border border-white/5 relative">
                          {jogo.capa_caminho ? (
                            <img src={jogo.capa_caminho} alt={jogo.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-6 h-6 text-dark-600" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h4 className="text-sm font-bold text-txt-main truncate group-hover:text-primary-400 transition-colors">{jogo.titulo}</h4>
                          <span className="text-[10px] text-txt-muted font-bold uppercase">{formatDayMonth(jogo.data_lancamento).text}</span>
                        </div>
                        <div className="shrink-0 pr-2">
                          <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider ${daysLeft === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-dark-800 text-txt-muted border border-white/5'}`}>
                            {daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-txt-muted italic bg-dark-900/30 p-3 rounded-xl border border-white/5 border-dashed">Nenhum lançamento nos próximos 45 dias.</p>
              )}
            </div>

            {/* Eventos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-txt-muted" />
                <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Próximos Eventos</h4>
              </div>
              {radarEventos.length > 0 ? (
                <div className="space-y-3">
                  {radarEventos.map(evento => {
                    const daysLeft = calculateDaysLeft(evento.data_evento);
                    return (
                      <div key={evento.id} className="flex items-center gap-3 bg-dark-900/60 p-2.5 rounded-2xl border border-white/5 hover:border-amber-500/30 hover:bg-dark-700/60 transition-all cursor-default group">
                        <div className="flex flex-col items-center justify-center bg-dark-800 rounded-xl w-12 h-12 shrink-0 border border-white/5 shadow-inner group-hover:bg-amber-500/10 transition-colors">
                          <span className="text-[9px] text-txt-muted uppercase font-black tracking-wider group-hover:text-amber-400/80 transition-colors">{formatDayMonth(evento.data_evento).month}</span>
                          <span className="text-base font-black text-txt-main leading-none mt-0.5 group-hover:text-amber-400 transition-colors">{formatDayMonth(evento.data_evento).day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-txt-main truncate group-hover:text-amber-400 transition-colors">{evento.titulo}</h4>
                        </div>
                        <div className="shrink-0 pr-2">
                          <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider ${daysLeft === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-dark-800 text-txt-muted border border-white/5'}`}>
                            {daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-txt-muted italic bg-dark-900/30 p-3 rounded-xl border border-white/5 border-dashed">Nenhum evento nos próximos 45 dias.</p>
              )}
            </div>

          </section>

        </div>
      </div>
    </div>
  );
}
