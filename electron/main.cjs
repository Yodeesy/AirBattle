const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

app.setName('AirBattle');
app.commandLine.appendSwitch('allow-file-access-from-files');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const SAVE_DIR = path.join(app.getPath('userData'), 'save');
const SAVE_FILE = path.join(SAVE_DIR, 'user.json');

function ensureSaveDir() {
  if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
  }

  // Auto-migrate previous dev save from AppData/Electron/save/user.json if exists
  if (!fs.existsSync(SAVE_FILE)) {
    try {
      const electronDevSave = path.join(app.getPath('appData'), 'Electron', 'save', 'user.json');
      if (fs.existsSync(electronDevSave)) {
        fs.copyFileSync(electronDevSave, SAVE_FILE);
        console.log(`[SaveManager] Successfully migrated previous save from ${electronDevSave} to ${SAVE_FILE}`);
      }
    } catch (e) {
      console.warn('[SaveManager] Migration check warning:', e);
    }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 890,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    title: 'AirBattle Remastered // 战机凌云',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    autoHideMenuBar: true,
    backgroundColor: '#0a0e17'
  });

  // Center window on screen
  win.center();

  // Forward renderer console logs to main process terminal
  win.webContents.on('console-message', (event, level, message) => {
    const msg = typeof event === 'object' && event?.message !== undefined ? event.message : (message || event);
    console.log(`[Electron Renderer] ${msg}`);
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron Failed Load] Code: ${errorCode}, Desc: ${errorDescription}, URL: ${validatedURL}`);
  });

  // In development, load from Vite dev server if running, or dist/index.html
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      win.loadFile(indexPath);
    } else {
      // Fallback dev port
      win.loadURL('http://localhost:5173');
    }
  }
}

// Save profile IPC handlers
ipcMain.handle('save:loadProfile', async () => {
  try {
    ensureSaveDir();
    if (fs.existsSync(SAVE_FILE)) {
      const data = fs.readFileSync(SAVE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
  return null;
});

ipcMain.handle('save:saveProfile', async (_event, profile) => {
  try {
    ensureSaveDir();
    fs.writeFileSync(SAVE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save profile:', err);
    return false;
  }
});

ipcMain.handle('save:getSavePath', async () => {
  ensureSaveDir();
  return SAVE_FILE;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
