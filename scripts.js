document.addEventListener('DOMContentLoaded', () => {
    const ctaBtn = document.getElementById('cta-btn');
    
    // Configura aquí tu número de WhatsApp (incluye código de país)
    const miNumero = "521XXXXXXXXXX"; 

    ctaBtn.addEventListener('click', () => {
        const mensaje = encodeURIComponent("Hola Punto Nexo, me gustaría recibir información sobre sus servicios de desarrollo web.");
        const url = `https://wa.me/${miNumero}?text=${mensaje}`;
        
        // Efecto visual antes de redirigir
        ctaBtn.innerText = "Abriendo WhatsApp...";
        setTimeout(() => {
            window.open(url, '_blank');
            ctaBtn.innerText = "Contactar por WhatsApp";
        }, 800);
    });
});