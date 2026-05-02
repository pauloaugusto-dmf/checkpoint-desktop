import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { platforms } from '../js/platforms';

export default function GameModal({ onClose, onSave, onDelete, initialData }) {
  const isEditing = !!initialData;
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
    onSave({
      ...formData,
      nota_pessoal: parseFloat(formData.nota_pessoal) || 0,
      tempo_jogo_minutos: parseInt(formData.tempo_jogo_minutos) || 0,
      percentual_conclusao: parseFloat(formData.percentual_conclusao) || 0
    });
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
    </div>
  );
}
