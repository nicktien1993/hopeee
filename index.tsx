import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const hideLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  }
};

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    // 渲染
    root.render(<App />);
    // 成功執行到這一步就關閉載入畫面
    hideLoader();
  } catch (error) {
    console.error("App Render Error:", error);
    hideLoader();
    const debug = document.getElementById('debug-msg');
    if (debug) debug.innerText = "渲染出錯，請檢查控制台。";
  }
}