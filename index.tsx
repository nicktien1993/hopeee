import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * 強制隱藏載入動畫
 */
const forceHideLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
};

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 如果代碼執行到這裡沒有崩潰，代表基本模組載入是成功的
    // 我們在下一幀隱藏動畫
    requestAnimationFrame(() => {
      forceHideLoader();
    });

  } catch (error) {
    console.error("Critical Start Error:", error);
    forceHideLoader();
    const debug = document.getElementById('debug-msg');
    if (debug) {
      debug.innerText = "啟動崩潰: " + (error instanceof Error ? error.message : "未知錯誤");
    }
  }
} else {
  forceHideLoader();
  console.error("Root container not found");
}