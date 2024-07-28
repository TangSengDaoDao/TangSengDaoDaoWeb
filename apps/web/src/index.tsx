import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import { BaseModule, WKApp } from "@tsdaodao/base";
import { LoginModule } from "@tsdaodao/login";
import { DataSourceModule } from "@tsdaodao/datasource";
import { ContactsModule } from "@tsdaodao/contacts";

import App from "@/App";
// 应用配置
import { APP_API_URL, APP_VERSION } from "@/config";

import "@/index.css";

WKApp.apiClient.config.apiURL = APP_API_URL;

WKApp.apiClient.config.tokenCallback = () => {
  return WKApp.loginInfo.token;
};
WKApp.config.appVersion = `${APP_VERSION}`;


WKApp.loginInfo.load(); // 加载登录信息

WKApp.shared.registerModule(new BaseModule()); // 基础模块
WKApp.shared.registerModule(new DataSourceModule()); // 数据源模块
WKApp.shared.registerModule(new LoginModule()); // 登录模块
WKApp.shared.registerModule(new ContactsModule()); // 联系模块

WKApp.shared.startup(); // app启动

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
reportWebVitals();
