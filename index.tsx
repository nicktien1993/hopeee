import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 🚀 關鍵修復：只要這份檔案被執行，就立即隱藏 Loading 畫面
const loader = document.getElementById('initial-loader');
if (loader) {
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
    console.log("✅ App 渲染指令已發送");
  } catch (error) {
    console.error("❌ React 渲染崩潰:", error);
    const debug = document.getElementById('debug-msg');
    if (debug) debug.innerText = "React 啟動失敗: " + (error instanceof Error ? error.message : "未知錯誤");
  }
}