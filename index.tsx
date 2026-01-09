import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const hideLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 400);
  }
};

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    
    // 在開始渲染的微任務中關閉載入條
    // 這可以確保使用者能盡快看到 React 噴出的錯誤或介面
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // 確保渲染被排入隊列後隱藏載入畫面
    requestAnimationFrame(() => {
      hideLoader();
    });

  } catch (error) {
    console.error("React 啟動崩潰:", error);
    hideLoader();
    const debug = document.getElementById('debug-msg');
    if (debug) debug.innerText = "❌ 渲染錯誤: " + (error instanceof Error ? error.message : "未知");
  }
} else {
  console.error("找不到 #root 節點");
  hideLoader();
}