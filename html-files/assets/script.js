// assets/script.js
console.log('Assets carregados com sucesso!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('HTML processado para conversão em imagem');
    
    const elementsWithAssets = document.querySelectorAll('[src*="assets"], [href*="assets"]');
    elementsWithAssets.forEach(el => {
        el.classList.add('asset-loaded');
    });
});