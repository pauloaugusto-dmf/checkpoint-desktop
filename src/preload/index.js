// src/preload/index.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getJogos: () => ipcRenderer.invoke('jogos:get'),
  addJogo: (jogo) => ipcRenderer.invoke('jogos:add', jogo),
  updateJogo: (id, jogo) => ipcRenderer.invoke('jogos:update', id, jogo),
  deleteJogo: (id) => ipcRenderer.invoke('jogos:delete', id),
  getEventos: () => ipcRenderer.invoke('eventos:get'),
  addEvento: (evento) => ipcRenderer.invoke('eventos:add', evento),
  deleteEvento: (id) => ipcRenderer.invoke('eventos:delete', id),
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: () => ipcRenderer.invoke('data:import')
});

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close')
});
