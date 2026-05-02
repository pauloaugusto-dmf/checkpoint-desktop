const { ipcMain, dialog, BrowserWindow } = require('electron');
const { getJogos, addJogo, updateJogo, deleteJogo, getEventos, addEvento, deleteEvento, getAllData, importData } = require('./sqlite');
const fs = require('fs');

function setupIpcHandlers() {
  ipcMain.handle('jogos:get', async () => {
    return await getJogos();
  });

  ipcMain.handle('jogos:add', async (event, jogo) => {
    return await addJogo(jogo);
  });

  ipcMain.handle('jogos:update', async (event, id, jogo) => {
    return await updateJogo(id, jogo);
  });

  ipcMain.handle('jogos:delete', async (event, id) => {
    return await deleteJogo(id);
  });

  ipcMain.handle('eventos:get', async () => {
    return await getEventos();
  });

  ipcMain.handle('eventos:add', async (event, evento) => {
    return await addEvento(evento);
  });

  ipcMain.handle('eventos:delete', async (event, id) => {
    return await deleteEvento(id);
  });

  ipcMain.handle('data:export', async () => {
    try {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      const { filePath } = await dialog.showSaveDialog(win, {
        title: 'Exportar Backup',
        defaultPath: 'checkpoint_backup.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (filePath) {
        console.log('Exporting data to:', filePath);
        const data = await getAllData();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  });

  ipcMain.handle('data:import', async () => {
    try {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      const { filePaths } = await dialog.showOpenDialog(win, {
        title: 'Importar Backup',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (filePaths && filePaths.length > 0) {
        console.log('Importing data from:', filePaths[0]);
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        const data = JSON.parse(content);
        return await importData(data);
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  });

  // Controles Nativos da Janela
  // const { BrowserWindow } = require('electron'); // already imported at top
  
  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
  
  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    }
  });
  
  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
}

module.exports = { setupIpcHandlers };
