const {app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage} = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Spritesmith = require('spritesmith');

function convertJson2MapboxStyle(source, pixelRatio) {
    const targetObj = {};
    Object.keys(source).forEach(item => {
        const newKeyArr = item.split(os.platform() === 'win32' ? '\\' :'/');
        const newKey = newKeyArr[newKeyArr.length - 1].split('.')[0];
        Object.assign(targetObj, {
            [newKey]: {
                ...source[item],
                pixelRatio,
            },
        });
    });
    return JSON.stringify(targetObj);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        icon: nativeImage.createFromPath(path.join(__dirname, 'favicon.png')),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('index.html');

    let savedPath = ''; // 保存目录
    let transformResult = {}; // 转为sprite后的结果

    // 选择保存文件目录
    ipcMain.handle('select-file:saved-directory', async () => {
        const filesRes = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        savedPath = filesRes.filePaths[0];
        return filesRes.filePaths[0];
    });

    // 处理选择文件的事件，监听到渲染进程的事件触发
    ipcMain.handle('select-file:mutiple', async () => {
        const filesRes = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
        });
        const files = filesRes.filePaths;
        Spritesmith.run(
            {
                src: files,
                padding: 5,
            },
            function handleResult(err, result) {
                if (err) {
                    throw err;
                }
                transformResult = result;
            }
        );
        return files.length;
    });

    // 保存文件到本地
    ipcMain.handle('select-file:save-file', async () => {
        fs.writeFileSync(savedPath + '/sprite.png', transformResult.image);
        fs.writeFileSync(savedPath + '/sprite@2x.png', transformResult.image);
        let json1 = convertJson2MapboxStyle(transformResult.coordinates, 1);
        let json2 = convertJson2MapboxStyle(transformResult.coordinates, 2);
        fs.writeFileSync(savedPath + '/sprite.json', json1);
        fs.writeFileSync(savedPath + '/sprite@2x.json', json2);
    });
}

let tray;

function createTray() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'favicon.png')));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出',
            click: function () {
                app.quit();
            },
        },
    ]);
    tray.setToolTip('Sprite');
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    createTray();
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
