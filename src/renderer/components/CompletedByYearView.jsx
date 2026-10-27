import React, { useState, useMemo } from 'react';
import { Trophy, Calendar, Clock, Star, Gamepad2, ChevronLeft, ChevronRight, Search, Award, Sparkles, Filter, AlertCircle, ArrowUpDown } from 'lucide-react';
import { platforms } from '../js/platforms';

export default function CompletedByYearView({ jogos, onGameClick, getIconColorClass }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, score, time, alpha

  // 1. Jogos finalizados que possuem data de finalização
  const completedWithDate = useMemo(() => {
    return jogos.filter(j => j.data_finalizacao && j.data_finalizacao.trim().length >= 4);
  }, [jogos]);

  // 2. Jogos marcados como Completados mas sem data de finalização
  const completedWithoutDate = useMemo(() => {
    return jogos.filter(j => j.status === 'Completado' && (!j.data_finalizacao || !j.data_finalizacao.trim()));
  }, [jogos]);

  // 3. Extrair anos distintos dos jogos ordenados cronologicamente (crescente: 2024, 2025, 2026...)
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    completedWithDate.forEach(j => {
      const year = j.data_finalizacao.substring(0, 4);
      if (/^\d{4}$/.test(year)) {
        yearsSet.add(year);
      }
    });

    const currentYear = new Date().getFullYear().toString();
    if (!yearsSet.has(currentYear)) {
      yearsSet.add(currentYear);
    }

    return Array.from(yearsSet).sort((a, b) => a.localeCompare(b));
  }, [completedWithDate]);

  // Estado do ano ativo (padrão: o ano atual ou o mais recente da lista)
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear().toString();
    return availableYears.includes(currentYear) 
      ? currentYear 
      : (availableYears[availableYears.length - 1] || currentYear);
  });

  // Jogos do ano selecionado
  const yearGames = useMemo(() => {
    let list = completedWithDate.filter(j => j.data_finalizacao.startsWith(selectedYear));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(j => j.titulo.toLowerCase().includes(term));
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'date-desc') return (b.data_finalizacao || '').localeCompare(a.data_finalizacao || '');
      if (sortBy === 'date-asc') return (a.data_finalizacao || '').localeCompare(b.data_finalizacao || '');
      if (sortBy === 'score') return (b.nota_pessoal || 0) - (a.nota_pessoal || 0);
      if (sortBy === 'time') return (b.tempo_jogo_minutos || 0) - (a.tempo_jogo_minutos || 0);
      if (sortBy === 'alpha') return a.titulo.localeCompare(b.titulo);
      return 0;
    });
  }, [completedWithDate, selectedYear, searchTerm, sortBy]);

  // Métricas do ano atual
  const stats = useMemo(() => {
    const total = yearGames.length;
    const totalMinutos = yearGames.reduce((acc, j) => acc + (j.tempo_jogo_minutos || 0), 0);
    const totalHoras = Math.floor(totalMinutos / 60);
    
    const jogosComNota = yearGames.filter(j => (j.nota_pessoal || 0) > 0);
    const mediaNota = jogosComNota.length > 0
      ? (jogosComNota.reduce((acc, j) => acc + j.nota_pessoal, 0) / jogosComNota.length).toFixed(1)
      : '0.0';

    const platinas = yearGames.filter(j => (j.percentual_conclusao || 0) >= 100).length;

    return { total, totalHoras, mediaNota, platinas };
  }, [yearGames]);

  // Função para navegar entre anos (cronológico crescente)
  const handlePrevYear = () => {
    const idx = availableYears.indexOf(selectedYear);
    if (idx > 0) setSelectedYear(availableYears[idx - 1]);
  };

  const handleNextYear = () => {
    const idx = availableYears.indexOf(selectedYear);
    if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header com Seletor de Ano */}
      <div className="bg-dark-800/80 border border-white/5 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-txt-main tracking-tight flex items-center gap-2">
              Jogos Finalizados por Ano
            </h1>
            <p className="text-xs text-txt-muted mt-0.5">
              Seu histórico e retrospectiva de conquistas ano a ano
            </p>
          </div>
        </div>

        {/* Seletor Visual de Ano */}
        <div className="flex items-center gap-2 bg-dark-900 p-1.5 rounded-2xl border border-dark-700/80">
          <button
            onClick={handlePrevYear}
            disabled={availableYears.indexOf(selectedYear) <= 0}
            className="p-2 text-txt-muted hover:text-txt-main disabled:opacity-30 disabled:hover:text-txt-muted transition-colors rounded-xl hover:bg-dark-800 cursor-pointer disabled:cursor-not-allowed"
            title="Ano Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 overflow-x-auto max-w-[360px] custom-scrollbar px-1">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedYear === year
                    ? 'bg-emerald-500 text-dark-900 shadow-md shadow-emerald-500/20'
                    : 'text-txt-muted hover:text-txt-main hover:bg-dark-800'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextYear}
            disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
            className="p-2 text-txt-muted hover:text-txt-main disabled:opacity-30 disabled:hover:text-txt-muted transition-colors rounded-xl hover:bg-dark-800 cursor-pointer disabled:cursor-not-allowed"
            title="Próximo Ano"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Cards de Métricas do Ano Selecionado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest">Jogos Zerados</span>
            <div className="text-3xl font-black text-white mt-1">{stats.total}</div>
            <p className="text-[11px] text-emerald-400 font-bold mt-1">
              No ano de {selectedYear}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-800/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest">Tempo Investido</span>
            <div className="text-3xl font-black text-white mt-1">{stats.totalHoras}h</div>
            <p className="text-[11px] text-txt-muted font-bold mt-1">Em jogos concluídos</p>
          </div>
          <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-800/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest">Nota Média</span>
            <div className="text-3xl font-black text-white mt-1">{stats.mediaNota}</div>
            <p className="text-[11px] text-amber-400 font-bold mt-1">Satisfação pessoal</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Star className="w-6 h-6" fill="currentColor" />
          </div>
        </div>

        <div className="bg-dark-800/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest">100% Concluídos</span>
            <div className="text-3xl font-black text-white mt-1">{stats.platinas}</div>
            <p className="text-[11px] text-purple-400 font-bold mt-1">Taxa de platinas</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Aviso se houver jogos completados sem data */}
      {completedWithoutDate.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Você tem {completedWithoutDate.length} {completedWithoutDate.length === 1 ? 'jogo completado' : 'jogos completados'} sem data de finalização
              </h4>
              <p className="text-xs text-amber-400/80">
                Abra esses jogos para definir o dia em que zerou e incluí-los na retrospectiva anual.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {completedWithoutDate.slice(0, 3).map(j => (
              <button
                key={j.id}
                onClick={() => onGameClick(j)}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold px-3 py-1 rounded-lg transition-colors truncate max-w-[150px]"
              >
                + {j.titulo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Barra de Busca e Ordenação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-800/40 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
          <input
            type="text"
            placeholder={`Buscar jogos de ${selectedYear}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm text-txt-main focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-txt-muted shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-xs font-bold text-txt-main focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
          >
            <option value="date-desc">Data Finalização (Mais recente)</option>
            <option value="date-asc">Data Finalização (Mais antigo)</option>
            <option value="score">Maior Nota</option>
            <option value="time">Mais Tempo Jogado</option>
            <option value="alpha">A-Z</option>
          </select>
        </div>
      </div>

      {/* 5. Grade de Jogos Finalizados */}
      {yearGames.length === 0 ? (
        <div className="bg-dark-800/30 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-dark-800 rounded-2xl text-txt-muted">
            <Trophy className="w-10 h-10 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-txt-main">
            {searchTerm ? 'Nenhum jogo encontrado para esta busca' : `Nenhum jogo finalizado em ${selectedYear}`}
          </h3>
          <p className="text-xs text-txt-muted max-w-sm">
            Ao cadastrar ou editar um jogo concluído, preencha o campo "Data de Conclusão" para acompanhar suas vitórias aqui!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {yearGames.map(jogo => {
            const plataformaObj = platforms.find(p => p.id === jogo.plataforma);
            const dataFinalStr = formatDateDisplay(jogo.data_finalizacao);

            return (
              <div
                key={jogo.id}
                onClick={() => onGameClick(jogo)}
                className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                {/* Imagem de Capa */}
                <div className="aspect-[3/4] relative overflow-hidden bg-dark-900">
                  {jogo.capa_caminho ? (
                    <img
                      src={jogo.capa_caminho}
                      alt={jogo.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-600">
                      <Gamepad2 className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-90" />

                  {/* Selo com Data de Finalização */}
                  <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-black text-emerald-300 capitalize">
                      {dataFinalStr}
                    </span>
                  </div>

                  {/* Nota */}
                  {jogo.nota_pessoal > 0 && (
                    <div className="absolute top-3 right-3 bg-dark-900/90 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                      <span className="text-[11px] font-black text-white">{jogo.nota_pessoal}</span>
                    </div>
                  )}

                  {/* Plataforma */}
                  <div className="absolute bottom-3 left-3">
                    {plataformaObj ? (
                      <span
                        className="text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider"
                        style={{ backgroundColor: plataformaObj.bgColor, color: plataformaObj.color }}
                      >
                        {plataformaObj.name}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-dark-700 text-txt-muted uppercase tracking-wider">
                        {jogo.plataforma || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-dark-800">
                  <h4 className="font-bold text-sm text-txt-main group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {jogo.titulo}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-txt-muted pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-txt-muted" />
                      {Math.floor((jogo.tempo_jogo_minutos || 0) / 60)}h
                    </span>

                    {jogo.percentual_conclusao !== undefined && (
                      <span className="font-extrabold text-emerald-400">
                        {jogo.percentual_conclusao}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
