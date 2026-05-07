const { ipcMain, dialog, BrowserWindow } = require('electron');
const { getJogos, addJogo, updateJogo, deleteJogo, getEventos, addEvento, deleteEvento, getAllData, importData, getGeneros, addGenero } = require('./sqlite');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function setupIpcHandlers() {
  // --- BUSCA HLTB (Executável Compilado) ---
  ipcMain.handle('jogos:fetchHLTB', async (event, titulo) => {
    return new Promise((resolve) => {
      const isDev = process.env.NODE_ENV === 'development';
      const platform = process.platform;
      const binaryName = platform === 'win32' ? 'hltb_service_win.exe' : 'hltb_service_linux';
      
      // Em dev, os binários estão na pasta dist/ na raiz
      // Em produção, eles estarão na pasta resources/bin do Electron
      const binaryPath = isDev 
        ? path.join(process.cwd(), 'dist', binaryName)
        : path.join(process.resourcesPath, 'bin', binaryName);

      console.log(`[HLTB] Executando binário: ${binaryPath} para: "${titulo}"...`);
      
      // Verifica se o arquivo existe antes de tentar executar
      if (!fs.existsSync(binaryPath)) {
        console.error(`[HLTB] Binário não encontrado em: ${binaryPath}`);
        return resolve(null);
      }

      exec(`"${binaryPath}" "${titulo.replace(/"/g, '')}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`[HLTB] Erro ao executar binário: ${error}`);
          return resolve(null);
        }
        try {
          const data = JSON.parse(stdout);
          if (data.error) {
            console.warn(`[HLTB] Binário retornou erro: ${data.error}`);
            return resolve(null);
          }
          resolve(data);
        } catch (e) {
          console.error(`[HLTB] Erro ao processar JSON: ${stdout}`);
          resolve(null);
        }
      });
    });
  });


  // --- HANDLERS DO BANCO DE DADOS ---
  ipcMain.handle('jogos:get', async () => await getJogos());
  ipcMain.handle('jogos:add', async (event, jogo) => await addJogo(jogo));
  ipcMain.handle('jogos:update', async (event, id, jogo) => await updateJogo(id, jogo));
  ipcMain.handle('jogos:delete', async (event, id) => await deleteJogo(id));
  
  ipcMain.handle('eventos:get', async () => await getEventos());
  ipcMain.handle('eventos:add', async (event, evento) => await addEvento(evento));
  ipcMain.handle('eventos:delete', async (event, id) => await deleteEvento(id));

  ipcMain.handle('generos:get', async () => await getGeneros());
  ipcMain.handle('generos:add', async (event, genero) => await addGenero(genero));

  ipcMain.handle('data:export', async () => {
    const data = await getAllData();
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exportar Backup',
      defaultPath: `checkpoint_backup_${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    }
    return false;
  });

  ipcMain.handle('data:import', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Importar Backup',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (filePaths.length > 0) {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      const data = JSON.parse(content);
      await importData(data);
      return true;
    }
    return false;
  });

  ipcMain.handle('images:select', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Imagens', extensions: ['jpg', 'png', 'jpeg', 'webp', 'gif'] }]
    });
    return filePaths[0] || null;
  });

  // --- CONTROLES DE JANELA ---
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.close();
  });
}

module.exports = { setupIpcHandlers };
