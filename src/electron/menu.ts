import { app, BrowserWindow, Menu } from 'electron';
import { ipcWebContentsSend, isDev } from './util.js';

export function createMenu(mainWindow: BrowserWindow) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: process.platform === 'darwin' ? undefined : 'App',
        type: 'submenu',
        submenu: [
          {
            label: 'Quit',
            click: app.quit,
          },
          {
            label: 'DevTools',
            click: () => mainWindow.webContents.openDevTools(),
            visible: isDev(),
          },
        ],
      },
      {
        label: 'View',
        type: 'submenu',
        submenu: [
          {
            label: 'Link Accounts',
            click: () =>
              ipcWebContentsSend('changeView', mainWindow.webContents, 'link'),
          },
          {
            label: 'Find Jobs',
            click: () =>
              ipcWebContentsSend(
                'changeView',
                mainWindow.webContents,
                'tracker',
              ),
          },
          {
            label: 'Job Tracker',
            click: () =>
              ipcWebContentsSend(
                'changeView',
                mainWindow.webContents,
                'search',
              ),
          },
        ],
      },
    ]),
  );
}
