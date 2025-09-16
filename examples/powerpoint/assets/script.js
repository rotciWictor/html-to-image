// Script básico para templates
document.addEventListener('DOMContentLoaded', function() {
    console.log('Template carregado com sucesso!');
    
    // Aguardar fontes carregarem
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Fontes carregadas');
            document.body.classList.add('fonts-loaded');
        });
    }
    
    // Adicionar classe quando tudo estiver pronto
    setTimeout(function() {
        document.body.classList.add('ready');
    }, 100);
});

// Função utilitária para aguardar elemento
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
        }, timeout);
    });
}
