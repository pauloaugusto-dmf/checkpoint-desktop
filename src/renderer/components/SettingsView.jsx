import React from 'react';
import { Palette, Download, Upload } from 'lucide-react';

export default function SettingsView({ carregarDados, currentTheme, applyTheme, themes, displayMode, applyDisplayMode, iconStyle, applyIconStyle }) {
  const handleExport = async () => {
    try {
      const success = await window.api.exportData();
      if (success) alert('Backup exportado com sucesso!');
    } catch (error) {
      alert('Erro ao exportar backup.');
    }
  };

  const handleImport = async () => {
    try {
      const success = await window.api.importData();
      if (success) {
        alert('Backup importado com sucesso!');
        carregarDados();
      }
    } catch (error) {
      alert('Erro ao importar backup.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="glass rounded-2xl p-8 border border-dark-700 shadow-xl">
          <h3 className="text-xl font-bold text-txt-main mb-6 flex items-center gap-3">
            <Palette className="text-primary-500" />
            Personalização Visual
          </h3>
          
          <div className="space-y-8">
            {/* Display Mode */}
            <div>
              <p className="text-txt-muted mb-4 font-medium uppercase tracking-widest text-xs">Modo de Exibição</p>
              <div className="flex gap-4">
                <button
                  onClick={() => applyDisplayMode('dark')}
                  className={`flex-1 p-4 rounded-xl border transition-all flex items-center gap-3 ${displayMode === 'dark' ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg' : 'bg-dark-900 border-dark-700 text-gray-500 hover:border-dark-600'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-900 border border-dark-700 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full opacity-10" />
                  </div>
                  <span className="font-bold">Modo Escuro</span>
                </button>
                <button
                  onClick={() => applyDisplayMode('light')}
                  className={`flex-1 p-4 rounded-xl border transition-all flex items-center gap-3 ${displayMode === 'light' ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <div className="w-4 h-4 bg-black rounded-full opacity-10" />
                  </div>
                  <span className="font-bold">Modo Claro</span>
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <p className="text-txt-muted mb-4 font-medium uppercase tracking-widest text-xs">Cor de Destaque</p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => applyTheme(key)}
                    className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${currentTheme === key ? 'bg-dark-700 ring-2 ring-primary-500' : 'hover:bg-dark-700/50'}`}
                  >
                    <div className={`w-12 h-12 rounded-full ${theme.bg} shadow-lg group-hover:scale-110 transition-transform border-2 border-white/10`} />
                    <span className="text-xs font-bold text-txt-muted">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Styles */}
            <div>
              <p className="text-txt-muted mb-4 font-medium uppercase tracking-widest text-xs">Estilo dos Ícones</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => applyIconStyle('status')}
                  className={`p-4 rounded-xl border transition-all text-left ${iconStyle === 'status' ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg' : 'bg-dark-900 border-dark-700 text-gray-500 hover:border-dark-600'}`}
                >
                  <p className="font-bold text-sm mb-1">Coloridos por Status</p>
                  <p className="text-[10px] opacity-70">Verde para Jogando, Azul para Backlog, etc.</p>
                </button>
                <button
                  onClick={() => applyIconStyle('accent')}
                  className={`p-4 rounded-xl border transition-all text-left ${iconStyle === 'accent' ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg' : 'bg-dark-900 border-dark-700 text-gray-500 hover:border-dark-600'}`}
                >
                  <p className="font-bold text-sm mb-1">Cor de Destaque</p>
                  <p className="text-[10px] opacity-70">Todos os ícones usam a cor do seu tema.</p>
                </button>
                <button
                  onClick={() => applyIconStyle('monochrome')}
                  className={`p-4 rounded-xl border transition-all text-left ${iconStyle === 'monochrome' ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg' : 'bg-dark-900 border-dark-700 text-gray-500 hover:border-dark-600'}`}
                >
                  <p className="font-bold text-sm mb-1">Monocromático</p>
                  <p className="text-[10px] opacity-70">Visual limpo e minimalista em tons de cinza.</p>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-8 border border-dark-700 shadow-xl">
          <h3 className="text-xl font-bold text-txt-main mb-6 flex items-center gap-3">
            <Download className="text-primary-500" />
            Dados e Segurança
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-900/50 p-6 rounded-2xl border border-dark-700">
              <h4 className="text-txt-main font-bold mb-2">Exportar Backup</h4>
              <p className="text-sm text-txt-muted mb-6">Salve todos os seus jogos e eventos em um arquivo JSON para segurança ou transferência.</p>
              <button 
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 text-txt-main py-3 rounded-xl transition-all font-bold border border-dark-600"
              >
                <Download className="w-5 h-5" />
                Exportar JSON
              </button>
            </div>
            <div className="bg-dark-900/50 p-6 rounded-2xl border border-dark-700">
              <h4 className="text-txt-main font-bold mb-2">Importar Backup</h4>
              <p className="text-sm text-txt-muted mb-6">Restaurar sua biblioteca a partir de um arquivo de backup previamente exportado.</p>
              <button 
                onClick={handleImport}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl transition-all font-bold shadow-lg shadow-primary-500/20"
              >
                <Upload className="w-5 h-5" />
                Importar JSON
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
