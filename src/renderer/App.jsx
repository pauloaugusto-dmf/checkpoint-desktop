import React, { useState, useMemo, useCallback } from 'react';
import { Gamepad2, Pause, Archive, CheckCircle2, ListMinus, Library } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Componentes
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import FilterBar from './components/FilterBar';
import GameGrid from './components/GameGrid';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import StatisticsView from './components/StatisticsView';

// Modais
import GameModal from './components/GameModal';
import EventModal from './components/EventModal';
import DayDetailsModal from './components/DayDetailsModal';
import GameDetailsModal from './components/GameDetailsModal';
import ReleaseNotesModal from './components/ReleaseNotesModal';

// Hooks e Utils
import { useCheckpointData } from './js/useCheckpointData';

export default function App() {

  const {
    jogos, setJogos,
    generos,
    eventos, setEventos,
    loading,
    currentTheme,
    displayMode,
    iconStyle,
    isReleaseNotesOpen, setIsReleaseNotesOpen,
    carregarDados,
    applyTheme,
    applyDisplayMode,
    applyIconStyle
  } = useCheckpointData();

  // Estados de UI locais
  const [activeFilter, setActiveFilter] = useState('Todos os Jogos');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState({ library: true, smart: true, tools: true });
  
  // Estados de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailsModalOpen, setIsDayDetailsModalOpen] = useState(false);
  
  // Estados de Seleção
  const [editingJogo, setEditingJogo] = useState(null);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  
  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterGenero, setFilterGenero] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');

  const themes = {
    violet: { name: 'Violeta', colors: { '500': '99 102 241', '600': '79 70 229' }, bg: 'bg-[#6366f1]' },
    emerald: { name: 'Esmeralda', colors: { '500': '16 185 129', '600': '5 150 105' }, bg: 'bg-[#10b981]' },
    rose: { name: 'Rosa', colors: { '500': '244 63 94', '600': '225 29 72' }, bg: 'bg-[#f43f5e]' },
    amber: { name: 'Âmbar', colors: { '500': '245 158 11', '600': '217 119 6' }, bg: 'bg-[#f59e0b]' },
    sky: { name: 'Céu', colors: { '500': '14 165 233', '600': '2 132 199' }, bg: 'bg-[#0ea5e9]' },
  };

  const getIconColorClass = useCallback((status) => {
    if (iconStyle === 'monochrome') return 'text-txt-muted';
    if (iconStyle === 'accent') return 'text-primary-500';
    
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
  }, [iconStyle]);

  const statusIcons = useMemo(() => ({
    'Jogando': <Gamepad2 />,
    'Pausado': <Pause />,
    'Backlog': <Archive />,
    'Completado': <CheckCircle2 />,
    'Abandonado': <ListMinus />,
    'Lista de Desejos': <Library />,
  }), []);

  const handleOpenAdd = () => {
    setEditingJogo(null);
    setIsModalOpen(true);
  };

  const handleSalvarJogo = async (jogoData) => {
    try {
      if (window.api) {
        let resultId;
        if (editingJogo?.id) {
          await window.api.updateJogo(editingJogo.id, jogoData);
          resultId = editingJogo.id;
          toast.success('Jogo atualizado com sucesso!');
        } else {
          resultId = await window.api.addJogo(jogoData);
          toast.success('Jogo adicionado à sua biblioteca!');
        }
        
        const dataJogos = await window.api.getJogos();
        setJogos(dataJogos);
        
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
      toast.error('Erro ao salvar o jogo. Tente novamente.');
    }
  };

  const handleExcluirJogo = async (id) => {
    // Para exclusão, ainda podemos usar o confirm nativo ou criar um modal customizado depois.
    // Mas o feedback após a exclusão deve ser um toast.
    if (!window.confirm("Tem certeza que deseja excluir este jogo?")) return;
    try {
      if (window.api) {
        await window.api.deleteJogo(id);
        await carregarDados();
        toast.success('Jogo removido com sucesso.');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
      toast.error('Não foi possível excluir o jogo.');
    }
  };

  const handleSalvarEvento = async (eventoData) => {
    try {
      if (window.api?.addEvento) {
        await window.api.addEvento(eventoData);
        await carregarDados();
        toast.success('Evento adicionado ao calendário!');
        setIsEventModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error('Erro ao salvar o evento.');
    }
  };


  const handleQuickUpdate = async (id, partialData) => {
    try {
      if (window.api) {
        const jogoAtual = jogos.find(j => j.id === id);
        if (!jogoAtual) return;
        
        const jogoAtualizado = { ...jogoAtual, ...partialData };
        await window.api.updateJogo(id, jogoAtualizado);
        
        const dataJogos = await window.api.getJogos();
        setJogos(dataJogos);
        
        // Atualizar o jogo que está sendo visualizado no modal
        setEditingJogo(dataJogos.find(j => j.id === id));
        
        toast.success('Dados atualizados!');
      }
    } catch (error) {
      console.error("Erro na atualização rápida:", error);
      toast.error('Erro ao atualizar dados.');
    }
  };

  const jogosFiltrados = useMemo(() => {

    return jogos
      .filter(jogo => {
        let matchesSidebar = false;
        if (activeFilter === 'Todos os Jogos') matchesSidebar = true;
        else if (activeFilter === 'Jogando') matchesSidebar = jogo.status === 'Jogando';
        else if (activeFilter === 'Pausados') matchesSidebar = jogo.status === 'Pausado';
        else if (activeFilter === 'Backlog') matchesSidebar = jogo.status === 'Backlog';
        else if (activeFilter === 'Completados') matchesSidebar = jogo.status === 'Completado';
        else if (activeFilter === 'Lista de Desejos') matchesSidebar = jogo.status === 'Lista de Desejos';
        else if (activeFilter === 'Abandonados') matchesSidebar = jogo.status === 'Abandonado';
        else if (activeFilter === 'Para Terminar') matchesSidebar = jogo.status !== 'Completado' && (jogo.percentual_conclusao || 0) >= 70;
        else if (activeFilter === 'Obras-Primas') matchesSidebar = (jogo.nota_pessoal || 0) >= 9;
        else if (activeFilter === 'Mais Jogados') matchesSidebar = (jogo.tempo_jogo_minutos || 0) > 0;
        else if (activeFilter === 'Prioridade Backlog') matchesSidebar = jogo.status === 'Backlog' && (jogo.nota_pessoal || 0) >= 8;
        
        const matchesSearch = jogo.titulo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'Todos' || jogo.status === filterStatus;
        const matchesGenero = filterGenero === 'Todos' || (jogo.generos?.some(g => g.nome === filterGenero));
        
        return matchesSidebar && matchesSearch && matchesStatus && matchesGenero;
      })
      .sort((a, b) => {
        if (sortBy === 'alpha') return a.titulo.localeCompare(b.titulo);
        if (sortBy === 'score') return (b.nota_pessoal || 0) - (a.nota_pessoal || 0);
        if (sortBy === 'progress') return (b.percentual_conclusao || 0) - (a.percentual_conclusao || 0);
        if (sortBy === 'time') return (b.tempo_jogo_minutos || 0) - (a.tempo_jogo_minutos || 0);
        return b.id - a.id;
      });
  }, [jogos, activeFilter, searchTerm, filterStatus, filterGenero, sortBy]);

  const handleGameClick = useCallback((jogo) => {
    setEditingJogo(jogo);
    setIsDetailsModalOpen(true);
  }, []);

  const renderContent = () => {
    switch (activeFilter) {
      case 'Calendário':
        return (
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
        );
      case 'Configurações':
        return (
          <SettingsView 
            carregarDados={carregarDados} 
            currentTheme={currentTheme} 
            applyTheme={(t) => applyTheme(t, themes)} 
            themes={themes} 
            displayMode={displayMode}
            applyDisplayMode={applyDisplayMode}
            iconStyle={iconStyle}
            applyIconStyle={applyIconStyle}
          />
        );
      case 'Estatísticas':
        return <StatisticsView jogos={jogos} generos={generos} />;
      default:
        return (
          <div className="flex-1 overflow-y-auto p-8 relative flex flex-col gap-8 custom-scrollbar">
            <FilterBar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filterGenero={filterGenero} setFilterGenero={setFilterGenero}
              generos={generos} sortBy={sortBy} setSortBy={setSortBy}
            />
            <GameGrid 
              loading={loading} 
              jogos={jogosFiltrados} 
              statusIcons={statusIcons}
              getIconColorClass={getIconColorClass}
              onGameClick={handleGameClick}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-txt-main font-sans">
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
          sectionsExpanded={sectionsExpanded} setSectionsExpanded={setSectionsExpanded}
          getIconColorClass={getIconColorClass}
          setIsReleaseNotesOpen={setIsReleaseNotesOpen}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <MainHeader 
            activeFilter={activeFilter}
            setIsEventModalOpen={setIsEventModalOpen}
            handleOpenAdd={handleOpenAdd}
          />


          {renderContent()}
        </main>

        {/* Modais */}
        {isModalOpen && (
          <GameModal 
            key={editingJogo?.id || 'new-game-modal'}
            onClose={() => {
              setIsModalOpen(false);
              setEditingJogo(null);
            }} 
            onSave={handleSalvarJogo} 
            initialData={editingJogo}
            onDelete={handleExcluirJogo}
          />
        )}

        {isEventModalOpen && (
          <EventModal 
            onClose={() => { setIsEventModalOpen(false); setSelectedDateForEvent(null); }} 
            onSave={handleSalvarEvento}
            initialDate={selectedDateForEvent}
          />
        )}

        {isDayDetailsModalOpen && selectedDayData && (
          <DayDetailsModal 
            data={selectedDayData}
            onClose={() => setIsDayDetailsModalOpen(false)}
            onAddEvent={() => { setIsDayDetailsModalOpen(false); setSelectedDateForEvent(selectedDayData.date); setIsEventModalOpen(true); }}
            onAddGame={() => { setIsDayDetailsModalOpen(false); setEditingJogo({ data_lancamento: selectedDayData.date }); setIsModalOpen(true); }}
          />
        )}

        {isDetailsModalOpen && editingJogo && (
          <GameDetailsModal 
            jogo={editingJogo}
            onClose={() => setIsDetailsModalOpen(false)}
            onEdit={() => { setIsDetailsModalOpen(false); setIsModalOpen(true); }}
            onUpdate={handleQuickUpdate}
            icon={statusIcons[editingJogo.status]}
            iconColorClass={getIconColorClass(editingJogo.status)}
          />

        )}

        {isReleaseNotesOpen && (
          <ReleaseNotesModal onClose={() => setIsReleaseNotesOpen(false)} />
        )}
        
        <Toaster 
          theme={displayMode === 'dark' ? 'dark' : 'light'} 
          richColors 
          closeButton 
          position="bottom-right" 
        />
      </div>

    </div>
  );
}
