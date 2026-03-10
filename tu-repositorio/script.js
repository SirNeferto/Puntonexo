/**
 * script.js - Ánima para GitHub Pages
 * Versión con localStorage - ¡Funciona 100% en GitHub Pages!
 */

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
let posts = [];
let currentImageData = null;
let postToDelete = null;
let currentBoard = 'inicio';
let currentUser = localStorage.getItem('anima_current_user') || 'Alma';
let replyToPostId = null;

// 🟣 ESTADO DE TOTO 🟣
let totoActivo = false;
let totoPerdonesRestantes = 0;
let totoPerdonesCompletados = 0;
let totoInterval = null;
let tiempoCastigo = 0;

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
    activeContent: document.getElementById('active-content'),
    buzonEnviar: document.getElementById('buzon-enviar'),
    buzonMensaje: document.getElementById('buzon-mensaje')
};

// ============================================
// FUNCIONES DE ALMACENAMIENTO
// ============================================

// Cargar posts desde localStorage
function loadPosts() {
    try {
        const allPosts = JSON.parse(localStorage.getItem('anima_posts') || '[]');
        
        // Filtrar por tablero actual
        posts = currentBoard === 'inicio' 
            ? [] // En inicio no mostramos posts
            : allPosts.filter(post => post.board === currentBoard)
                       .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderPosts();
        updateStats();
    } catch (error) {
        console.error('Error al cargar posts:', error);
        posts = [];
        renderPosts();
    }
}

// Guardar un nuevo post
function savePost(postData) {
    const allPosts = JSON.parse(localStorage.getItem('anima_posts') || '[]');
    
    // Verificar spam (3 posts en 1 minuto)
    const ahora = Date.now();
    const userPosts = allPosts.filter(p => 
        p.author === currentUser && 
        (ahora - new Date(p.date).getTime()) < 60000
    );
    
    if (userPosts.length >= 3) {
        activarToto(3);
        return false;
    }
    
    const newPost = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        timestamp: ahora,
        author: currentUser,
        board: currentBoard,
        content: postData.content || '',
        image: postData.image || null,
        music: postData.music || '',
        replies: [],
        postscripts: [],
        edited: false
    };
    
    allPosts.unshift(newPost);
    localStorage.setItem('anima_posts', JSON.stringify(allPosts));
    return true;
}

// ============================================
// 🟣 FUNCIONES DE TOTO 🟣
// ============================================

function activarToto(restantes) {
    totoActivo = true;
    totoPerdonesRestantes = restantes;
    totoPerdonesCompletados = 0;
    tiempoCastigo = 30; // 30 segundos de castigo
    
    // Mostrar modal de TOTO
    const totoModal = document.getElementById('toto-modal');
    if (totoModal) {
        document.getElementById('toto-cara').textContent = '(◣_◢)';
        document.getElementById('toto-titulo').textContent = 'TOTO ENOJADO';
        document.getElementById('toto-contador').textContent = `Te quedan ${restantes} perdones`;
        document.getElementById('toto-input').disabled = false;
        totoModal.classList.remove('hidden');
        
        // Oscurecer el resto
        document.querySelectorAll('.publish-area, #board-index, #feed, .board-nav').forEach(el => {
            if (el) el.style.opacity = '0.3';
        });
        
        // Iniciar cuenta regresiva
        iniciarCuentaRegresiva();
    } else {
        // Fallback si no hay modal
        alert(`🟣 TOTO dice: Has hecho spam! Espera ${tiempoCastigo} segundos.`);
        setTimeout(() => {
            totoActivo = false;
            alert('🟣 TOTO te ha perdonado... por ahora.');
        }, tiempoCastigo * 1000);
    }
}

function iniciarCuentaRegresiva() {
    const tiempoElement = document.getElementById('toto-tiempo');
    if (!tiempoElement) return;
    
    if (totoInterval) clearInterval(totoInterval);
    
    totoInterval = setInterval(() => {
        tiempoCastigo--;
        
        if (tiempoCastigo <= 0) {
            clearInterval(totoInterval);
            totoInterval = null;
            ocultarToto();
            return;
        }
        
        tiempoElement.textContent = `⏳ Tiempo restante: ${tiempoCastigo} segundos`;
    }, 1000);
}

function manejarPerdon() {
    const input = document.getElementById('toto-input');
    const texto = input.value.trim().toLowerCase();
    
    if (texto === 'toto perdon') {
        totoPerdonesCompletados++;
        
        const totoCara = document.getElementById('toto-cara');
        const totoContador = document.getElementById('toto-contador');
        
        if (totoPerdonesCompletados === 1) {
            totoCara.textContent = '(◕‿◕)';
            totoContador.textContent = '✓ Perdón 1/3 ✓';
        }
        if (totoPerdonesCompletados === 2) {
            totoCara.textContent = '(◕‿◕✿)';
            totoContador.textContent = '✓ Perdón 2/3 ✓';
        }
        if (totoPerdonesCompletados === 3) {
            totoCara.textContent = 'ʕ•ᴥ•ʔ';
            totoContador.textContent = '¡PERDONADO!';
            
            setTimeout(() => {
                ocultarToto();
            }, 1500);
        }
        
        input.value = '';
    } else {
        input.value = '';
        input.placeholder = '❌ No es la frase mágica...';
        setTimeout(() => {
            input.placeholder = 'Escribe "toto perdon"';
        }, 2000);
    }
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

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

async function handlePublish(e) {
    e.preventDefault();
    
    if (totoActivo) {
        alert("🟣 TOTO dice: Primero pide perdón...");
        return;
    }
    
    const text = elements.postContent?.value.trim() || '';
    const musicUrl = elements.inputMusic?.value.trim() || '';
    
    if (!text && !currentImageData) {
        alert("No puede estar vacío. Escribe algo o sube una imagen.");
        return;
    }

    const postData = {
        content: text,
        image: currentImageData,
        music: musicUrl
    };
    
    if (savePost(postData)) {
        // Limpiar formulario
        elements.postContent.value = '';
        elements.inputMusic.value = '';
        currentImageData = null;
        elements.imagePreviewContainer?.classList.add('hidden');
        elements.imagePreview.src = '';
        elements.inputImage.value = '';
        
        // Recargar posts
        loadPosts();
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

function handleReply() {
    if (!replyToPostId || !elements.replyContent) return;
    
    const replyText = elements.replyContent.value.trim();
    if (!replyText) {
        alert("Escribe algo en tu respuesta.");
        return;
    }
    
    const allPosts = JSON.parse(localStorage.getItem('anima_posts') || '[]');
    const postIndex = allPosts.findIndex(p => p.id === replyToPostId);
    
    if (postIndex !== -1) {
        if (!allPosts[postIndex].replies) allPosts[postIndex].replies = [];
        allPosts[postIndex].replies.push({
            author: currentUser,
            content: replyText,
            date: new Date().toLocaleString()
        });
        
        localStorage.setItem('anima_posts', JSON.stringify(allPosts));
        loadPosts();
        closeReplyModal();
    }
}

function closeReplyModal() {
    replyToPostId = null;
    elements.replyModal?.classList.add('hidden');
}

// ============================================
// POSTSCRIPTS
// ============================================

function addPostscript(id) {
    const psText = prompt("Escribe tu postdata (máx 140 caracteres):", "");
    if (!psText) return;
    
    if (psText.length > 140) {
        alert("La postdata es demasiado larga (máx 140 caracteres)");
        return;
    }
    
    const allPosts = JSON.parse(localStorage.getItem('anima_posts') || '[]');
    const postIndex = allPosts.findIndex(p => p.id === id);
    
    if (postIndex !== -1) {
        if (!allPosts[postIndex].postscripts) allPosts[postIndex].postscripts = [];
        allPosts[postIndex].postscripts.push({
            text: psText,
            date: new Date().toLocaleString()
        });
        
        localStorage.setItem('anima_posts', JSON.stringify(allPosts));
        loadPosts();
    }
}

// ============================================
// ELIMINAR POST
// ============================================

function openDeleteModal(id) {
    postToDelete = id;
    elements.deleteModal?.classList.remove('hidden');
    document.querySelectorAll('.options-menu').forEach(m => m.classList.add('hidden'));
}

function handleConfirmDelete() {
    if (!postToDelete) return;
    
    const allPosts = JSON.parse(localStorage.getItem('anima_posts') || '[]');
    const filtered = allPosts.filter(p => p.id !== postToDelete);
    localStorage.setItem('anima_posts', JSON.stringify(filtered));
    
    loadPosts();
    handleCancelDelete();
}

function handleCancelDelete() {
    postToDelete = null;
    elements.deleteModal?.classList.add('hidden');
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
        
        const escapedContent = escapeHTML(post.content || '');
        
        const editIndicator = post.edited ? 
            `<span class="edit-indicator"> (editado)</span>` : '';
        
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

function updateStats() {
    const allPosts = JSON.parse(localStorage.getItem('anima_posts') || '[]');
    
    if (elements.totalPosts) {
        elements.totalPosts.textContent = allPosts.length;
    }
    
    if (elements.currentUsers) {
        const uniqueUsers = new Set(allPosts.map(p => p.author));
        elements.currentUsers.textContent = uniqueUsers.size;
    }
    
    if (elements.activeContent) {
        const totalSize = (JSON.stringify(allPosts).length / 1024).toFixed(2);
        elements.activeContent.textContent = totalSize + ' KB';
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

function switchBoard(board) {
    currentBoard = board;
    
    if (elements.currentBoardDisplay) {
        elements.currentBoardDisplay.textContent = board;
    }
    
    if (elements.boardIndex) {
        if (board === 'inicio') {
            elements.boardIndex.classList.remove('hidden-index');
            elements.publishArea?.classList.add('hidden');
            elements.feed?.classList.add('hidden');
        } else {
            elements.boardIndex.classList.add('hidden-index');
            elements.publishArea?.classList.remove('hidden');
            elements.feed?.classList.remove('hidden');
        }
    }
    
    loadPosts();
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

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Eventos principales
    elements.inputImage?.addEventListener('change', handleImageSelect);
    elements.btnRemoveImage?.addEventListener('click', handleImageRemove);
    elements.btnPublish?.addEventListener('click', handlePublish);
    
    elements.authorName?.addEventListener('blur', (e) => {
        const newName = e.target.value.trim();
        if (newName && newName !== currentUser) {
            currentUser = newName;
            localStorage.setItem('anima_current_user', currentUser);
        }
    });
    
    // Buzón de sugerencias
    if (elements.buzonEnviar && elements.buzonMensaje) {
        elements.buzonEnviar.addEventListener('click', () => {
            const mensaje = elements.buzonMensaje.value.trim();
            if (!mensaje) {
                alert("Escribe algo antes de enviar.");
                return;
            }
            
            // Guardar en localStorage
            const sugerencias = JSON.parse(localStorage.getItem('anima_sugerencias') || '[]');
            sugerencias.push({
                mensaje: mensaje,
                fecha: new Date().toLocaleString(),
                usuario: currentUser
            });
            localStorage.setItem('anima_sugerencias', JSON.stringify(sugerencias));
            
            alert("📬 Mensaje enviado a TOTO. Él lo leerá en el vacío digital...");
            elements.buzonMensaje.value = '';
        });
    }
    
    // Links de reglas
    elements.showRulesLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showRulesModal();
    });
    
    elements.footerRulesLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showRulesModal();
    });
    
    // Botones de modales
    elements.acceptRules?.addEventListener('click', hideRulesModal);
    elements.confirmYes?.addEventListener('click', handleConfirmDelete);
    elements.confirmNo?.addEventListener('click', handleCancelDelete);
    elements.confirmReply?.addEventListener('click', handleReply);
    elements.cancelReply?.addEventListener('click', closeReplyModal);
    
    // Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!elements.deleteModal?.classList.contains('hidden')) handleCancelDelete();
            if (!elements.rulesModal?.classList.contains('hidden')) hideRulesModal();
            if (!elements.replyModal?.classList.contains('hidden')) closeReplyModal();
        }
    });
    
    // Eventos delegados en el feed
    setupDelegatedEvents();
    
    // Evento para input de TOTO
    const totoInput = document.getElementById('toto-input');
    if (totoInput) {
        totoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                manejarPerdon();
            }
        });
    }
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
        
        // Cerrar menús al hacer clic fuera
        if (!e.target.closest('.options-menu')) {
            document.querySelectorAll('.options-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ánima para GitHub Pages iniciando...');
    
    // Cargar posts iniciales
    loadPosts();
    
    // Mostrar reglas si es primera vez
    if (!localStorage.getItem('anima_rules_accepted')) {
        setTimeout(() => showRulesModal(), 500);
    }
    
    // Configurar UI inicial
    if (elements.boardIndex) {
        elements.boardIndex.classList.remove('hidden-index');
    }
    if (elements.publishArea) {
        elements.publishArea.classList.add('hidden');
    }
    if (elements.feed) {
        elements.feed.classList.add('hidden');
    }
    
    // Configurar eventos
    setupEventListeners();
    setupBoardNavigation();
    
    // Configurar nombre de usuario
    if (elements.authorName) {
        elements.authorName.value = currentUser;
    }
    
    if (elements.currentBoardDisplay) {
        elements.currentBoardDisplay.textContent = currentBoard;
    }
    
    console.log('✅ Ánima para GitHub Pages lista!');
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.toggleMenu = toggleMenu;
window.openDeleteModal = openDeleteModal;
window.openReplyModal = openReplyModal;
window.addPostscript = addPostscript;