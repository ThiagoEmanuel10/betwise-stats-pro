
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupInstallPrompt } from './registerSW'

// Registra o service worker para funcionalidades PWA
registerServiceWorker();

// Configura o prompt de instalação
setupInstallPrompt();

createRoot(document.getElementById("root")!).render(<App />);
