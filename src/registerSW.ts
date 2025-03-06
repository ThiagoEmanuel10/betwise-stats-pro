
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registrado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.error('Erro ao registrar ServiceWorker:', error);
        });
    });
  }
}

// Função para verificar se o app pode ser instalado e mostrar um prompt personalizado
export function setupInstallPrompt() {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Previne que o Chrome mostre o prompt de instalação automático
    e.preventDefault();
    // Armazena o evento para poder disparar mais tarde
    deferredPrompt = e;
    
    // Opcional: Mostrar um elemento UI indicando que o app pode ser instalado
    const installBtn = document.getElementById('install-button');
    if (installBtn) {
      installBtn.style.display = 'block';
      
      installBtn.addEventListener('click', () => {
        // Mostra o prompt de instalação
        deferredPrompt.prompt();
        
        // Espera o usuário responder ao prompt
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Usuário aceitou a instalação do A2HS');
          } else {
            console.log('Usuário recusou a instalação do A2HS');
          }
          // Limpa o prompt salvo, ele pode ser usado apenas uma vez
          deferredPrompt = null;
          
          // Esconde o botão de instalação
          installBtn.style.display = 'none';
        });
      });
    }
  });
  
  // Detecta quando o app foi instalado com sucesso
  window.addEventListener('appinstalled', (evt) => {
    console.log('App instalado com sucesso!');
  });
}
