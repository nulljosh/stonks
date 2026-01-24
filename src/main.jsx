import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

console.log('main.jsx loaded');

try {
  const root = document.getElementById('root');
  console.log('Root element:', root);

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );

  console.log('App rendered successfully');
} catch (err) {
  console.error('Failed to render app:', err);
  document.body.innerHTML = `<div style="padding:40px;background:#1a1a1a;color:#ff6b6b;font-family:monospace"><h1>Render Error</h1><pre>${err.stack}</pre></div>`;
}
