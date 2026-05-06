import React from 'react';
import { Gamepad2, LayoutGrid, Pause, Archive, CheckCircle2, ListMinus, Library, CalendarDays, BarChart3, Settings, Sparkles, TrendingUp, Star, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import NavItem from './NavItem';

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  activeFilter, 
  setActiveFilter, 
  sectionsExpanded, 
  setSectionsExpanded,
  getIconColorClass,
  setIsReleaseNotesOpen
}) {
  const menuIcons = {
    'Todos os Jogos': <LayoutGrid />,
    'Jogando': <Gamepad2 />,
    'Pausado': <Pause />,
    'Backlog': <Archive />,
    'Completado': <CheckCircle2 />,
    'Abandonado': <ListMinus />,
    'Lista de Desejos': <Library />,
    'Calendário': <CalendarDays />,
    'Estatísticas': <BarChart3 />,
    'Configurações': <Settings />,
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} glass flex flex-col border-r border-dark-700 transition-all duration-300 relative z-20`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-dark-800 border border-dark-600 rounded-full p-1 text-txt-muted hover:text-txt-main hover:bg-primary-600 hover:border-primary-500 transition-all z-50 shadow-lg"
        title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`py-6 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6 gap-3'}`}>
        <div className="bg-primary-500 p-2 rounded-lg shrink-0">
          <Gamepad2 className="text-txt-main w-6 h-6" />
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-wider text-txt-main truncate">CHECKPOINT</h1>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar pb-10">
        <div className={isCollapsed ? 'mb-2' : 'mb-6'}>
          <NavItem 
            icon={menuIcons['Calendário']} 
            label="Calendário" 
            active={activeFilter === 'Calendário'} 
            onClick={() => setActiveFilter('Calendário')} 
            isCollapsed={isCollapsed}
            colorClass="text-primary-500"
            className={`border-primary-500/20 ${isCollapsed ? 'bg-transparent border-0' : 'bg-primary-500/5 border py-3'}`}
          />
        </div>

        <div className="space-y-1">
          {!isCollapsed && (
            <button 
              onClick={() => setSectionsExpanded(p => ({ ...p, library: !p.library }))}
              className="w-full flex items-center justify-between py-2 px-3 mb-1 group transition-colors hover:bg-dark-700/50 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className={`w-4 h-4 ${activeFilter === 'Todos os Jogos' ? 'text-primary-500' : 'text-txt-muted'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-txt-muted/80">Biblioteca</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-txt-muted/50 transition-transform duration-300 ${sectionsExpanded.library ? '' : '-rotate-90'}`} />
            </button>
          )}
          
          {(sectionsExpanded.library || isCollapsed) && (
            <div className={`space-y-1 ${!isCollapsed ? 'ml-3 border-l border-dark-700/50 pl-2' : ''} animate-in fade-in slide-in-from-top-1 duration-200`}>
              <NavItem 
                icon={menuIcons['Todos os Jogos']} 
                label="Todos os Jogos" 
                active={activeFilter === 'Todos os Jogos'} 
                onClick={() => setActiveFilter('Todos os Jogos')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Todos os Jogos')}
              />
              <NavItem 
                icon={menuIcons['Jogando']} 
                label="Jogando" 
                active={activeFilter === 'Jogando'} 
                onClick={() => setActiveFilter('Jogando')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Jogando')}
              />
              <NavItem 
                icon={menuIcons['Pausado']} 
                label="Pausados" 
                active={activeFilter === 'Pausados'} 
                onClick={() => setActiveFilter('Pausados')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Pausado')}
              />
              <NavItem 
                icon={menuIcons['Backlog']} 
                label="Backlog" 
                active={activeFilter === 'Backlog'} 
                onClick={() => setActiveFilter('Backlog')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Backlog')}
              />
              <NavItem 
                icon={menuIcons['Completado']} 
                label="Completados" 
                active={activeFilter === 'Completados'} 
                onClick={() => setActiveFilter('Completados')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Completado')}
              />
              <NavItem 
                icon={menuIcons['Lista de Desejos']} 
                label="Lista de Desejos" 
                active={activeFilter === 'Lista de Desejos'} 
                onClick={() => setActiveFilter('Lista de Desejos')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Lista de Desejos')}
              />
              <NavItem 
                icon={menuIcons['Abandonado']} 
                label="Abandonados" 
                active={activeFilter === 'Abandonados'} 
                onClick={() => setActiveFilter('Abandonados')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Abandonado')}
              />
            </div>
          )}
        </div>

        {!isCollapsed && <div className="h-px bg-dark-700/50 my-4 mx-2"></div>}

        <div className="space-y-1">
          {!isCollapsed && (
            <button 
              onClick={() => setSectionsExpanded(p => ({ ...p, smart: !p.smart }))}
              className="w-full flex items-center justify-between py-2 px-3 mb-1 group transition-colors hover:bg-dark-700/50 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-txt-muted/80">Smart Collections</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-txt-muted/50 transition-transform duration-300 ${sectionsExpanded.smart ? '' : '-rotate-90'}`} />
            </button>
          )}

          {(sectionsExpanded.smart || isCollapsed) && (
            <div className={`space-y-1 ${!isCollapsed ? 'ml-3 border-l border-dark-700/50 pl-2' : ''} animate-in fade-in slide-in-from-top-1 duration-200`}>
              <NavItem 
                icon={<TrendingUp className="w-5 h-5" />} 
                label="Para Terminar" 
                active={activeFilter === 'Para Terminar'} 
                onClick={() => setActiveFilter('Para Terminar')} 
                isCollapsed={isCollapsed}
                colorClass="text-blue-400"
              />
              <NavItem 
                icon={<Star className="w-5 h-5" />} 
                label="Obras-Primas" 
                active={activeFilter === 'Obras-Primas'} 
                onClick={() => setActiveFilter('Obras-Primas')} 
                isCollapsed={isCollapsed}
                colorClass="text-yellow-400"
              />
              <NavItem 
                icon={<Clock className="w-5 h-5" />} 
                label="Mais Jogados" 
                active={activeFilter === 'Mais Jogados'} 
                onClick={() => setActiveFilter('Mais Jogados')} 
                isCollapsed={isCollapsed}
                colorClass="text-purple-400"
              />
              <NavItem 
                icon={<Archive className="w-5 h-5" />} 
                label="Prioridade Backlog" 
                active={activeFilter === 'Prioridade Backlog'} 
                onClick={() => setActiveFilter('Prioridade Backlog')} 
                isCollapsed={isCollapsed}
                colorClass="text-rose-400"
              />
            </div>
          )}
        </div>

        {!isCollapsed && <div className="h-px bg-dark-700/50 my-4 mx-2"></div>}

        <div className="space-y-1">
          {!isCollapsed && (
            <button 
              onClick={() => setSectionsExpanded(p => ({ ...p, tools: !p.tools }))}
              className="w-full flex items-center justify-between py-2 px-3 mb-1 group transition-colors hover:bg-dark-700/50 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-txt-muted" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-txt-muted/80">Sistema</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-txt-muted/50 transition-transform duration-300 ${sectionsExpanded.tools ? '' : '-rotate-90'}`} />
            </button>
          )}

          {(sectionsExpanded.tools || isCollapsed) && (
            <div className={`space-y-1 ${!isCollapsed ? 'ml-3 border-l border-dark-700/50 pl-2' : ''} animate-in fade-in slide-in-from-top-1 duration-200`}>
              <NavItem 
                icon={menuIcons['Estatísticas']} 
                label="Estatísticas" 
                active={activeFilter === 'Estatísticas'} 
                onClick={() => setActiveFilter('Estatísticas')} 
                isCollapsed={isCollapsed}
                colorClass="text-amber-500"
              />
              <NavItem 
                icon={<Sparkles className="w-5 h-5" />} 
                label="Novidades" 
                active={false} 
                onClick={() => setIsReleaseNotesOpen(true)} 
                isCollapsed={isCollapsed}
                colorClass="text-emerald-500"
              />
              <NavItem 
                icon={menuIcons['Configurações']} 
                label="Configurações" 
                active={activeFilter === 'Configurações'} 
                onClick={() => setActiveFilter('Configurações')} 
                isCollapsed={isCollapsed}
                colorClass={getIconColorClass('Configurações')}
              />
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
