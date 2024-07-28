import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';

import { resolve } from 'path';


const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });
const PUBLIC_URL = '.'
export default defineConfig({
  source: {
    define: {
      ...publicVars,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PREVIEW': JSON.stringify(process.env.PREVIEW),
      'process.env.PUBLIC_URL': JSON.stringify(PUBLIC_URL),
      'process.env.REACT_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  html: {
    template: resolve(__dirname, 'public/index.html'),
    templateParameters: {
      PUBLIC_URL,
      APP_TITLE: '唐僧叨叨'
    },
  },
  tools: {
    rspack(config, { appendPlugins }) {
      // 仅在 RSDOCTOR 为 true 时注册插件，因为插件会增加构建耗时
      if (process.env.RSDOCTOR) {
        appendPlugins(
          new RsdoctorRspackPlugin({
            // 插件选项
          }),
        );
      }
    },
  },
  plugins: [
    pluginSvgr({ mixedImport: true }),
    pluginReact(),
  ],
  output: {
    assetPrefix: PUBLIC_URL,
    distPath: {
      root: 'build',
    },
  },
});