import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const hideLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.5s ease';
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
    
    // 渲染 App
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // 在下一幀立即隱藏載入畫面，避免 React 渲染延遲導致的白屏感
    requestAnimationFrame(() => {
      // 給予一點點緩衝時間讓瀏覽器處理初次渲染
      setTimeout(hideLoader, 100);
    });

  } catch (error) {
    console.error("React 啟動崩潰:", error);
    hideLoader();
    const debug = document.getElementById('debug-msg');
    if (debug) debug.innerText = "❌ 渲染錯誤: " + (error instanceof Error ? error.message : "未知");
  }
} else {
  hideLoader();
}