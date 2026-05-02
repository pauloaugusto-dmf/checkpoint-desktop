import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { releaseNotes } from '../js/releaseNotes';

export default function ReleaseNotesModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass w-full max-w-2xl rounded-2xl border border-dark-600 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-dark-700 flex items-center justify-between bg-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-txt-main">Novidades da Versão</h2>
              <p className="text-sm text-txt-muted">Confira o que mudou no Checkpoint</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-full transition-colors text-txt-muted hover:text-txt-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar max-h-[60vh]">
          {releaseNotes.map((note) => (
            <div key={note.version} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-primary-400">Versão {note.version}</h3>
                <span className="text-xs text-txt-muted bg-dark-700 px-2 py-1 rounded">{note.date}</span>
              </div>

              {note.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Funcionalidades
                  </h4>
                  <ul className="grid gap-2">
                    {note.features.map((feature, i) => (
                      <li key={i} className="text-sm text-txt-main pl-6 relative">
                        <span className="absolute left-1 top-2 w-1 h-1 bg-emerald-500 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {note.fixes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Correções
                  </h4>
                  <ul className="grid gap-2">
                    {note.fixes.map((fix, i) => (
                      <li key={i} className="text-sm text-txt-main pl-6 relative">
                        <span className="absolute left-1 top-2 w-1 h-1 bg-amber-500 rounded-full"></span>
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="border-b border-dark-700/50 pt-4"></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-dark-800/50 border-t border-dark-700 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
