let APP_API_URL = "https://api.botgate.cn/v1/";

const IS_DESKTOP = (window as any).__TAURI_IPC__ || (window as any)?.__POWERED_ELECTRON__;
const IS_PORD = process.env.NODE_ENV === 'production' ? true : false;
const IS_PREVIEW = process.env.PREVIEW ? true : false;

// 判断是否WEB
if (IS_DESKTOP) {
  console.log("桌面环境TAURI或者ELECTRON");
} else {
  console.log("WEB环境");
}

// 判断是否正式
if(!IS_PREVIEW && IS_PORD){
  console.log("正式环境");
  // 正式环境地址 (通用打包镜像，用此相对地址),打包出来的镜像可以通过API_URL环境变量来修改API地址
  APP_API_URL = "/api/v1/";
}

const APP_VERSION = process.env.REACT_APP_VERSION || "0.0.0";
const APP_NAME = "唐僧叨叨"

export {APP_API_URL, APP_VERSION, APP_NAME}