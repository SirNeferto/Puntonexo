const ctaBtn = document.getElementById('cta-btn');
const numeroTelefono = "521XXXXXXXXXX"; // El número del cliente con lada

ctaBtn.addEventListener('click', () => {
    const mensaje = encodeURIComponent("¡Hola! Vi tu página web y me gustaría hacer un pedido/cotización.");
    window.location.href = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
});

