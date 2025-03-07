
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupInstallPrompt } from './registerSW'

// Configura atributos de acessibilidade no HTML
document.documentElement.lang = 'pt-BR';
document.documentElement.setAttribute('dir', 'ltr');

// Identifica se o usuário prefere modo de movimento reduzido
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  document.documentElement.classList.add('reduce-motion');
}

// Registra o service worker para funcionalidades PWA
registerServiceWorker();

// Configura o prompt de instalação
setupInstallPrompt();

createRoot(document.getElementById("root")!).render(<App />);
