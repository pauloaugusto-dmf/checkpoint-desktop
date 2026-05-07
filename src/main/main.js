// src/main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./ipcHandlers');
const { initDatabase } = require('./sqlite');

let mainWindow;

// Removi as flags agressivas do Linux/WSL que podem estar apagando a tela.
// Mantenho apenas esta que é a mais segura.
app.disableHardwareAcceleration();

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Remove completamente a barra de títulos feia do sistema operacional
    autoHideMenuBar: true, // Remove a barra "File, Edit, View"
    icon: path.join(app.getAppPath(), 'src', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'));
  } else {
    // Forçar o carregamento e abrir o DevTools independentemente de qualquer variável
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); 
  }
}

app.whenReady().then(async () => {
  try {
    console.log('App ready. Initializing database...');
    await initDatabase();
    
    console.log('Database ready. Setting up IPC...');
    setupIpcHandlers();
    
    console.log('Creating window...');
    createWindow();
  } catch (error) {
    console.error('ERRO FATAL NA INICIALIZAÇÃO:', error);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});