import { app, shell, BrowserWindow, ipcMain,dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {getAccesosAutosController, setRegistrarEntrada,fnFindAutoDatos} from './controller/main_controller'
import {Socket} from 'node:net'
import {SerialPort} from 'serialport'
import {SnapDB} from 'snap-db'
import emmit from 'emitt'
import AutoNoRegistradoError from './util/error_auto_no_registrado'
import AccionNoPagadaError from './util/error_accion_no_pagada'
import CupoAccionLlenoError from './util/error_cupo_accion_lleno'
import dayjs from 'dayjs'
import HorarioAccesoError from './util/error_horario_acceso'




//s eusa como storage
const snapDB =new SnapDB("ls");
//para emitir eventos entre la antena y la pluma 
const emmiter:emmit.Emitter=emmit()


async function initAntena(win:BrowserWindow)
{
  const socket= new Socket()
  socket.connect(100,'192.168.1.113',()=>{console.log('se conecto al socket con exito')})

  socket.on("data", function(data){
      //recupera el dato del tag
      const tag_antena=data.toString('ascii',7,19);
      try {          
          if(tag_antena!='000000000000')
              {
                  
                setRegistrarEntrada(tag_antena).then(i=>{
                      win.webContents.send('on-accesos',i)
                      emmiter.emit("open-pluma")
                  }).catch(e=>{
                    if(e instanceof HorarioAccesoError){
                      console.log("NO HORARIO=>",e.data)
                      win.webContents.send('on-horario-fuera',e.data)
                    }
                    if(e instanceof AutoNoRegistradoError){
                      console.log("AutoNoRegistradoError=>",e.data)
                      win.webContents.send('on-no-registrado',e.data)
                    }
                    if(e instanceof AccionNoPagadaError){
                      console.log("AccionNoPagadaError=>",e.data)
                      win.webContents.send('on-accion-bloqueada',e.data)}
                    if(e instanceof CupoAccionLlenoError){
                      console.log("CupoAccionLlenoError=>",e.data)
                      win.webContents.send('on-cupo-lleno',e.data)}                    
                  })                 
              }
          
      } catch (error) {
          console.log(error)
      }
      
    });
}

async function initPluma()
{
  const list_coms=await SerialPort.list(); 
  emmiter.off("open-pluma",()=>{})
  //si hay arduinos conectados
  if(Boolean(list_coms.length))
    {
      //funge como loclastorage
      const com_num_serial=await snapDB.get("pluma")

      //si hay ya un arduino guardado 
      if(Boolean(com_num_serial))
        {
             //verifica que el arduino guardado este entre la lista de los conectados
             const pluma_exist=list_coms.find(i=>i.serialNumber==com_num_serial)
             //si el arduino guarado si esta en la lista solo conectamos y listo
             if(Boolean(pluma_exist)){
              const port_antena =new SerialPort({path:pluma_exist?.path??'',baudRate:9600,autoOpen:false})
              await new Promise((resolve,reject)=>{
                port_antena.open((error)=>{
                  if(error)reject(false)
                  else resolve(true)
                });}) 
                
                
                emmiter.on('open-pluma',()=>{
                       port_antena.write("o")
                })

             }
             else{
              /**lanzamos ventana con los arduinos en el listasdo */
              const port_antena =new SerialPort({path:list_coms?.[0]?.path??'',baudRate:9600,autoOpen:false})
              await new Promise((resolve,reject)=>{
                port_antena.open((error)=>{
                  if(error)reject(false)
                  else resolve(true)
                });})

                emmiter.on('open-pluma',()=>{
                  port_antena.write("o")
           })

            }
        }
        else{
          /**lanzamos ventana con los arduinos en el listasdo */
           await snapDB.put("pluma",(list_coms?.[0]?.serialNumber)??'')
           const port_antena =new SerialPort({path:list_coms?.[0]?.path??'',baudRate:9600,autoOpen:false})
              await new Promise((resolve,reject)=>{
                port_antena.open((error)=>{
                  if(error)reject(false)
                  else resolve(true)
                });})
                
                emmiter.on('open-pluma',()=>{
                  port_antena.write("o")
           })
                

        }

    }
    else{
      //no hay ningun arduino conectado
      dialog.showErrorBox('not found','no se encontro ningun dispositivo para plumas')
    }

}


async function createWindow():Promise<BrowserWindow> {

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools:true
    },
  })

  // mainWindow.setMenu(null)


  mainWindow.on('ready-to-show', () => {mainWindow.show()})  

  // mainWindow.webContents.openDevTools()
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.setMenuBarVisibility(true)
  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {

  console.log('dia de la semana ',dayjs().day())
  
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {optimizer.watchWindowShortcuts(window)})

  const win=await createWindow()

  await initPluma();

  await initAntena(win);

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//metodos ipcmain
ipcMain.on('GetDatosAuto', async (event, search) => {
  event.returnValue = await fnFindAutoDatos(search)
})



 




 