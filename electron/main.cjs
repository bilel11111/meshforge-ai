const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const isDev = process.argv.includes('--dev') || !app.isPackaged;
const PORT = Number(process.env.MESHFORGE_PORT || 3173);
let serverProcess = null;
let mainWindow = null;

function getServerPath() {
  if (!app.isPackaged) return path.join(app.getAppPath(), 'dist', 'server.cjs');
  return path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'server.cjs');
}

function startLocalServer() {
  if (isDev) {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    serverProcess = spawn(npmCommand, ['run', 'dev'], {
      cwd: app.getAppPath(),
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' },
      stdio: 'pipe',
      windowsHide: true,
    });
  } else {
    const serverPath = getServerPath();
    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: process.resourcesPath,
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production', MESHFORGE_DIST_PATH: path.join(app.getAppPath(), 'dist'), ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'pipe',
      windowsHide: true,
    });
  }

  serverProcess.stdout?.on('data', (data) => console.log(`[server] ${data}`));
  serverProcess.stderr?.on('data', (data) => console.error(`[server] ${data}`));
  serverProcess.on('error', (error) => console.error('[server] failed to start', error));
}

function waitForServer(url, timeout = 15000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) return resolve();
        retry();
      });
      request.on('error', retry);
      request.setTimeout(1000, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - startedAt > timeout) return reject(new Error(`Local server did not start at ${url}`));
      setTimeout(check, 250);
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1540,
    height: 960,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: '#090d16',
    title: 'MeshForge AI',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  const url = `http://127.0.0.1:${PORT}`;
  mainWindow.loadURL(url);
}

ipcMain.handle('dialog:open-model', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open 3D model',
    properties: ['openFile'],
    filters: [{ name: '3D Models', extensions: ['glb', 'gltf', 'obj', 'stl'] }, { name: 'All files', extensions: ['*'] }],
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = result.filePaths[0];
  return { name: path.basename(filePath), path: filePath, bytes: fs.readFileSync(filePath) };
});

ipcMain.handle('dialog:save-file', async (_event, payload) => {
  if (!payload || !payload.bytes) return { canceled: true };
  const result = await dialog.showSaveDialog(mainWindow, {
    title: payload.title || 'Save file',
    defaultPath: payload.defaultPath || 'meshforge-export',
    filters: payload.filters || [{ name: 'All files', extensions: ['*'] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  fs.writeFileSync(result.filePath, Buffer.from(payload.bytes));
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle('app:get-paths', () => ({ userData: app.getPath('userData'), documents: app.getPath('documents') }));
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:toggle-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

app.whenReady().then(async () => {
  startLocalServer();
  try {
    await waitForServer(`http://127.0.0.1:${PORT}/api/health`);
    createWindow();
  } catch (error) {
    dialog.showErrorBox('MeshForge AI could not start', error.message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});
