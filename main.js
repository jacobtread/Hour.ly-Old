// Modules to control application life and create native browser window
const { app, screen, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const storageDir = path.join(process.env.APPDATA, 'Hour.ly')
const storageFile = path.join(storageDir, 'times.json')

function createWindow() {
    // Create the browser window.
    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width;
    let height = display.bounds.height;
    const mainWindow = new BrowserWindow({
        width: 160,
        height: 200,
        titleBarStyle: 'hidden',
        resizable: false,
        transparent: true,
        alwaysOnTop: true,
        x: width - 225,
        y: height - 205,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    mainWindow.loadFile('index.html').then().catch();
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('minimize', () => {
    BrowserWindow.getFocusedWindow().minimize()
})
ipcMain.on('close', () => {
    BrowserWindow.getFocusedWindow().close()
})

ipcMain.on('save', (event, args) => {
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir)
    }
    let total = 0
    for (let arg of args) {
        total += arg
    }
    const data = JSON.stringify({
        history: args,
        total
    })
    fs.writeFileSync(storageFile, data, 'utf8')
})

ipcMain.on('load', function (event) {
    loadData(event)
})

function loadData(event) {
    if (fs.existsSync(storageFile)) {
        try {
            const data = fs.readFileSync(storageFile, 'utf8')
            const json = JSON.parse(data)
            if (json.history) {
                event.sender.send('load-state', json.history)
            }
        } catch (e) {
        }
    }
}