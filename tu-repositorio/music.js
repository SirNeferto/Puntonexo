const MusicModule = {
    /**
     * Función principal para obtener el reproductor según la URL
     */
    getEmbedHTML(url) {
        if (!url || typeof url !== 'string') return '';
        
        const cleanUrl = url.trim();
        if (cleanUrl === '') return '';

        console.log('Procesando URL:', cleanUrl); // Para debug

        // SPOTIFY - Múltiples formatos
        if (cleanUrl.includes('spotify.com') || cleanUrl.includes('spotify.link')) {
            return this.generateSpotifyEmbed(cleanUrl);
        }

        // YOUTUBE - Todos los formatos posibles
        if (this.isYouTubeUrl(cleanUrl)) {
            return this.generateYouTubeEmbed(cleanUrl);
        }

        // SOUNDCLOUD (opcional)
        if (cleanUrl.includes('soundcloud.com')) {
            return this.generateSoundCloudEmbed(cleanUrl);
        }

        // Si no es ninguno, devolver un enlace simple
        return `<div class="music-link-fallback">
                    <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">🔗 Enlace de audio externo</a>
                </div>`;
    },

    /**
     * Detectar si es una URL de YouTube (todos los formatos)
     */
    isYouTubeUrl(url) {
        const patterns = [
            'youtube.com/watch',
            'youtu.be/',
            'youtube.com/shorts/',
            'youtube.com/embed/',
            'm.youtube.com',
            'youtube.com/v/',
            'youtube.com/playlist?list='
        ];
        return patterns.some(pattern => url.includes(pattern));
    },

    /**
     * Generador para Spotify - VERSIÓN CORREGIDA Y MEJORADA
     */
    generateSpotifyEmbed(url) {
        try {
            // Intentar diferentes patrones de URL de Spotify
            
            // Patrón 1: open.spotify.com/track/ID (con o sin parámetros)
            let match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9?&=]+)/);
            
            // Patrón 2: spotify.link (links acortados)
            if (!match && url.includes('spotify.link')) {
                console.log('URL acortada de Spotify detectada');
                return `<div class="music-link-fallback">
                            <a href="${url}" target="_blank" rel="noopener noreferrer">🎵 Abrir en Spotify</a>
                        </div>`;
            }
            
            // Patrón 3: Formato de embed directo
            if (!match && url.includes('embed/')) {
                match = url.match(/embed\/(track|album|playlist|episode)\/([a-zA-Z0-9?&=]+)/);
            }
            
            // Si encontramos un match, procesamos el ID
            if (match) {
                const type = match[1];      // track, album, playlist, episode
                const idConParametros = match[2];
                
                // Limpiar el ID de cualquier parámetro extra (ej: ?si=abc, &si=abc)
                const cleanId = idConParametros.split('?')[0].split('&')[0];
                
                // Validar que el ID tenga longitud razonable (los IDs de Spotify tienen ~22 caracteres)
                if (cleanId && cleanId.length >= 10 && cleanId.length <= 40) {
                    return `<iframe class="music-player" 
                            src="https://open.spotify.com/embed/${type}/${cleanId}?utm_source=generator&theme=0" 
                            width="100%" height="80" frameBorder="0" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                            title="Reproductor de Spotify"></iframe>`;
                }
            }
            
            // Si no se pudo extraer, mostrar un enlace
            return `<div class="music-link-fallback">
                        <a href="${url}" target="_blank" rel="noopener noreferrer">🎵 Escuchar en Spotify</a>
                    </div>`;
            
        } catch (e) { 
            console.error("Error en Spotify Embed:", e); 
            return `<div class="music-link-fallback">
                        <a href="${url}" target="_blank">🔗 Enlace de Spotify</a>
                    </div>`;
        }
    },

    /**
     * Generador para YouTube - VERSIÓN MEJORADA con todos los formatos
     */
    generateYouTubeEmbed(url) {
        try {
            let videoId = '';
            
            // Lista de patrones para YouTube
            const patterns = [
                { regex: /youtube\.com\/watch\?v=([^&]+)/, group: 1 },
                { regex: /youtu\.be\/([^?]+)/, group: 1 },
                { regex: /youtube\.com\/shorts\/([^?]+)/, group: 1 },
                { regex: /youtube\.com\/embed\/([^?]+)/, group: 1 },
                { regex: /youtube\.com\/v\/([^?]+)/, group: 1 },
                { regex: /youtube\.com\/watch\?.*&v=([^&]+)/, group: 1 },
                { regex: /m\.youtube\.com\/watch\?v=([^&]+)/, group: 1 }
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern.regex);
                if (match && match[pattern.group]) {
                    videoId = match[pattern.group];
                    break;
                }
            }
            
            // Soporte para listas de reproducción
            if (url.includes('list=')) {
                const playlistMatch = url.match(/list=([^&]+)/);
                if (playlistMatch && !videoId) {
                    return `<div class="music-link-fallback">
                                <a href="${url}" target="_blank">📋 Playlist de YouTube</a>
                            </div>`;
                }
            }
            
            if (videoId) {
                // Limpiar el ID (quitar parámetros extra)
                videoId = videoId.split('&')[0].split('?')[0];
                
                return `<iframe class="music-player" 
                        width="100%" height="200" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        loading="lazy"
                        title="Reproductor de YouTube"></iframe>`;
            }
            
            return `<div class="music-link-fallback">
                        <a href="${url}" target="_blank">▶️ Ver en YouTube</a>
                    </div>`;
            
        } catch (e) { 
            console.error("Error en YouTube Embed:", e); 
            return `<div class="music-link-fallback">
                        <a href="${url}" target="_blank">🔗 Enlace de YouTube</a>
                    </div>`;
        }
    },

    /**
     * Generador para SoundCloud (opcional)
     */
    generateSoundCloudEmbed(url) {
        return `<div class="music-link-fallback">
                    <a href="${url}" target="_blank">🎧 Escuchar en SoundCloud</a>
                </div>`;
    }
};

// Para debug
console.log('🎵 MusicModule cargado correctamente');