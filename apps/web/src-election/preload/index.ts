import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("__POWERED_ELECTRON__", true);