// 调用Preload中注册的方法
document.getElementById('select-file').addEventListener('click', async () => {
    const filesNum = await window.selectFile.mutiple();
    console.log('select-file btn has clicked'); // 渲染进程的console无法查看
    document.getElementById('select-file').innerHTML = `选择图片: 已选择${filesNum}`;
});

// 选择保存位置
document.getElementById('select-directory').addEventListener('click', async () => {
    const savedPath = await window.selectFile.savedDirectory();
    document.getElementById('select-directory').innerHTML = '导出目录为：' + savedPath;
});

// 保存文件
document.getElementById('save-file').addEventListener('click', async () => {
    await window.selectFile.saveFile();
    alert('保存成功');
});
