import React, { useState, useEffect } from 'react';
import { Gamepad2, LayoutGrid, CheckCircle2, ListMinus, Library, Plus, X, Trash2, Minus, Square, CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Archive, Pause, PanelLeftClose, PanelLeft, Menu, Settings, Download, Upload, Palette, Star, Clock, Edit3, Search, Sparkles, BarChart3, TrendingUp } from 'lucide-react';
import { platforms } from './js/platforms';
import TitleBar from './components/TitleBar';
import NavItem from './components/NavItem';
import GameCard from './components/GameCard';
import GameModal from './components/GameModal';
import EventModal from './components/EventModal';
import DayDetailsModal from './components/DayDetailsModal';
import GameDetailsModal from './components/GameDetailsModal';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import StatisticsView from './components/StatisticsView';
import ReleaseNotesModal from './components/ReleaseNotesModal';
import { releaseNotes } from './js/releaseNotes';

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailsModalOpen, setIsDayDetailsModalOpen] = useState(false);
  const [editingJogo, setEditingJogo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterGenero, setFilterGenero] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [activeFilter, setActiveFilter] = useState('Todos os Jogos');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    library: true,
    smart: true,
    tools: true
  });
  const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('violet');
  const [displayMode, setDisplayMode] = useState('dark'); // 'dark' or 'light'
  const [iconStyle, setIconStyle] = useState('status'); // 'monochrome', 'accent', 'status'
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('checkpoint-theme') || 'violet';
    const savedDisplayMode = localStorage.getItem('checkpoint-display-mode') || 'dark';
    const savedIconStyle = localStorage.getItem('checkpoint-icon-style') || 'status';
    
    setCurrentTheme(savedTheme);
    setDisplayMode(savedDisplayMode);
    setIconStyle(savedIconStyle);
    
    applyTheme(savedTheme);
    applyDisplayMode(savedDisplayMode);
    carregarDados();

    // Verifica atualização de versão para mostrar Novidades
    const lastVersion = localStorage.getItem('checkpoint-last-version');
    const currentVersion = releaseNotes[0].version;
    if (lastVersion !== currentVersion) {
      setIsReleaseNotesOpen(true);
      localStorage.setItem('checkpoint-last-version', currentVersion);
    }
  }, []);

  const themes = {
    violet: { name: 'Violeta', colors: { '500': '99 102 241', '600': '79 70 229' }, bg: 'bg-[#6366f1]' },
    emerald: { name: 'Esmeralda', colors: { '500': '16 185 129', '600': '5 150 105' }, bg: 'bg-[#10b981]' },
    rose: { name: 'Rosa', colors: { '500': '244 63 94', '600': '225 29 72' }, bg: 'bg-[#f43f5e]' },
    amber: { name: 'Âmbar', colors: { '500': '245 158 11', '600': '217 119 6' }, bg: 'bg-[#f59e0b]' },
    sky: { name: 'Céu', colors: { '500': '14 165 233', '600': '2 132 199' }, bg: 'bg-[#0ea5e9]' },
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    document.documentElement.style.setProperty('--primary-500', theme.colors['500']);
    document.documentElement.style.setProperty('--primary-600', theme.colors['600']);
    localStorage.setItem('checkpoint-theme', themeName);
    setCurrentTheme(themeName);
  };

  const applyDisplayMode = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('checkpoint-display-mode', mode);
    setDisplayMode(mode);
  };

  const applyIconStyle = (style) => {
    localStorage.setItem('checkpoint-icon-style', style);
    setIconStyle(style);
  };

  const carregarDados = async () => {
    try {
      if (window.api) {
        const dataJogos = await window.api.getJogos();
        setJogos(dataJogos);
        const dataGeneros = await window.api.getGeneros();
        setGeneros(dataGeneros);
        const dataEventos = window.api.getEventos ? await window.api.getEventos() : [];
        setEventos(dataEventos);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingJogo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jogo) => {
    setEditingJogo(jogo);
    setIsModalOpen(true);
  };

  const handleSalvarJogo = async (jogoData) => {
    try {
      if (window.api) {
        let resultId;
        if (editingJogo && editingJogo.id) {
          await window.api.updateJogo(editingJogo.id, jogoData);
          resultId = editingJogo.id;
        } else {
          resultId = await window.api.addJogo(jogoData);
        }
        
        // Recarregar todos os dados
        const dataJogos = await window.api.getJogos();
        setJogos(dataJogos);
        
        // Se estávamos editando, atualizar o objeto de edição para refletir no Detalhes
        if (resultId) {
          const updatedJogo = dataJogos.find(j => j.id === resultId);
          if (updatedJogo) setEditingJogo(updatedJogo);
        }

        const dataEventos = window.api.getEventos ? await window.api.getEventos() : [];
        setEventos(dataEventos);
        
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
      alert("Erro ao salvar jogo.");
    }
  };

  const handleExcluirJogo = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este jogo da sua biblioteca?")) return;
    try {
      if (window.api) {
        await window.api.deleteJogo(id);
        await carregarDados();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
    }
  };

  const handleSalvarEvento = async (eventoData) => {
    try {
      if (window.api && window.api.addEvento) {
        await window.api.addEvento(eventoData);
        await carregarDados();
        setIsEventModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento.");
    }
  };

  const getIconColorClass = (status) => {
    if (iconStyle === 'monochrome') return 'text-txt-muted';
    if (iconStyle === 'accent') return 'text-primary-500';
    
    // Default 'status' mode
    const statusColors = {
      'Jogando': 'text-blue-400',
      'Pausado': 'text-pink-400',
      'Backlog': 'text-purple-400',
      'Completado': 'text-green-400',
      'Abandonado': 'text-red-400',
      'Lista de Desejos': 'text-yellow-400',
      'default': 'text-primary-500'
    };
    return statusColors[status] || statusColors['default'];
  };

  const statusIcons = {
    'Jogando': <Gamepad2 />,
    'Pausado': <Pause />,
    'Backlog': <Archive />,
    'Completado': <CheckCircle2 />,
    'Abandonado': <ListMinus />,
    'Lista de Desejos': <Library />,
  };

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

  const jogosFiltrados = jogos
    .filter(jogo => {
      let matchesSidebar = false;
      
      // Filtros Normais
      if (activeFilter === 'Todos os Jogos') matchesSidebar = true;
      else if (activeFilter === 'Jogando') matchesSidebar = jogo.status === 'Jogando';
      else if (activeFilter === 'Pausados') matchesSidebar = jogo.status === 'Pausado';
      else if (activeFilter === 'Backlog') matchesSidebar = jogo.status === 'Backlog';
      else if (activeFilter === 'Completados') matchesSidebar = jogo.status === 'Completado';
      else if (activeFilter === 'Lista de Desejos') matchesSidebar = jogo.status === 'Lista de Desejos';
      else if (activeFilter === 'Abandonados') matchesSidebar = jogo.status === 'Abandonado';
      
      // Coleções Inteligentes
      else if (activeFilter === 'Para Terminar') {
        matchesSidebar = jogo.status !== 'Completado' && (jogo.percentual_conclusao || 0) >= 70;
      }
      else if (activeFilter === 'Obras-Primas') {
        matchesSidebar = (jogo.nota_pessoal || 0) >= 9;
      }
      else if (activeFilter === 'Mais Jogados') {
        // Ordenar por tempo e pegar top 10 (isso é feito depois no sort, mas aqui filtramos quem tem tempo)
        matchesSidebar = (jogo.tempo_jogo_minutos || 0) > 0;
      }
      else if (activeFilter === 'Prioridade Backlog') {
        matchesSidebar = jogo.status === 'Backlog' && (jogo.nota_pessoal || 0) >= 8;
      }
      
      const matchesSearch = jogo.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Todos' || jogo.status === filterStatus;
      const matchesGenero = filterGenero === 'Todos' || (jogo.generos && jogo.generos.some(g => g.nome === filterGenero));
      
      return matchesSidebar && matchesSearch && matchesStatus && matchesGenero;
    })
    .sort((a, b) => {
      if (sortBy === 'alpha') return a.titulo.localeCompare(b.titulo);
      if (sortBy === 'score') return (b.nota_pessoal || 0) - (a.nota_pessoal || 0);
      if (sortBy === 'progress') return (b.percentual_conclusao || 0) - (a.percentual_conclusao || 0);
      if (sortBy === 'time') return (b.tempo_jogo_minutos || 0) - (a.tempo_jogo_minutos || 0);
      return b.id - a.id; // Recent
    });

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-txt-main font-sans">
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} glass flex flex-col border-r border-dark-700 transition-all duration-300 relative z-20`}>
        {/* Toggle Button Overlapping Border */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-7 bg-dark-800 border border-dark-600 rounded-full p-1 text-txt-muted hover:text-txt-main hover:bg-primary-600 hover:border-primary-500 transition-all z-50 shadow-lg"
          title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`py-6 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6 gap-3'}`}>
          <div className="bg-primary-500 p-2 rounded-lg shrink-0">
            <Gamepad2 className="text-txt-main w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold tracking-wider text-txt-main truncate">CHECKPOINT</h1>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar pb-10">
          {/* DESTAQUE: CALENDÁRIO */}
          <div className={isSidebarCollapsed ? 'mb-2' : 'mb-6'}>
            <NavItem 
              icon={menuIcons['Calendário']} 
              label="Calendário" 
              active={activeFilter === 'Calendário'} 
              onClick={() => setActiveFilter('Calendário')} 
              isCollapsed={isSidebarCollapsed}
              colorClass="text-primary-500"
              className={`border-primary-500/20 ${isSidebarCollapsed ? 'bg-transparent border-0' : 'bg-primary-500/5 border py-3'}`}
            />
          </div>

          {/* SEÇÃO: BIBLIOTECA */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
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
            
            {(sectionsExpanded.library || isSidebarCollapsed) && (
              <div className={`space-y-1 ${!isSidebarCollapsed ? 'ml-3 border-l border-dark-700/50 pl-2' : ''} animate-in fade-in slide-in-from-top-1 duration-200`}>
                <NavItem 
                  icon={menuIcons['Todos os Jogos']} 
                  label="Todos os Jogos" 
                  active={activeFilter === 'Todos os Jogos'} 
                  onClick={() => setActiveFilter('Todos os Jogos')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Todos os Jogos')}
                />
                <NavItem 
                  icon={menuIcons['Jogando']} 
                  label="Jogando" 
                  active={activeFilter === 'Jogando'} 
                  onClick={() => setActiveFilter('Jogando')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Jogando')}
                />
                <NavItem 
                  icon={menuIcons['Pausado']} 
                  label="Pausados" 
                  active={activeFilter === 'Pausados'} 
                  onClick={() => setActiveFilter('Pausados')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Pausado')}
                />
                <NavItem 
                  icon={menuIcons['Backlog']} 
                  label="Backlog" 
                  active={activeFilter === 'Backlog'} 
                  onClick={() => setActiveFilter('Backlog')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Backlog')}
                />
                <NavItem 
                  icon={menuIcons['Completado']} 
                  label="Completados" 
                  active={activeFilter === 'Completados'} 
                  onClick={() => setActiveFilter('Completados')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Completado')}
                />
                <NavItem 
                  icon={menuIcons['Lista de Desejos']} 
                  label="Lista de Desejos" 
                  active={activeFilter === 'Lista de Desejos'} 
                  onClick={() => setActiveFilter('Lista de Desejos')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Lista de Desejos')}
                />
                <NavItem 
                  icon={menuIcons['Abandonado']} 
                  label="Abandonados" 
                  active={activeFilter === 'Abandonados'} 
                  onClick={() => setActiveFilter('Abandonados')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Abandonado')}
                />
              </div>
            )}
          </div>

          {!isSidebarCollapsed && <div className="h-px bg-dark-700/50 my-4 mx-2"></div>}

          {/* SEÇÃO: COLEÇÕES INTELIGENTES */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
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

            {(sectionsExpanded.smart || isSidebarCollapsed) && (
              <div className={`space-y-1 ${!isSidebarCollapsed ? 'ml-3 border-l border-dark-700/50 pl-2' : ''} animate-in fade-in slide-in-from-top-1 duration-200`}>
                <NavItem 
                  icon={<TrendingUp className="w-5 h-5" />} 
                  label="Para Terminar" 
                  active={activeFilter === 'Para Terminar'} 
                  onClick={() => setActiveFilter('Para Terminar')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass="text-blue-400"
                />
                <NavItem 
                  icon={<Star className="w-5 h-5" />} 
                  label="Obras-Primas" 
                  active={activeFilter === 'Obras-Primas'} 
                  onClick={() => setActiveFilter('Obras-Primas')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass="text-yellow-400"
                />
                <NavItem 
                  icon={<Clock className="w-5 h-5" />} 
                  label="Mais Jogados" 
                  active={activeFilter === 'Mais Jogados'} 
                  onClick={() => setActiveFilter('Mais Jogados')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass="text-purple-400"
                />
                <NavItem 
                  icon={<Archive className="w-5 h-5" />} 
                  label="Prioridade Backlog" 
                  active={activeFilter === 'Prioridade Backlog'} 
                  onClick={() => setActiveFilter('Prioridade Backlog')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass="text-rose-400"
                />
              </div>
            )}
          </div>

          {!isSidebarCollapsed && <div className="h-px bg-dark-700/50 my-4 mx-2"></div>}

          {/* SEÇÃO: FERRAMENTAS & SISTEMA */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
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

            {(sectionsExpanded.tools || isSidebarCollapsed) && (
              <div className={`space-y-1 ${!isSidebarCollapsed ? 'ml-3 border-l border-dark-700/50 pl-2' : ''} animate-in fade-in slide-in-from-top-1 duration-200`}>
                <NavItem 
                  icon={menuIcons['Estatísticas']} 
                  label="Estatísticas" 
                  active={activeFilter === 'Estatísticas'} 
                  onClick={() => setActiveFilter('Estatísticas')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass="text-amber-500"
                />
                <NavItem 
                  icon={<Sparkles className="w-5 h-5" />} 
                  label="Novidades" 
                  active={false} 
                  onClick={() => setIsReleaseNotesOpen(true)} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass="text-emerald-500"
                />
                <NavItem 
                  icon={menuIcons['Configurações']} 
                  label="Configurações" 
                  active={activeFilter === 'Configurações'} 
                  onClick={() => setActiveFilter('Configurações')} 
                  isCollapsed={isSidebarCollapsed}
                  colorClass={getIconColorClass('Configurações')}
                />
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
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

        {/* Content Area */}
        {activeFilter === 'Calendário' ? (
          <CalendarView 
            jogos={jogos} 
            eventos={eventos} 
            onDayClick={(date) => {
              const gamesToday = jogos.filter(j => j.data_lancamento === date);
              const eventsToday = eventos.filter(e => e.data_evento === date);
              
              if (gamesToday.length > 0 || eventsToday.length > 0) {
                setSelectedDayData({ date, games: gamesToday, events: eventsToday });
                setIsDayDetailsModalOpen(true);
              } else {
                setSelectedDateForEvent(date);
                setIsEventModalOpen(true);
              }
            }} 
          />
        ) : activeFilter === 'Configurações' ? (
          <SettingsView 
            carregarDados={carregarDados} 
            currentTheme={currentTheme} 
            applyTheme={applyTheme} 
            themes={themes} 
            displayMode={displayMode}
            applyDisplayMode={applyDisplayMode}
            iconStyle={iconStyle}
            applyIconStyle={applyIconStyle}
          />
        ) : activeFilter === 'Estatísticas' ? (
          <StatisticsView jogos={jogos} generos={generos} />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 relative flex flex-col gap-8 custom-scrollbar">
            {/* Filter & Sort Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-800/50 p-4 rounded-2xl border border-dark-700/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
                <input 
                  type="text" 
                  placeholder="Buscar jogo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm text-txt-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-sm text-txt-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Jogando">Jogando</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Backlog">Backlog</option>
                  <option value="Completado">Completado</option>
                  <option value="Abandonado">Abandonado</option>
                  <option value="Lista de Desejos">Lista de Desejos</option>
                </select>

                <select 
                  value={filterGenero}
                  onChange={(e) => setFilterGenero(e.target.value)}
                  className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-sm text-txt-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer max-w-[150px]"
                >
                  <option value="Todos">Todos os Gêneros</option>
                  {generos.map(gen => (
                    <option key={gen.id} value={gen.nome}>{gen.nome}</option>
                  ))}
                </select>

                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-sm text-txt-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="alpha">A-Z</option>
                  <option value="score">Maior Nota</option>
                  <option value="progress">Progresso (%)</option>
                  <option value="time">Tempo de Jogo</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : jogosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Gamepad2 className="w-24 h-24 mb-4 opacity-20" />
                <p className="text-lg">Nenhum jogo encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {jogosFiltrados.map(jogo => (
                  <GameCard 
                    key={jogo.id} 
                    jogo={jogo} 
                    icon={statusIcons[jogo.status]} 
                    iconColorClass={getIconColorClass(jogo.status)}
                    onClick={() => {
                      setEditingJogo(jogo);
                      setIsDetailsModalOpen(true);
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {isModalOpen && (
        <GameModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSalvarJogo} 
          initialData={editingJogo}
          onDelete={handleExcluirJogo}
        />
      )}

      {isEventModalOpen && (
        <EventModal 
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedDateForEvent(null);
          }} 
          onSave={handleSalvarEvento}
          initialDate={selectedDateForEvent}
        />
      )}

      {isDayDetailsModalOpen && selectedDayData && (
        <DayDetailsModal 
          data={selectedDayData}
          onClose={() => setIsDayDetailsModalOpen(false)}
          onAddEvent={() => {
            setIsDayDetailsModalOpen(false);
            setSelectedDateForEvent(selectedDayData.date);
            setIsEventModalOpen(true);
          }}
          onAddGame={() => {
            setIsDayDetailsModalOpen(false);
            setEditingJogo({ data_lancamento: selectedDayData.date });
            setIsModalOpen(true);
          }}
        />
      )}

      {isDetailsModalOpen && editingJogo && (
        <GameDetailsModal 
          jogo={editingJogo}
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsModalOpen(true);
          }}
          icon={statusIcons[editingJogo.status]}
          iconColorClass={getIconColorClass(editingJogo.status)}
        />
      )}

      {isReleaseNotesOpen && (
        <ReleaseNotesModal onClose={() => setIsReleaseNotesOpen(false)} />
      )}
      </div>
    </div>
  );
}
