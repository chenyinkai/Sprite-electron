const {contextBridge, ipcRenderer} = require('electron');

// 提供全局选择文件的方法
contextBridge.exposeInMainWorld('selectFile', {
    mutiple: () => ipcRenderer.invoke('select-file:mutiple'), // 注册多选图片事件
    savedDirectory: () => ipcRenderer.invoke('select-file:saved-directory'), // 注册选择保存文件夹事件
    saveFile: () => ipcRenderer.invoke('select-file:save-file'), // 注册保存文件到本地事件
});
