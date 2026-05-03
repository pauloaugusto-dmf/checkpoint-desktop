import React, { useState, useEffect } from 'react';
import { Trash2, X, Plus, Tag as TagIcon, Search } from 'lucide-react';
import { platforms } from '../js/platforms';

export default function GameModal({ onClose, onSave, onDelete, initialData }) {
  const isEditing = !!initialData;
  const [availableGeneros, setAvailableGeneros] = useState([]);
  const [selectedGeneros, setSelectedGeneros] = useState(initialData?.generos?.map(g => g.id) || []);
  const [newGeneroName, setNewGeneroName] = useState('');
  const [showAddGenero, setShowAddGenero] = useState(false);
  const [generoSearch, setGeneroSearch] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [formData, setFormData] = useState({
    ...initialData,
    titulo: initialData?.titulo || '',
    plataforma: initialData?.plataforma || '',
    status: initialData?.status || 'Lista de Desejos',
    nota_pessoal: initialData?.nota_pessoal || 0,
    tempo_jogo_minutos: initialData?.tempo_jogo_minutos || 0,
    percentual_conclusao: initialData?.percentual_conclusao || 0,
    data_lancamento: initialData?.data_lancamento || '',
    capa_caminho: initialData?.capa_caminho || '',
    tempo_horas: Math.floor((initialData?.tempo_jogo_minutos || 0) / 60),
    tempo_minutos: (initialData?.tempo_jogo_minutos || 0) % 60
  });

  useEffect(() => {
    loadGeneros();
  }, []);

  const loadGeneros = async () => {
    try {
      const gens = await window.api.getGeneros();
      setAvailableGeneros(gens);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
    }
  };

  const handleToggleGenero = (generoId) => {
    setSelectedGeneros(prev => 
      prev.includes(generoId) 
        ? prev.filter(id => id !== generoId) 
        : [...prev, generoId]
    );
  };

  const handleAddNewGenero = async () => {
    if (!newGeneroName.trim()) return;
    try {
      const newGen = await window.api.addGenero(newGeneroName.trim());
      setAvailableGeneros(prev => [...prev, newGen].sort((a, b) => a.nome.localeCompare(b.nome)));
      setSelectedGeneros(prev => [...prev, newGen.id]);
      setNewGeneroName('');
      setShowAddGenero(false);
    } catch (error) {
      console.error('Erro ao adicionar gênero:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'tempo_horas' || name === 'tempo_minutos') {
        const h = parseInt(name === 'tempo_horas' ? value : prev.tempo_horas) || 0;
        const m = parseInt(name === 'tempo_minutos' ? value : prev.tempo_minutos) || 0;
        newState.tempo_jogo_minutos = (h * 60) + m;
      }
      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const jogoFinal = {
      ...formData,
      generos: selectedGeneros,
      nota_pessoal: parseFloat(formData.nota_pessoal) || 0,
      tempo_jogo_minutos: parseInt(formData.tempo_jogo_minutos) || 0,
      percentual_conclusao: parseFloat(formData.percentual_conclusao) || 0
    };
    onSave(jogoFinal);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900">
          <h2 className="text-xl font-bold text-txt-main">{isEditing ? 'Editar Jogo' : 'Adicionar Novo Jogo'}</h2>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-main transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-txt-muted mb-1">Título do Jogo *</label>
              <input required type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" placeholder="Ex: Elden Ring" />
            </div>

            <div>
              <label className="block text-sm font-medium text-txt-muted mb-1">Plataforma</label>
              <select name="plataforma" value={formData.plataforma} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500">
                <option value="">Selecione...</option>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-txt-muted mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500">
                <option value="Jogando">Jogando</option>
                <option value="Pausado">Pausado</option>
                <option value="Backlog">Backlog</option>
                <option value="Completado">Completado</option>
                <option value="Abandonado">Abandonado</option>
                <option value="Lista de Desejos">Lista de Desejos</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-txt-muted mb-2 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Gêneros
              </label>
              
              <div className="flex flex-wrap gap-2 p-3 bg-dark-900 border border-dark-600 rounded-xl min-h-[50px] items-center">
                {selectedGeneros.length === 0 ? (
                  <span className="text-xs text-txt-muted italic ml-1">Nenhum gênero selecionado</span>
                ) : (
                  availableGeneros
                    .filter(gen => selectedGeneros.includes(gen.id))
                    .map(gen => (
                      <span 
                        key={gen.id} 
                        className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 animate-in fade-in zoom-in-95"
                        style={{ 
                          backgroundColor: `${gen.cor}20`, 
                          color: gen.cor, 
                          borderColor: `${gen.cor}40` 
                        }}
                      >
                        {gen.nome}
                        <button 
                          type="button" 
                          onClick={() => handleToggleGenero(gen.id)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                )}
                
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="ml-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-dark-800 text-txt-main border border-dark-600 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Selecionar Gêneros
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-txt-muted mb-1">Nota Pessoal (0 a 10)</label>
              <input type="number" step="0.1" min="0" max="10" name="nota_pessoal" value={formData.nota_pessoal} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-txt-muted mb-1">Conclusão (%)</label>
              <input type="number" step="0.1" min="0" max="100" name="percentual_conclusao" value={formData.percentual_conclusao} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-txt-muted mb-1">Tempo de Jogo</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    name="tempo_horas" 
                    value={formData.tempo_horas} 
                    onChange={handleChange} 
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" 
                    placeholder="Horas"
                  />
                  <span className="text-xs text-txt-muted font-bold uppercase">h</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="59"
                    name="tempo_minutos" 
                    value={formData.tempo_minutos} 
                    onChange={handleChange} 
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" 
                    placeholder="Min"
                  />
                  <span className="text-xs text-txt-muted font-bold uppercase">m</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-txt-muted mb-1">Data de Lançamento</label>
              <input 
                type="date" 
                name="data_lancamento" 
                value={formData.data_lancamento || ''} 
                onChange={handleChange} 
                onClick={(e) => e.target.showPicker?.()}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500 [color-scheme:dark] cursor-pointer" 
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-txt-muted mb-1">URL da Imagem da Capa (Opcional)</label>
              <input type="text" name="capa_caminho" value={formData.capa_caminho} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" placeholder="https://exemplo.com/capa.jpg" />
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-dark-700">
            {isEditing ? (
              <button type="button" onClick={() => onDelete(initialData.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Excluir Jogo</span>
              </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-gray-300 hover:bg-dark-700 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors shadow-lg shadow-primary-500/20">
                {isEditing ? 'Atualizar Jogo' : 'Salvar Jogo'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sub-modal de Seleção de Gêneros (FORA do form principal para evitar conflitos) */}
      {isSelectorOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-6 animate-in fade-in duration-200">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-xl flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-dark-700 flex justify-between items-center bg-dark-900 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-primary-500/20 p-2 rounded-lg">
                  <TagIcon className="w-5 h-5 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-txt-main">Selecionar Gêneros</h3>
              </div>
              <button 
                onClick={() => {
                  setIsSelectorOpen(false);
                  setGeneroSearch('');
                }} 
                className="text-txt-muted hover:text-txt-main transition-colors p-1 hover:bg-dark-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-hidden flex flex-col">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
                  <input 
                    type="text" 
                    placeholder="Buscar gênero existente..." 
                    value={generoSearch}
                    onChange={(e) => setGeneroSearch(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-txt-main focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>
                
                {!showAddGenero ? (
                  <button
                    type="button"
                    onClick={() => setShowAddGenero(true)}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold transition-all flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Novo
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-dark-900 border border-primary-500 rounded-xl px-3 py-1.5 animate-in slide-in-from-right-4">
                    <input
                      autoFocus
                      type="text"
                      value={newGeneroName}
                      onChange={(e) => setNewGeneroName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewGenero();
                        } else if (e.key === 'Escape') {
                          setShowAddGenero(false);
                          setNewGeneroName('');
                        }
                      }}
                      className="bg-transparent text-sm text-txt-main outline-none w-32"
                      placeholder="Nome..."
                    />
                    <button
                      type="button"
                      onClick={handleAddNewGenero}
                      className="text-primary-500 hover:text-primary-400"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddGenero(false)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableGeneros
                    .filter(gen => gen.nome.toLowerCase().includes(generoSearch.toLowerCase()))
                    .map(gen => (
                      <button
                        key={gen.id}
                        type="button"
                        onClick={() => handleToggleGenero(gen.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                          selectedGeneros.includes(gen.id)
                            ? 'shadow-lg shadow-black/20'
                            : 'bg-dark-900 text-txt-muted border-dark-700 hover:border-dark-500 hover:text-txt-main'
                        }`}
                        style={selectedGeneros.includes(gen.id) ? {
                          backgroundColor: gen.cor,
                          color: '#fff',
                          borderColor: gen.cor
                        } : {}}
                      >
                        {gen.nome}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-dark-700 bg-dark-900 rounded-b-2xl flex justify-between items-center">
              <span className="text-xs text-txt-muted">
                {selectedGeneros.length} selecionado(s)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSelectorOpen(false);
                  setGeneroSearch('');
                }}
                className="px-6 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all shadow-lg shadow-primary-500/20"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
