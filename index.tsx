import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  
  // 嘗試渲染 App
  try {
    root.render(<App />);
    
    // 監控渲染完成後關閉 Loader
    const checkVisible = () => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 300);
      }
    };
    
    // 給予極短延遲確保 DOM 已生成
    setTimeout(checkVisible, 100);
  } catch (error) {
    console.error("Critical App Crash:", error);
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.innerHTML = `<p style="color:red; padding:20px;">啟動失敗：${error instanceof Error ? error.message : '未知錯誤'}</p>`;
    }
  }
}