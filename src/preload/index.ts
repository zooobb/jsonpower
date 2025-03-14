import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 添加IPC通信方法
  ipcRenderer: {
    send: (channel: string, data?: any) => {
      console.log('Sending IPC message:', channel, data)
      ipcRenderer.send(channel, data)
    },
    on: (channel: string, callback: Function) => {
      console.log('Registering IPC listener for channel:', channel)
      ipcRenderer.on(channel, (event, data) => {
        console.log('Received IPC message on channel:', channel, data)
        callback(data)
      })
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    console.log('Exposing electron API to renderer process')
    contextBridge.exposeInMainWorld('electron', api)
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error('Error exposing electron API:', error)
  }
} else {
  console.log('Context isolation disabled, adding API to window object')
  // @ts-ignore (define in dts)
  window.electron = api
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI
}
