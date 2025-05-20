import { contextBridge,ipcMain,ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onCargarAccesos:(callback)=>{ipcRenderer.on('on-accesos',(_,value)=>callback(value))},
  onAutoNoRegistrado:(callback)=>{ipcRenderer.on('on-no-registrado',(_,value)=>callback(value))},
  onAccionBloqueado:(callback)=>{ipcRenderer.on('on-accion-bloqueada',(_,value)=>callback(value))},
  onCupoLleno:(callback)=>{ipcRenderer.on('on-cupo-lleno',(_,value)=>callback(value))},
  onHorarioFuera:(callback)=>{ipcRenderer.on('on-horario-fuera',(_,value)=>callback(value))},
  getDatosAuto:(search)=>ipcRenderer.sendSync("GetDatosAuto",search)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
