import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

export default function EventModal({ onClose, onSave, initialDate }) {
  const [formData, setFormData] = useState({
    titulo: '',
    data_evento: initialDate || new Date().toISOString().split('T')[0],
    cor: '#3b82f6'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-700/50">
          <h2 className="text-xl font-bold text-txt-main flex items-center gap-2">
            <CalendarDays className="text-primary-500" />
            Adicionar Evento
          </h2>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-main transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-muted mb-1">Título do Evento *</label>
            <input 
              required 
              type="text" 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500" 
              placeholder="Ex: Game Awards, State of Play..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-muted mb-1">Data do Evento *</label>
            <input 
              required 
              type="date" 
              name="data_evento" 
              value={formData.data_evento} 
              onChange={handleChange} 
              onClick={(e) => e.target.showPicker?.()}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-txt-main focus:outline-none focus:border-primary-500 cursor-pointer" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-muted mb-1">Cor do Destaque</label>
            <div className="flex gap-3">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cor: color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.cor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-2 rounded-lg text-gray-300 hover:bg-dark-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors shadow-lg shadow-primary-500/20">
              Salvar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
