import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
const loader = document.getElementById('loading-screen');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // 渲染完成後移除 Loading
    setTimeout(() => {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }, 800);
}