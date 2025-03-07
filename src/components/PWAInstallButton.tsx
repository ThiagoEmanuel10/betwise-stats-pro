
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

export const PWAInstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Armazena o evento beforeinstallprompt para uso posterior
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    // Detecta quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    // Verifica se o app já está instalado (modo standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Mostra o prompt de instalação
    installPrompt.prompt();

    // Aguarda a resposta do usuário
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    // Clear the prompt saved, as it can only be used once
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable || isInstalled) return null;

  return (
    <Button
      id="install-button"
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
      onClick={handleInstallClick}
      aria-label="Instalar aplicativo"
    >
      <Download size={16} aria-hidden="true" />
      <span>Instalar app</span>
    </Button>
  );
};
