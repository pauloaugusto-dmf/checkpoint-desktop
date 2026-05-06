import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  filterGenero, 
  setFilterGenero, 
  generos, 
  sortBy, 
  setSortBy 
}) {
  return (
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
  );
}
