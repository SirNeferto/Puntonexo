// server.js - Backend seguro para Ánimas con TOTO ANTI-SPAM
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

// ============================================
// 🟣 MODO CREADOR Y PODERES 🟣
// ============================================
const APODO_PODER = 'TOTO :3';           // Apodo que da poder temporal
const PALABRA_SALVAJE = 'TOTO perdón';    // Palabra para salir del modo demonio
const CREADOR_REAL = 'Toto';              // ← TU NOMBRE (el que siempre tiene poder)
const DURACION_PODER = 60 * 60 * 1000;    // 1 hora para mortales
const usuariosConPoder = new Map();        // Quiénes tienen poder temporal

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.static('public'));

// ============================================
// BASE DE DATOS SIMULADA
// ============================================
const posts = [];
const users = new Map();

// ============================================
// 🟣 TOTO: SISTEMA ANTI-SPAM 🟣
// ============================================
const spamTracker = new Map();
const perdonados = new Map();

// Configuración MODO SUFRIMIENTO (para ti)
const CONFIG = {
    SPAM_LIMIT: 30,              // 30 posts en...
    SPAM_WINDOW: 30 * 1000,      // ...30 segundos
    PERDONES_NECESARIOS: 10,     // 10 perdones para salir
    TIEMPO_CASTIGO: 5 * 60 * 1000, // 5 minutos (lo dejamos igual)
    MODO_PRODUCCION: false
};

// ============================================
// 🟣 FUNCIÓN PARA VERIFICAR PODER 🟣
// ============================================
function tienePoder(username, ip) {
    // El creador real siempre tiene poder eterno
    if (username === CREADOR_REAL) {
        console.log(`👑 Creador detectado: ${username} - Poder eterno`);
        return true;
    }
    
    // Verificar poder temporal (por usar el apodo mágico)
    if (usuariosConPoder.has(username)) {
        const expira = usuariosConPoder.get(username);
        if (Date.now() < expira) {
            const minutosRestantes = Math.round((expira - Date.now()) / 60000);
            console.log(`✨ ${username} tiene poder por ${minutosRestantes} minutos más`);
            return true;
        } else {
            usuariosConPoder.delete(username);
            console.log(`⌛ Poder de ${username} ha expirado`);
        }
    }
    
    return false;
}

// ============================================
// 🟣 DETECTOR DE SPAM CON PODER 🟣
// ============================================
function detectarSpam(ip, username) {
    const ahora = Date.now();
    
    // 🟣 SI TIENE PODER, NO HAY SPAM 🟣
    if (tienePoder(username, ip)) {
        return { spam: false };
    }
    
    // Si ya está en modo demonio
    if (perdonados.has(ip) && perdonados.get(ip).modoDemonio) {
        return { spam: true, nivel: 2, ip, demonio: true };
    }
    
    if (!spamTracker.has(ip)) {
        spamTracker.set(ip, {
            posts: [],
            nivelCastigo: 0,
            perdonesRestantes: 0,
            fechaCastigo: null
        });
    }
    
    const datos = spamTracker.get(ip);
    datos.posts = datos.posts.filter(t => ahora - t < CONFIG.SPAM_WINDOW);
    
    if (datos.nivelCastigo > 0) {
        if (datos.fechaCastigo && (ahora - datos.fechaCastigo > CONFIG.TIEMPO_CASTIGO)) {
            datos.nivelCastigo = 0;
            datos.perdonesRestantes = 0;
            datos.fechaCastigo = null;
            spamTracker.set(ip, datos);
            return { spam: false };
        }
        
        return { 
            spam: true, 
            nivel: datos.nivelCastigo,
            perdonesRestantes: datos.perdonesRestantes,
            ip 
        };
    }
    
    if (datos.posts.length >= CONFIG.SPAM_LIMIT) {
        datos.nivelCastigo = 1;
        datos.perdonesRestantes = CONFIG.PERDONES_NECESARIOS;
        datos.fechaCastigo = ahora;
        spamTracker.set(ip, datos);
        
        return { 
            spam: true, 
            nivel: 1, 
            perdonesRestantes: CONFIG.PERDONES_NECESARIOS,
            ip 
        };
    }
    
    return { spam: false };
}

// ============================================
// 🟣 PROCESAR PERDÓN (CON PALABRA SALVAJE) 🟣
// ============================================
function procesarPerdon(ip, texto) {
    if (!spamTracker.has(ip)) {
        return { perdonado: false, mensaje: 'No estás castigado' };
    }
    
    const datos = spamTracker.get(ip);
    
    if (datos.nivelCastigo === 0) {
        return { perdonado: false, mensaje: 'No estás castigado' };
    }
    
    // MODO DEMONIO: necesita la palabra salvaje
    if (perdonados.has(ip) && perdonados.get(ip).modoDemonio) {
        if (texto === PALABRA_SALVAJE) {
            // Liberar del modo demonio
            perdonados.delete(ip);
            datos.nivelCastigo = 0;
            datos.perdonesRestantes = 0;
            spamTracker.set(ip, datos);
            return { perdonado: true, completo: true, milagro: true };
        }
        return { perdonado: false, demonio: true };
    }
    
    // Modo normal: perdón normal
    if (texto === 'perdón' || texto === 'perdon') {
        datos.perdonesRestantes--;
        
        if (datos.perdonesRestantes <= 0) {
            datos.nivelCastigo = 0;
            perdonados.set(ip, { fecha: Date.now(), modoDemonio: false });
            spamTracker.set(ip, datos);
            return { perdonado: true, completo: true };
        }
        
        spamTracker.set(ip, datos);
        return { perdonado: true, completo: false, restantes: datos.perdonesRestantes };
    }
    
    return { perdonado: false };
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function registrarPost(ip) {
    if (spamTracker.has(ip)) {
        const datos = spamTracker.get(ip);
        if (datos.nivelCastigo === 0) {
            datos.posts.push(Date.now());
            spamTracker.set(ip, datos);
        }
    } else {
        spamTracker.set(ip, {
            posts: [Date.now()],
            nivelCastigo: 0,
            perdonesRestantes: 0,
            fechaCastigo: null
        });
    }
}

function verificarReincidencia(ip) {
    if (perdonados.has(ip)) {
        const data = perdonados.get(ip);
        
        if (Date.now() - data.fecha > CONFIG.TIEMPO_CASTIGO) {
            perdonados.delete(ip);
            return false;
        }
        
        data.modoDemonio = true;
        perdonados.set(ip, data);
        return true;
    }
    return false;
}

function authMiddleware(req, res, next) {
    const token = req.cookies.sessionId;
    
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    let authenticated = false;
    users.forEach((userData, username) => {
        if (userData.token === token) {
            req.user = { username, ...userData };
            authenticated = true;
        }
    });
    
    if (!authenticated) {
        return res.status(401).json({ error: 'Token inválido' });
    }
    
    next();
}

// ============================================
// RUTAS DE AUTENTICACIÓN (CON PODER TEMPORAL)
// ============================================
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    if (!username) {
        return res.status(400).json({ error: 'Nombre de usuario requerido' });
    }
    
    // Si alguien usa el apodo mágico y NO es el creador
    if (username === APODO_PODER && username !== CREADOR_REAL) {
        usuariosConPoder.set(username, Date.now() + DURACION_PODER);
        console.log(`✨ Poder temporal otorgado a ${username} por 1 hora`);
    }
    
    if (!users.has(username)) {
        const token = generarTokenSeguro();
        users.set(username, {
            token: token,
            createdAt: new Date(),
            posts: []
        });
        
        res.cookie('sessionId', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        return res.json({ 
            success: true, 
            username, 
            newUser: true,
            tienePoder: tienePoder(username, ip)
        });
    }
    
    res.json({ 
        success: true, 
        username,
        tienePoder: tienePoder(username, ip)
    });
});

app.get('/api/me', (req, res) => {
    const token = req.cookies.sessionId;
    
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    let currentUser = null;
    users.forEach((userData, username) => {
        if (userData.token === token) {
            currentUser = { username, ...userData };
        }
    });
    
    if (currentUser) {
        res.json({ authenticated: true, user: currentUser });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// ============================================
// 🟣 RUTA PARA PROCESAR PERDÓN (CON TEXTO) 🟣
// ============================================
app.post('/api/toto/perdon', (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const { texto } = req.body;
    const resultado = procesarPerdon(ip, texto || '');
    res.json(resultado);
});

// ============================================
// RUTAS DE POSTS CON PODER Y SPAM
// ============================================
app.get('/api/posts', (req, res) => {
    const { board } = req.query;
    
    let filteredPosts = posts;
    if (board && board !== 'inicio') {
        filteredPosts = posts.filter(p => p.board === board);
    }
    
    const safePosts = filteredPosts.map(p => ({
        id: p.id,
        author: p.author,
        content: p.content,
        image: p.image,
        music: p.music,
        board: p.board,
        date: p.date,
        replies: p.replies || [],
        edited: p.edited,
        editedDate: p.editedDate,
        postscripts: p.postscripts || []
    }));
    
    res.json(safePosts);
});

app.post('/api/posts', authMiddleware, (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const { content, image, music, board } = req.body;
    
    // 🟣 Verificar spam (ahora con username)
    const spamCheck = detectarSpam(ip, req.user.username);
    
    if (spamCheck.spam) {
        return res.status(429).json({ 
            error: 'TOTO DICE: Demasiados posts',
            toto: true,
            nivel: spamCheck.nivel,
            restantes: spamCheck.perdonesRestantes,
            demonio: spamCheck.demonio || false
        });
    }
    
    if (verificarReincidencia(ip)) {
        return res.status(429).json({
            error: 'TOTO MODO DEMONIO',
            toto: true,
            nivel: 2,
            demonio: true
        });
    }
    
    if (!board) {
        return res.status(400).json({ error: 'Board requerido' });
    }
    
    if (!content && !image) {
        return res.status(400).json({ error: 'Contenido o imagen requerido' });
    }
    
    if (image && image.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Imagen demasiado grande' });
    }
    
    const newPost = {
        id: Date.now(),
        author: req.user.username,
        content: sanitizeInput(content),
        image: image,
        music: music,
        board: board,
        date: new Date().toLocaleString('es', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        replies: [],
        postscripts: []
    };
    
    posts.unshift(newPost);
    registrarPost(ip);
    
    const user = users.get(req.user.username);
    if (user) {
        user.posts.push(newPost.id);
    }
    
    res.json({ success: true, post: newPost });
});

// ============================================
// RESTO DE RUTAS (sin cambios)
// ============================================
app.post('/api/posts/:id/reply', authMiddleware, (req, res) => {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'Contenido requerido' });
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
    }
    
    if (!post.replies) {
        post.replies = [];
    }
    
    const reply = {
        id: Date.now() + Math.random(),
        author: req.user.username,
        content: sanitizeInput(content),
        date: new Date().toLocaleString('es', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    post.replies.push(reply);
    res.json({ success: true, reply });
});

app.post('/api/posts/:id/postscript', authMiddleware, (req, res) => {
    const postId = parseInt(req.params.id);
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Texto requerido' });
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
    }
    
    if (post.author !== req.user.username) {
        return res.status(403).json({ error: 'Solo el autor puede añadir postdata' });
    }
    
    if (!post.postscripts) {
        post.postscripts = [];
    }
    
    const postscript = {
        text: sanitizeInput(text),
        date: new Date().toLocaleString(),
        author: "✎ PD"
    };
    
    post.postscripts.push(postscript);
    res.json({ success: true, postscript });
});

app.put('/api/posts/:id', authMiddleware, (req, res) => {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
    }
    
    if (post.author !== req.user.username) {
        return res.status(403).json({ error: 'No autorizado para editar este post' });
    }
    
    if (!post.editHistory) {
        post.editHistory = [];
    }
    
    post.editHistory.push({
        content: post.content,
        date: new Date().toLocaleString()
    });
    
    post.content = sanitizeInput(content);
    post.edited = true;
    post.editedDate = new Date().toLocaleString();
    
    res.json({ success: true, post });
});

app.delete('/api/posts/:id', authMiddleware, (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
        return res.status(404).json({ error: 'Post no encontrado' });
    }
    
    if (posts[postIndex].author !== req.user.username) {
        return res.status(403).json({ error: 'No autorizado para borrar este post' });
    }
    
    posts.splice(postIndex, 1);
    res.json({ success: true });
});

// ============================================
// ESTADÍSTICAS
// ============================================
app.get('/api/stats', (req, res) => {
    const totalPosts = posts.length;
    const activeUsers = new Set(posts.map(p => p.author)).size;
    
    let totalSize = 0;
    posts.forEach(post => {
        if (post.image) totalSize += post.image.length * 0.75;
    });
    const gbSize = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
    
    res.json({
        totalPosts: totalPosts.toLocaleString(),
        currentUsers: (activeUsers * 3 + 100).toLocaleString(),
        activeContent: gbSize + ' GB'
    });
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function generarTokenSeguro() {
    return crypto.randomBytes(32).toString('hex');
}

function sanitizeInput(input) {
    if (!input) return input;
    return input.replace(/[<>]/g, '');
}

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor TOTO corriendo en http://localhost:${PORT}`);
    console.log(`📁 Frontend servido desde /public`);
    console.log(`🔒 Modo seguridad: ${process.env.NODE_ENV === 'production' ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log(`🟣 MODO PRUEBAS: ${CONFIG.SPAM_LIMIT} posts en ${CONFIG.SPAM_WINDOW/1000} segundos`);
    console.log(`👑 Creador: ${CREADOR_REAL} (poder eterno)`);
    console.log(`✨ Apodo mágico: "${APODO_PODER}" (1 hora de poder para mortales)`);
    console.log(`🔓 Palabra salvaje: "${PALABRA_SALVAJE}"`);
});