/**
 * script.js - Lógica principal de Ánima
 * VERSIÓN DEFINITIVA CON TOTO ANTI-SPAM Y PALABRA SALVAJE 🟣
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const API_URL = 'http://localhost:3000/api';

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
let posts = [];
let currentImageData = null;
let postToDelete = null;
let currentBoard = 'inicio';
let currentUser = null;

// 🟣 ESTADO DE TOTO 🟣
let totoActivo = false;
let totoNivel = 0;
let totoPerdonesRestantes = 0;
let totoPerdonesCompletados = 0;
let totoInterval = null;
let replyToPostId = null;

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const elements = {
    btnPublish: document.getElementById('btn-publish'),
    postContent: document.getElementById('post-content'),
    authorName: document.getElementById('author-name'),
    inputImage: document.getElementById('input-image'),
    inputMusic: document.getElementById('input-music'),
    feed: document.getElementById('feed'),
    imagePreviewContainer: document.getElementById('image-preview-container'),
    imagePreview: document.getElementById('image-preview'),
    deleteModal: document.getElementById('delete-modal'),
    btnRemoveImage: document.getElementById('btn-remove-image'),
    confirmYes: document.getElementById('confirm-yes'),
    confirmNo: document.getElementById('confirm-no'),
    rulesModal: document.getElementById('rules-modal'),
    acceptRules: document.getElementById('accept-rules'),
    currentBoardDisplay: document.getElementById('current-board-display'),
    publishArea: document.getElementById('publish-area'),
    boardIndex: document.getElementById('board-index'),
    showRulesLink: document.getElementById('show-rules-link'),
    footerRulesLink: document.getElementById('footer-rules-link'),
    replyModal: document.getElementById('reply-modal'),
    replyContent: document.getElementById('reply-content'),
    confirmReply: document.getElementById('confirm-reply'),
    cancelReply: document.getElementById('cancel-reply'),
    totalPosts: document.getElementById('total-posts'),
    currentUsers: document.getElementById('current-users'),
    activeContent: document.getElementById('active-content')
};

// ============================================
// 🟣 CREAR ELEMENTOS DE TOTO 🟣
// ============================================
function crearElementosToto() {
    // Modal de TOTO (castigo)
    if (!document.getElementById('toto-modal')) {
        const totoModal = document.createElement('div');
        totoModal.id = 'toto-modal';
        totoModal.className = 'modal-overlay hidden';
        totoModal.innerHTML = `
            <div class="modal-confirm" style="max-width: 500px; text-align: center; background: #0a0a1a; border: 3px solid #9d65c9;">
                <div style="font-size: 80px; line-height: 1; margin-bottom: 10px; animation: totoPulse 2s infinite;" id="toto-emoji">🟣</div>
                <div style="font-size: 60px; line-height: 1; margin-bottom: 10px;" id="toto-cara">(◣_◢)</div>
                <h2 style="color: #d4af37; margin-bottom: 20px;" id="toto-titulo">TOTO ENOJADO</h2>
                
                <div id="toto-reglas" style="background: rgba(157,101,201,0.1); padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; border: 1px dashed #9d65c9;">
                    <p style="color: #d4af37; font-weight: bold; text-align: center;">📜 REGLA #4: NO HAGAS SPAM</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <input type="text" id="toto-input" placeholder="Escribe aquí..." 
                           style="width: 100%; padding: 15px; background: #1a1a2e; color: white; border: 2px solid #9d65c9; border-radius: 8px; font-size: 16px; text-align: center;">
                </div>
                
                <div id="toto-contador" style="color: #8e8eb2; font-size: 18px; margin-bottom: 15px; min-height: 30px; font-weight: bold;"></div>
                
                <div id="toto-tiempo" style="color: #8e8eb2; font-size: 14px;">
                    ⏳ Tiempo restante: 5 minutos
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; color: #666;">
                    (Pista: solo una palabra funciona...)
                </div>
            </div>
        `;
        document.body.appendChild(totoModal);
        
        // Event listener para el input
        document.getElementById('toto-input').addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const texto = e.target.value.trim();
                await manejarPerdon(texto);
                e.target.value = '';
            }
        });
    }
    
    // Screamer container (para modo demonio)
    if (!document.getElementById('screamer-container')) {
        const screamer = document.createElement('div');
        screamer.id = 'screamer-container';
        screamer.className = 'modal-overlay hidden';
        screamer.style.zIndex = '9999';
        screamer.style.backgroundColor = 'black';
        screamer.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <div style="font-size: 200px; animation: spin 0.1s linear infinite; color: #ff4d6d;" id="screamer-emoji">🟣</div>
                <h1 style="color: #ff4d6d; font-size: 48px; margin-top: 50px; text-shadow: 0 0 20px red;">TOTO DICE:</h1>
                <h2 style="color: white; font-size: 36px;">"TE LA CREÍSTE?"</h2>
                <p style="color: #666; margin-top: 50px; font-size: 18px;">La página se cerrará en 3 segundos...</p>
            </div>
        `;
        document.body.appendChild(screamer);
        
        // Añadir animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes totoPulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// 🟣 FUNCIONES DE TOTO 🟣
// ============================================
function mostrarToto(nivel = 1, restantes = 10, demonio = false) {
    totoActivo = true;
    totoNivel = nivel;
    totoPerdonesRestantes = restantes;
    totoPerdonesCompletados = 0;
    
    const totoModal = document.getElementById('toto-modal');
    if (!totoModal) return;
    
    const totoCara = document.getElementById('toto-cara');
    const totoTitulo = document.getElementById('toto-titulo');
    const totoContador = document.getElementById('toto-contador');
    const totoInput = document.getElementById('toto-input');
    
    if (demonio || nivel === 2) {
        totoCara.textContent = '(╬ Ò﹏Ó)';
        totoTitulo.textContent = 'TOTO MODO DEMONIO';
        totoContador.textContent = 'Necesitas TOTO perdón';
        totoInput.disabled = false; // Permitir escribir
        totoInput.placeholder = 'Escribe TOTO perdón...';
        
        // No mostrar screamer, solo el modal
    } else {
        totoCara.textContent = '(◣_◢)';
        totoTitulo.textContent = 'TOTO ENOJADO';
        totoContador.textContent = `Te quedan ${restantes} perdones`;
        totoInput.disabled = false;
        totoInput.placeholder = 'Escribe aquí...';
        
        iniciarCuentaRegresiva(5);
    }
    
    totoModal.classList.remove('hidden');
    
    document.querySelectorAll('.publish-area, #board-index, #feed, .board-nav').forEach(el => {
        if (el) el.style.opacity = '0.3';
    });
}

function ocultarToto() {
    document.getElementById('toto-modal')?.classList.add('hidden');
    totoActivo = false;
    
    if (totoInterval) {
        clearInterval(totoInterval);
        totoInterval = null;
    }
    
    document.querySelectorAll('.publish-area, #board-index, #feed, .board-nav').forEach(el => {
        if (el) el.style.opacity = '1';
    });
}

function iniciarCuentaRegresiva(minutos) {
    const tiempoElement = document.getElementById('toto-tiempo');
    if (!tiempoElement) return;
    
    let segundosRestantes = minutos * 60;
    
    if (totoInterval) clearInterval(totoInterval);
    
    totoInterval = setInterval(() => {
        segundosRestantes--;
        
        if (segundosRestantes <= 0) {
            clearInterval(totoInterval);
            totoInterval = null;
            return;
        }
        
        const mins = Math.floor(segundosRestantes / 60);
        const segs = segundosRestantes % 60;
        tiempoElement.textContent = `⏳ Tiempo restante: ${mins}:${segs.toString().padStart(2, '0')}`;
        
    }, 1000);
}

// 🟣 MANEJAR PERDÓN CON PALABRA SALVAJE 🟣
async function manejarPerdon(texto) {
    if (!totoActivo) return;
    
    try {
        const response = await fetch(`${API_URL}/toto/perdon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: texto }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        // 🟣 MILAGRO: Palabra salvaje en modo demonio
        if (data.milagro) {
            const totoCara = document.getElementById('toto-cara');
            const totoTitulo = document.getElementById('toto-titulo');
            const totoContador = document.getElementById('toto-contador');
            const totoInput = document.getElementById('toto-input');
            
            totoCara.textContent = '(◕‿◕)';
            totoTitulo.textContent = '¡TOTO TE PERDONA!';
            totoContador.textContent = 'Has usado la palabra salvaje';
            totoInput.disabled = true;
            totoInput.placeholder = 'Milagro concedido...';
            
            setTimeout(() => {
                ocultarToto();
                loadPosts();
            }, 2000);
            
        } else if (data.completo) {
            // Perdonado modo normal
            const totoCara = document.getElementById('toto-cara');
            const totoTitulo = document.getElementById('toto-titulo');
            const totoContador = document.getElementById('toto-contador');
            const totoInput = document.getElementById('toto-input');
            
            totoCara.textContent = '(◕‿◕)';
            totoTitulo.textContent = 'PERDONADO';
            totoContador.textContent = 'Ya puedes volver a navegar';
            totoInput.disabled = true;
            totoInput.placeholder = 'Perdonado...';
            
            setTimeout(() => {
                ocultarToto();
                loadPosts();
            }, 2000);
            
        } else if (data.perdonado) {
            // Un perdón más
            totoPerdonesCompletados++;
            const totoContador = document.getElementById('toto-contador');
            const totoCara = document.getElementById('toto-cara');
            
            totoContador.textContent = `✓ Perdón ${totoPerdonesCompletados}/3 ✓`;
            
            if (totoPerdonesCompletados === 1) totoCara.textContent = '(◕‿◕)';
            if (totoPerdonesCompletados === 2) totoCara.textContent = '(◕‿◕✿)';
            if (totoPerdonesCompletados === 3) totoCara.textContent = 'ʕ•ᴥ•ʔ';
        }
        
    } catch (error) {
        console.error('Error al procesar perdón:', error);
    }
}

// 🟣 MODO DEMONIO (con TOTO :3 y piano)
function mostrarScreamer() {
    // Guardar estado
    localStorage.setItem('totoDemonio', 'true');
    sessionStorage.setItem('totoDemonio', 'true');
    
    // Crear contenedor principal
    const demonio = document.createElement('div');
    demonio.id = 'modo-demonio';
    demonio.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a12;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: 'Inter', sans-serif;
        overflow: hidden;
    `;
    
    // SVG DE TOTO
    const cara = document.createElement('div');
    cara.innerHTML = `
        <svg width="300" height="300" viewBox="0 0 100 100" style="animation: respirar 2s infinite;">
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#9d65c9;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7a3fb0;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <circle cx="50" cy="50" r="48" fill="none" stroke="#d4af37" stroke-width="1" opacity="0.3"/>
            <circle cx="50" cy="50" r="45" fill="url(#purpleGradient)" filter="url(#glow)"/>
            
            <circle cx="35" cy="40" r="7" fill="white"/>
            <circle cx="65" cy="40" r="7" fill="white"/>
            <circle cx="35" cy="40" r="3" fill="black"/>
            <circle cx="65" cy="40" r="3" fill="black"/>
            
            <circle cx="32" cy="37" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="62" cy="37" r="1.5" fill="white" opacity="0.8"/>
            
            <path d="M28 58 Q50 90, 72 58" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
            
            <circle cx="30" cy="55" r="5" fill="#ff9acb" opacity="0.3"/>
            <circle cx="70" cy="55" r="5" fill="#ff9acb" opacity="0.3"/>
            <circle cx="30" cy="30" r="8" fill="white" opacity="0.15"/>
        </svg>
    `;
    
    // Título
    const titulo = document.createElement('h1');
    titulo.textContent = '🟣 TOTO TE QUIERE 🟣';
    titulo.style.cssText = `
        color: #d4af37;
        font-size: 36px;
        margin: 20px 0 10px 0;
        text-shadow: 0 0 20px #9d65c9;
    `;
    
    // Subtítulo
    const subtitulo = document.createElement('p');
    subtitulo.textContent = 'disfruta el piano...';
    subtitulo.style.cssText = `
        color: #8e8eb2;
        font-size: 24px;
        margin-bottom: 30px;
        font-style: italic;
    `;
    
    // 🎹 AUDIO
    const audio = new Audio('/audio/piano molesto.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    
    const mensajeAudio = document.createElement('p');
    mensajeAudio.textContent = '🔊 Haz clic en cualquier parte para activar el audio...';
    mensajeAudio.style.cssText = `
        color: #ff4d6d;
        font-size: 14px;
        margin-top: 10px;
        animation: parpadear 1s infinite;
    `;
    
    function intentarReproducir() {
        audio.play().then(() => {
            mensajeAudio.remove();
            console.log('🎹 Piano sonando');
        }).catch(() => {
            demonio.appendChild(mensajeAudio);
            
            const activarAudio = function() {
                audio.play();
                mensajeAudio.remove();
                document.body.removeEventListener('click', activarAudio);
            };
            
            document.body.addEventListener('click', activarAudio, { once: true });
        });
    }
    
    intentarReproducir();
    
    if (!document.getElementById('parpadeo-style')) {
        const style = document.createElement('style');
        style.id = 'parpadeo-style';
        style.textContent = `
            @keyframes parpadear {
                0% { opacity: 0.3; }
                50% { opacity: 1; }
                100% { opacity: 0.3; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Botón falso
    const botonFalso = document.createElement('button');
    botonFalso.textContent = 'Haz clic para salir (no funciona)';
    botonFalso.style.cssText = `
        padding: 15px 30px;
        background: #9d65c9;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        opacity: 0.7;
        transition: 0.3s;
        margin-top: 20px;
    `;
    botonFalso.onmouseover = () => {
        botonFalso.style.opacity = '1';
        botonFalso.style.transform = 'scale(1.05)';
    };
    botonFalso.onmouseout = () => {
        botonFalso.style.opacity = '0.7';
        botonFalso.style.transform = 'scale(1)';
    };
    botonFalso.onclick = () => alert('TOTO dice: ❤️ Sigue intentando...');
    
    // Contador infinito
    const contador = document.createElement('div');
    contador.style.cssText = `
        margin-top: 30px;
        color: #666;
        font-size: 14px;
    `;
    let tiempo = 999;
    setInterval(() => {
        tiempo--;
        if (tiempo < 0) tiempo = 999;
        contador.textContent = `⏳ Tiempo restante: ${tiempo} segundos... (mentira, nunca termina)`;
    }, 1000);
    
    // Animaciones
    if (!document.getElementById('toto-animations')) {
        const estilo = document.createElement('style');
        estilo.id = 'toto-animations';
        estilo.textContent = `
            @keyframes respirar {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(estilo);
    }
    
    // Prevenir cierre
    window.onbeforeunload = () => {
        return 'TOTO no te deja ir...';
    };
    
    // Forzar pantalla completa
    try {
        document.documentElement.requestFullscreen();
    } catch (e) {}
    
    // Ensamblar
    demonio.appendChild(cara);
    demonio.appendChild(titulo);
    demonio.appendChild(subtitulo);
    demonio.appendChild(botonFalso);
    demonio.appendChild(contador);
    
    document.body.innerHTML = '';
    document.body.appendChild(demonio);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Ánima con TOTO iniciando...');
    
    crearElementosToto();
    
    await initializeUser();
    await loadPosts();
    
    if (!localStorage.getItem('anima_rules_accepted')) {
        setTimeout(() => showRulesModal(), 500);
    }
    
    if (elements.boardIndex) {
        elements.boardIndex.classList.remove('hidden-index');
    }
    if (elements.publishArea) {
        elements.publishArea.classList.add('hidden');
    }
    if (elements.feed) {
        elements.feed.classList.add('hidden');
    }
    
    setupEventListeners();
    setupBoardNavigation();
    
    if (elements.currentBoardDisplay) {
        elements.currentBoardDisplay.textContent = currentBoard;
    }
    
    console.log('✅ Ánima con TOTO listo!');
});

// ============================================
// AUTENTICACIÓN
// ============================================
async function initializeUser() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user.username;
            if (elements.authorName) {
                elements.authorName.value = currentUser;
            }
            console.log('👤 Usuario existente:', currentUser);
        } else {
            await createNewUser();
        }
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        await createNewUser();
    }
}

async function createNewUser() {
    const defaultNames = ['Alma', 'Errante', 'Eco', 'Luz', 'Sombra', 'Vacío'];
    const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)] + 
                      Math.floor(Math.random() * 1000);
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: randomName }),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.username;
            if (elements.authorName) {
                elements.authorName.value = currentUser;
            }
            console.log('👤 Nuevo usuario creado:', currentUser);
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        currentUser = localStorage.getItem('anima_current_user') || 'Alma';
    }
}

async function updateUsername(newName) {
    if (!newName || newName === currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newName }),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.username;
            console.log('👤 Usuario actualizado:', currentUser);
            await loadPosts();
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
    }
}

// ============================================
// CARGAR POSTS
// ============================================
async function loadPosts() {
    try {
        const url = currentBoard === 'inicio' 
            ? `${API_URL}/posts`
            : `${API_URL}/posts?board=${currentBoard}`;
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (response.ok) {
            posts = await response.json();
            renderPosts();
            updateStats();
        }
    } catch (error) {
        console.error('Error al cargar posts:', error);
    }
}

// ============================================
// PUBLICAR NUEVO POST
// ============================================
async function handlePublish(e) {
    e.preventDefault();
    
    if (totoActivo) {
        alert("TOTO dice: Primero pide perdón...");
        return;
    }
    
    const text = elements.postContent?.value.trim() || '';
    const musicUrl = elements.inputMusic?.value.trim() || '';
    
    if (!text && !currentImageData) {
        alert("No puede estar vacío. Escribe algo o sube una imagen.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: text,
                image: currentImageData,
                music: musicUrl,
                board: currentBoard
            }),
            credentials: 'include'
        });
        
        if (response.status === 429) {
            const data = await response.json();
            
            if (data.toto) {
                mostrarToto(data.nivel, data.restantes || 3, data.demonio || false);
                return;
            }
        }
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Post publicado:', data.post.id);
            
            elements.postContent.value = '';
            elements.inputMusic.value = '';
            currentImageData = null;
            elements.imagePreviewContainer?.classList.add('hidden');
            elements.imagePreview.src = '';
            elements.inputImage.value = '';
            
            await loadPosts();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo publicar'));
        }
    } catch (error) {
        console.error('Error al publicar:', error);
        alert('Error de conexión con el servidor');
    }
}

// ============================================
// RESPUESTAS
// ============================================
function openReplyModal(postId) {
    replyToPostId = postId;
    if (elements.replyModal) {
        elements.replyModal.classList.remove('hidden');
        elements.replyContent.value = '';
        elements.replyContent.focus();
    }
}

async function handleReply() {
    if (!replyToPostId || !elements.replyContent) return;
    
    const replyText = elements.replyContent.value.trim();
    if (!replyText) {
        alert("Escribe algo en tu respuesta.");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/posts/${replyToPostId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: replyText }),
            credentials: 'include'
        });
        
        if (response.ok) {
            await loadPosts();
            closeReplyModal();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo responder'));
        }
    } catch (error) {
        console.error('Error al responder:', error);
        alert('Error de conexión');
    }
}

function closeReplyModal() {
    replyToPostId = null;
    elements.replyModal?.classList.add('hidden');
}

// ============================================
// ELIMINAR POST
// ============================================
function openDeleteModal(id) {
    postToDelete = id;
    elements.deleteModal?.classList.remove('hidden');
    document.querySelectorAll('.options-menu').forEach(m => m.classList.add('hidden'));
}

async function handleConfirmDelete() {
    if (!postToDelete) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${postToDelete}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            await loadPosts();
            handleCancelDelete();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo borrar'));
        }
    } catch (error) {
        console.error('Error al borrar:', error);
        alert('Error de conexión');
    }
}

function handleCancelDelete() {
    postToDelete = null;
    elements.deleteModal?.classList.add('hidden');
}

// ============================================
// POSTDATA
// ============================================
async function addPostscript(id) {
    const psText = prompt("Escribe tu postdata (máx 140 caracteres):", "");
    if (!psText) return;
    
    if (psText.length > 140) {
        alert("La postdata es demasiado larga (máx 140 caracteres)");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/posts/${id}/postscript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: psText }),
            credentials: 'include'
        });
        
        if (response.ok) {
            await loadPosts();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'No se pudo añadir PD'));
        }
    } catch (error) {
        console.error('Error al añadir PD:', error);
        alert('Error de conexión');
    }
}

// ============================================
// RENDERIZAR POSTS
// ============================================
function renderPosts() {
    if (!elements.feed) return;
    
    if (currentBoard === 'inicio') {
        elements.feed.innerHTML = '';
        return;
    }
    
    if (posts.length === 0) {
        elements.feed.innerHTML = `<div class="empty-feed">No hay publicaciones en ${currentBoard}... Sé el primero en publicar</div>`;
        return;
    }
    
    elements.feed.innerHTML = '';
    
    posts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'post';
        article.dataset.postId = post.id;
        
        let musicHTML = '';
        if (post.music && typeof MusicModule !== 'undefined') {
            try {
                musicHTML = MusicModule.getEmbedHTML(post.music);
            } catch (e) {
                console.error('Error al generar embed:', e);
            }
        }
        
        const escapedContent = post.content ? escapeHTML(post.content) : '';
        
        const editIndicator = post.edited ? 
            `<span class="edit-indicator" title="Editado: ${post.editedDate || ''}"> (editado)</span>` : '';
        
        let postscriptsHTML = '';
        if (post.postscripts?.length > 0) {
            postscriptsHTML = '<div class="post-postscripts">';
            post.postscripts.forEach(ps => {
                postscriptsHTML += `
                    <div class="postscript-item">
                        <span class="postscript-marker">✎ PD:</span>
                        <span class="postscript-text">${escapeHTML(ps.text)}</span>
                        <span class="postscript-date">${ps.date}</span>
                    </div>
                `;
            });
            postscriptsHTML += '</div>';
        }
        
        let repliesHTML = '';
        if (post.replies?.length > 0) {
            repliesHTML = '<div class="replies-container">';
            post.replies.forEach(reply => {
                repliesHTML += `
                    <div class="reply">
                        <div class="reply-metadata">
                            <span class="reply-author">${escapeHTML(reply.author)}</span>
                            <span class="reply-date">${reply.date}</span>
                        </div>
                        <div class="reply-text">${escapeHTML(reply.content)}</div>
                    </div>
                `;
            });
            repliesHTML += '</div>';
        }
        
        const replyButton = `<button class="reply-btn" data-post-id="${post.id}">↩️ Responder</button>`;
        
        article.innerHTML = `
            <div class="post-metadata">
                <span class="post-author">${escapeHTML(post.author)}</span>
                <span class="post-date">${post.date}</span>
                <span class="post-id">ID: ${post.id.toString().slice(-6)}</span>
                ${replyButton}
                <div class="post-options">
                    <button class="btn-dots" data-post-id="${post.id}">⋮</button>
                    <div id="menu-${post.id}" class="options-menu hidden">
                        ${post.author === currentUser ? `
                            <button class="edit-btn" data-post-id="${post.id}">✎ Editar</button>
                            <button class="delete-btn" data-post-id="${post.id}">🗑️ Borrar</button>
                        ` : ''}
                        <button class="postscript-btn" data-post-id="${post.id}">✎ Añadir PD</button>
                    </div>
                </div>
            </div>
            <div class="post-body">
                ${post.image ? `<img src="${escapeHTML(post.image)}" class="post-img" onclick="window.open(this.src)">` : ''}
                ${post.content ? `<p class="post-text">${escapedContent}${editIndicator}</p>` : ''}
                ${postscriptsHTML}
                ${repliesHTML}
                ${musicHTML ? `<div class="music-container">${musicHTML}</div>` : ''}
            </div>
        `;
        
        elements.feed.appendChild(article);
    });
}

// ============================================
// ESTADÍSTICAS
// ============================================
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        if (response.ok) {
            const stats = await response.json();
            if (elements.totalPosts) elements.totalPosts.textContent = stats.totalPosts;
            if (elements.currentUsers) elements.currentUsers.textContent = stats.currentUsers;
            if (elements.activeContent) elements.activeContent.textContent = stats.activeContent;
        }
    } catch (error) {
        console.error('Error al cargar stats:', error);
    }
}

// ============================================
// NAVEGACIÓN ENTRE TABLONES
// ============================================
function setupBoardNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const board = e.target.dataset.board;
            if (board) switchBoard(board);
        });
    });
}

async function switchBoard(board) {
    currentBoard = board;
    
    if (elements.currentBoardDisplay) {
        elements.currentBoardDisplay.textContent = board;
    }
    
    if (elements.boardIndex) {
        if (board === 'inicio') {
            elements.boardIndex.classList.remove('hidden-index');
            elements.publishArea?.classList.add('hidden');
            if (elements.feed) elements.feed.innerHTML = '';
        } else {
            elements.boardIndex.classList.add('hidden-index');
            elements.publishArea?.classList.remove('hidden');
            elements.feed?.classList.remove('hidden');
        }
    }
    
    await loadPosts();
}

// ============================================
// EVENTOS
// ============================================
function setupEventListeners() {
    elements.inputImage?.addEventListener('change', handleImageSelect);
    elements.btnRemoveImage?.addEventListener('click', handleImageRemove);
    elements.btnPublish?.addEventListener('click', handlePublish);
    
    elements.authorName?.addEventListener('blur', (e) => {
        updateUsername(e.target.value.trim());

    });

    function setupEventListeners() {
    elements.inputImage?.addEventListener('change', handleImageSelect);
    elements.btnRemoveImage?.addEventListener('click', handleImageRemove);
    elements.btnPublish?.addEventListener('click', handlePublish);
    
    elements.authorName?.addEventListener('blur', (e) => {
        updateUsername(e.target.value.trim());
    });

    // ============================================
    // 🟣 AQUÍ PEGAS EL CÓDIGO DEL BUZÓN Y +18 🟣
    // ============================================
    // Buzón de sugerencias
    const buzonEnviar = document.getElementById('buzon-enviar');
    const buzonMensaje = document.getElementById('buzon-mensaje');

    if (buzonEnviar) {
        buzonEnviar.addEventListener('click', () => {
            const mensaje = buzonMensaje.value.trim();
            if (!mensaje) {
                alert("Escribe algo antes de enviar.");
                return;
            }
            
            alert("📬 Mensaje enviado a TOTO. Él lo leerá... si no es spam.");
            buzonMensaje.value = '';
        });
    }

    // Confirmación para foros +18
    document.querySelectorAll('.adult-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("🔞 Eres mayor de edad? TOTO vigila.")) {
                const board = e.target.dataset.board;
                if (board) switchBoard(board);
            }
        });
    });
    
    // ... (el resto de eventos sigue aquí)
    elements.confirmYes?.addEventListener('click', handleConfirmDelete);
    elements.confirmNo?.addEventListener('click', handleCancelDelete);
    // etc...
}
    
    elements.confirmYes?.addEventListener('click', handleConfirmDelete);
    elements.confirmNo?.addEventListener('click', handleCancelDelete);
    elements.acceptRules?.addEventListener('click', hideRulesModal);
    elements.confirmReply?.addEventListener('click', handleReply);
    elements.cancelReply?.addEventListener('click', closeReplyModal);
    
    elements.showRulesLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showRulesModal();
    });
    
    elements.footerRulesLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showRulesModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!elements.deleteModal?.classList.contains('hidden')) handleCancelDelete();
            if (!elements.rulesModal?.classList.contains('hidden')) hideRulesModal();
            if (!elements.replyModal?.classList.contains('hidden')) closeReplyModal();
        }
    });
    
    setupDelegatedEvents();
}

function setupDelegatedEvents() {
    elements.feed?.addEventListener('click', (e) => {
        const btnDots = e.target.closest('.btn-dots');
        if (btnDots) {
            e.stopPropagation();
            const postId = btnDots.dataset.postId;
            if (postId) toggleMenu(Number(postId));
            return;
        }
        
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const postId = deleteBtn.dataset.postId;
            if (postId) openDeleteModal(Number(postId));
            return;
        }
        
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            e.stopPropagation();
            const postId = editBtn.dataset.postId;
            if (postId) openEditModal(Number(postId));
            return;
        }
        
        const psBtn = e.target.closest('.postscript-btn');
        if (psBtn) {
            e.stopPropagation();
            const postId = psBtn.dataset.postId;
            if (postId) addPostscript(Number(postId));
            return;
        }
        
        const replyBtn = e.target.closest('.reply-btn');
        if (replyBtn) {
            e.stopPropagation();
            const postId = replyBtn.dataset.postId;
            if (postId) openReplyModal(Number(postId));
            return;
        }
        
        if (!e.target.closest('.options-menu')) {
            document.querySelectorAll('.options-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert("Solo imágenes.");
        elements.inputImage.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert("Máximo 5MB.");
        elements.inputImage.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (f) => {
        currentImageData = f.target.result;
        elements.imagePreview.src = currentImageData;
        elements.imagePreviewContainer?.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function handleImageRemove() {
    currentImageData = null;
    elements.imagePreviewContainer?.classList.add('hidden');
    elements.imagePreview.src = '';
    elements.inputImage.value = '';
}

function toggleMenu(id) {
    document.querySelectorAll('.options-menu').forEach(menu => {
        if (menu.id !== `menu-${id}`) {
            menu.classList.add('hidden');
        }
    });
    document.getElementById(`menu-${id}`)?.classList.toggle('hidden');
}

function showRulesModal() {
    elements.rulesModal?.classList.remove('hidden');
}

function hideRulesModal() {
    elements.rulesModal?.classList.add('hidden');
    localStorage.setItem('anima_rules_accepted', 'true');
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function openEditModal(id) {
    alert('Función de edición próximamente...');
}

// ============================================
// EXPORTAR GLOBALES
// ============================================
window.toggleMenu = toggleMenu;
window.openDeleteModal = openDeleteModal;
window.openReplyModal = openReplyModal;