import { app, shell, BrowserWindow, ipcMain, globalShortcut, BaseWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 使用变量跟踪应用退出状态
let isQuitting = false

// 启用全局快捷键
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 修改窗口关闭行为
  mainWindow.on('close', (event) => {
    // 如果不是通过 app.quit() 触发的关闭
    if (!isQuitting) {
      event.preventDefault() // 阻止默认的关闭行为
      mainWindow.hide() // 隐藏窗口而不是关闭
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 重置退出标志
  isQuitting = false

  // 注册一个全局键盘事件
  const ret = globalShortcut.register('Option+Command+J', () => {
    // 检查是否已经存在无边框窗口
    const existingWindow = BrowserWindow.getAllWindows().find(
      (win) => win.webContents.getTitle() === 'NoFrameWindow'
    )

    if (existingWindow) {
      existingWindow.close()
      return // 确保在关闭窗口后立即返回，不再创建新窗口
    }

    // 创建一个完全无边框窗口
    const noFrameWindow = new BrowserWindow({
      width: 800,
      height: 58,
      frame: false,
      transparent: true,
      alwaysOnTop: true, // 保持窗口始终在最上层
      title: 'NoFrameWindow', // 直接设置窗口标题
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: true
      }
    })

    // 设置窗口标题以便识别
    noFrameWindow.webContents.on('did-finish-load', () => {
      noFrameWindow.setTitle('NoFrameWindow')
      console.log('Search window loaded, title set to:', noFrameWindow.webContents.getTitle())
    })

    // ESC键关闭窗口
    noFrameWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        noFrameWindow.close()
      }
    })

    // 点击窗口外部关闭窗口
    noFrameWindow.on('blur', () => {
      noFrameWindow.close()
    })

    // 加载页面
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      noFrameWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/search.html`)
    } else {
      noFrameWindow.loadFile(join(__dirname, '../renderer/search.html'))
    }

    // 显示窗口
    noFrameWindow.show()
  })

  if (!ret) {
    console.log('Option+Command+J 全局快捷键注册失败')
  }
  // 检查键盘事件是否注册成功
  const isRegistered = globalShortcut.isRegistered('Option+Command+J')
  if (isRegistered) {
    console.log('Option+Command+J 全局快捷键注册成功')
  } else {
    console.log('Option+Command+J 全局快捷键注册失败')
  }

  // IPC test
  ipcMain.on('ping', () => {
    console.log('Received ping from renderer')
  })

  // 添加IPC消息处理
  ipcMain.on('format-json', (_, jsonText) => {
    console.log('Received format-json request:', jsonText)

    // 获取所有窗口
    const windows = BrowserWindow.getAllWindows()
    console.log(
      'All windows:',
      windows.map((win) => ({
        id: win.id,
        title: win.webContents.getTitle(),
        url: win.webContents.getURL()
      }))
    )

    // 获取主窗口 - 使用更可靠的方法
    const mainWindow = windows.find((win) => {
      const url = win.webContents.getURL()
      const title = win.webContents.getTitle()
      return !url.includes('search.html') && title !== 'NoFrameWindow'
    })

    if (mainWindow) {
      console.log('Found main window, id:', mainWindow.id)
      try {
        // 发送JSON文本到主窗口进行格式化
        mainWindow.webContents.send('format-json-in-editor', jsonText)
        console.log('Sent format-json-in-editor event to main window')
        // 显示并聚焦主窗口
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()
      } catch (error) {
        console.error('Error sending event to main window:', error)
      }
    } else {
      console.log('Main window not found')
      // 如果找不到主窗口，创建一个新的
      createWindow()
    }
  })

  ipcMain.on('close-search-window', () => {
    console.log('Received close-search-window request')
    console.log(
      'All windows:',
      BrowserWindow.getAllWindows().map((win) => ({
        title: win.webContents.getTitle(),
        url: win.webContents.getURL()
      }))
    )

    // 查找搜索窗口 - 使用多个条件来确保找到正确的窗口
    const searchWindow = BrowserWindow.getAllWindows().find((win) => {
      const title = win.webContents.getTitle()
      const url = win.webContents.getURL()
      const isSearchWindow =
        !win.isDestroyed() &&
        (title === 'NoFrameWindow' || url.includes('search.html') || win.isAlwaysOnTop())
      console.log('Window check:', { title, url, isSearchWindow })
      return isSearchWindow
    })

    if (searchWindow) {
      console.log('Found search window, closing it')
      try {
        searchWindow.destroy() // 使用 destroy 而不是 close
      } catch (error) {
        console.error('Error closing window:', error)
      }
    } else {
      console.log('Search window not found')
    }
  })

  createWindow()

  // 在 dock 图标点击时显示窗口
  app.on('activate', () => {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      windows.forEach((win) => {
        win.show()
      })
    } else {
      createWindow()
    }
  })
})

// 修改退出行为
app.on('before-quit', () => {
  isQuitting = true
})

// 修改 window-all-closed 事件处理
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户使用 Cmd + Q 或右键 dock 图标选择退出
  // 否则不会真正退出应用
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
