import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Gamepad2, CalendarDays } from 'lucide-react';

export default function CalendarView({ jogos = [], eventos = [], onDayClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'

  const prev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    }
  };

  const next = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    }
  };

  const handleMonthChange = (e) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
  };

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const startYear = Math.max(2020, currentYear - 5);
  const years = Array.from({ length: 15 }, (_, i) => startYear + i);

  const renderMonthGrid = (year, month, isMini = false) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    const remainingDays = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    if (isMini) {
      return (
        <div 
          key={month}
          className="bg-dark-800 rounded-xl p-3 border border-dark-700 hover:border-primary-500/50 hover:bg-dark-700/80 transition-all shadow-md cursor-pointer group flex flex-col h-full" 
          onClick={() => { setCurrentDate(new Date(year, month, 1)); setViewMode('month'); }}
        >
          <h3 className="text-txt-main font-bold mb-1 text-xs text-center group-hover:text-primary-400 transition-colors">{months[month]}</h3>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr items-center">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={`header-${i}`} className="text-center text-[9px] font-bold text-gray-500">
                {d}
              </div>
            ))}
            {days.map((dayObj, idx) => {
              const isToday = dayObj.isCurrentMonth && dayObj.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              
              let cellMonth = month;
              let cellYear = year;
              if (!dayObj.isCurrentMonth) {
                 if (dayObj.day > 15) { cellMonth = month - 1; }
                 else { cellMonth = month + 1; }
                 if (cellMonth < 0) { cellMonth = 11; cellYear--; }
                 if (cellMonth > 11) { cellMonth = 0; cellYear++; }
              }

              const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
              const gamesToday = jogos.filter(j => j.data_lancamento === cellDateStr);
              const eventsToday = eventos.filter(e => e.data_evento === cellDateStr);
              
              const hasGames = gamesToday.length > 0;
              const hasEvents = eventsToday.length > 0;
              
              let bgColorClass = "";
              if (isToday) {
                 bgColorClass = "bg-primary-500 text-white font-bold shadow-sm shadow-primary-500/40";
              } else if (hasGames && hasEvents) {
                 bgColorClass = "bg-yellow-500 text-yellow-950 font-bold shadow-sm shadow-yellow-500/40";
              } else if (hasGames) {
                 bgColorClass = "bg-green-500 text-white font-bold shadow-sm shadow-green-500/40";
              } else if (hasEvents) {
                 bgColorClass = "bg-blue-500 text-white font-bold shadow-sm shadow-blue-500/40";
              } else if (!dayObj.isCurrentMonth) {
                 bgColorClass = "text-gray-600";
              } else {
                 bgColorClass = "text-gray-300 hover:bg-dark-600";
              }

              return (
                <div key={`day-${idx}`} className="flex items-center justify-center relative group/day">
                  <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full transition-colors ${bgColorClass}`}>
                    {dayObj.day}
                  </span>
                  
                  {(hasGames || hasEvents) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[200px] bg-dark-900 border border-dark-600 rounded-lg shadow-xl opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all z-50 p-2 pointer-events-none">
                      {hasGames && (
                        <div className="mb-1.5 last:mb-0 text-left">
                          <div className="text-[9px] text-green-400 font-bold mb-1 uppercase tracking-wider">Jogos</div>
                          {gamesToday.map(g => (
                            <div key={g.id} className="text-[11px] text-txt-main truncate flex items-center gap-1.5 mb-1 last:mb-0">
                              {g.capa_caminho ? (
                                <img src={g.capa_caminho} alt="" className="w-4 h-4 object-cover rounded-sm shrink-0" />
                              ) : (
                                <div className="w-4 h-4 bg-dark-700 rounded-sm shrink-0 flex items-center justify-center">
                                  <Gamepad2 className="w-2.5 h-2.5 text-gray-500" />
                                </div>
                              )}
                              <span className="truncate">{g.titulo}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasEvents && (
                        <div className="text-left">
                          <div className="text-[9px] text-blue-400 font-bold mb-1 uppercase tracking-wider">Eventos</div>
                          {eventsToday.map((e, i) => (
                            <div key={i} className="text-[11px] text-txt-main truncate flex items-center gap-1.5 mb-1 last:mb-0">
                              <div className="w-4 h-4 bg-dark-700 rounded-sm shrink-0 flex items-center justify-center">
                                <CalendarDays className="w-2.5 h-2.5 text-blue-400" />
                              </div>
                              <span className="truncate">{e.titulo}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 bg-dark-600 rounded-xl overflow-hidden shadow-inner border border-dark-600">
        <div className="grid grid-cols-7 gap-px bg-dark-600 border-b border-dark-600">
          {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => (
            <div key={d} className="bg-dark-800 p-4 text-center text-sm font-bold text-txt-muted uppercase tracking-wider">
              {d.substring(0, 3)}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-dark-600 flex-1" style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))` }}>
          {days.map((dayObj, idx) => {
            const isToday = dayObj.isCurrentMonth && dayObj.day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            
            let cellMonth = month;
            let cellYear = year;
            if (!dayObj.isCurrentMonth) {
               if (dayObj.day > 15) { cellMonth = month - 1; }
               else { cellMonth = month + 1; }
               if (cellMonth < 0) { cellMonth = 11; cellYear--; }
               if (cellMonth > 11) { cellMonth = 0; cellYear++; }
            }

            const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
            const gamesToday = jogos.filter(j => j.data_lancamento === cellDateStr);
            const eventsToday = eventos.filter(e => e.data_evento === cellDateStr);

            return (
              <div 
                key={idx} 
                onClick={() => onDayClick && onDayClick(cellDateStr)}
                className={`bg-dark-900 p-2 min-h-0 flex flex-col transition-all group relative overflow-hidden ${dayObj.isCurrentMonth ? 'hover:bg-dark-800 cursor-pointer' : 'opacity-40 hover:bg-dark-800/50 cursor-pointer'}`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold z-10 relative shrink-0 ${!dayObj.isCurrentMonth ? 'text-gray-500' : isToday ? 'text-txt-main bg-primary-500 shadow-lg shadow-primary-500/50' : 'text-gray-300 group-hover:text-txt-main group-hover:bg-dark-700'}`}>
                  {dayObj.day}
                </span>
                <div className="flex-1 mt-1 flex flex-col gap-1 overflow-y-auto pr-1">
                  {gamesToday.map(game => (
                    <div key={game.id} className="text-[10px] font-semibold bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded truncate border border-primary-500/30 flex items-center gap-1 shrink-0" title={game.titulo}>
                      {game.capa_caminho && <img src={game.capa_caminho} alt="" className="w-3 h-3 object-cover rounded-sm shrink-0" />}
                      <span className="truncate">{game.titulo}</span>
                    </div>
                  ))}
                  {eventsToday.map(event => (
                    <div key={event.id} className="text-[10px] font-semibold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded truncate border border-blue-500/30 flex items-center gap-1 shrink-0" title={event.titulo}>
                      <CalendarDays className="w-3 h-3 shrink-0" />
                      <span className="truncate">{event.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto animate-in fade-in duration-300">
      <div className="glass rounded-2xl p-8 flex flex-col shadow-2xl border border-dark-700 min-h-[600px] h-full">
        {/* Calendar Header */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={prev} className="p-3 bg-dark-800 hover:bg-primary-600 rounded-xl text-gray-300 hover:text-txt-main transition-all shadow-md">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-3">
              {viewMode === 'month' && (
                <select value={currentMonth} onChange={handleMonthChange} className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-txt-main font-bold focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none shadow-inner cursor-pointer hover:bg-dark-700 transition-colors">
                  {months.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              )}
              <select value={currentYear} onChange={handleYearChange} className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-txt-main font-bold focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none shadow-inner cursor-pointer hover:bg-dark-700 transition-colors">
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
                {!years.includes(currentYear) && <option value={currentYear}>{currentYear}</option>}
              </select>
            </div>
            <button onClick={next} className="p-3 bg-dark-800 hover:bg-primary-600 rounded-xl text-gray-300 hover:text-txt-main transition-all shadow-md">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-dark-900 rounded-xl p-1 shadow-inner border border-dark-700">
              <button 
                onClick={() => setViewMode('month')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-primary-500 text-white shadow-md' : 'text-txt-muted hover:text-txt-main hover:bg-dark-800'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setViewMode('year')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'year' ? 'bg-primary-500 text-white shadow-md' : 'text-txt-muted hover:text-txt-main hover:bg-dark-800'}`}
              >
                Anual
              </button>
            </div>
            

          </div>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' ? (
          renderMonthGrid(currentYear, currentMonth, false)
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min pb-8">
            {months.map((_, idx) => renderMonthGrid(currentYear, idx, true))}
          </div>
        )}
      </div>
    </div>
  );
}
