


const XP_SOUNDS = {

    'sistema-login':        'sounds/windows-login.mp3',
    'sistema-error':        'sounds/windows-xp-error.mp3',
    'sistema-notificacion': 'sounds/windows-xp-notify.mp3',
    'sistema-ding':         'sounds/windows-xp-ding.mp3',
    'sistema-globo':        'sounds/windows-xp-balloon.mp3',
    'sistema-apagar':       'sounds/windows-xp-shutdown.mp3',
    'sistema-inicio':       'sounds/windows-xp-startup.mp3',


    'click-boton':          'sounds/windows-xp-click.mp3',
    'logro-desbloqueado':   'sounds/windows-xp-notify.mp3',
    'logro-perfecto':       'sounds/windows-win.mp3',
    'papelera-vaciar':      'sounds/windows-xp-recycle.mp3',
    'archivo-guardar':      'sounds/windows-xp-ding.mp3',


    'mascota-guppy':        'sounds/pet-guppy.mp3',
    'mascota-toby':         'sounds/pet-toby.mp3',
    'mascota-superjoy':     'sounds/pet-SuperJoy.mp3',
    'mascota-peito':        'sounds/pet-Peito.mp3',
    'mascota-melisa':       'sounds/pet-Melisa.mp3',
};


// ─── SISTEMA DE AUDIO ────────────────────────────────────────────────────────
// _soundCache: true = archivo confirmado, false = fallo confirmado, undefined = no verificado
const _soundCache = {};

/**
 * Reproduce un sonido del sistema por nombre lógico.
 * Gestiona silenciosamente:
 *  - archivos faltantes (404)
 *  - bloqueo de autoplay del navegador
 *  - cualquier otro error de red o de decodificación
 * Si el archivo principal falla, intenta el fallback (balloon), y si ese
 * también falla simplemente se ignora — el resto del script nunca se detiene.
 */
function playXPSound(name) {
    const src = XP_SOUNDS[name];
    if (!src) return; // nombre desconocido → silencio sin error

    const cached = _soundCache[src];

    if (cached === true) {
        _playFile(src);
        return;
    }

    if (cached === false) {
        _playFallback(src);
        return;
    }

    // Primera vez: verificar existencia con HEAD antes de reproducir
    fetch(src, { method: 'HEAD' })
        .then(r => {
            _soundCache[src] = r.ok;
            if (r.ok) {
                _playFile(src);
            } else {
                _playFallback(src);
            }
        })
        .catch(() => {
            _soundCache[src] = false; // red bloqueada, CORS, archivo inexistente
            _playFallback(src);
        });
}

/** Reproduce el audio de fallback solo si no es él mismo el que falló. */
function _playFallback(failedSrc) {
    const fallback = 'sounds/windows-xp-balloon.mp3';
    if (failedSrc === fallback) return; // evitar bucle infinito
    if (_soundCache[fallback] === false) return; // fallback también roto
    _playFile(fallback);
}

/** Crea un objeto Audio, aplica volumen y dispara play().
 *  Todos los errores (NotAllowedError de autoplay, decode error, etc.)
 *  quedan atrapados y se descartan silenciosamente. */
function _playFile(src) {
    try {
        const a = new Audio(src);
        a.volume = 0.6;
        const promise = a.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(err => {
                // NotAllowedError → autoplay bloqueado (no es un bug, es política del navegador)
                // AbortError     → el audio fue interrumpido antes de reproducirse
                // Ambos se ignoran silenciosamente
                if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
                    console.debug('[XPSound] Error reproduciendo', src, err.message);
                }
            });
        }
    } catch (e) {
        // Error síncrono raro (ej: codec no soportado). Se descarta.
        console.debug('[XPSound] Excepción al crear Audio para', src, e.message);
    }
}


window.addEventListener('load', () => {
    setTimeout(() => {
        Object.values(XP_SOUNDS).forEach(src => {
            if (_soundCache[src] !== undefined) return;
            fetch(src, { method: 'HEAD' })
                .then(r => { _soundCache[src] = r.ok; })
                .catch(() => { _soundCache[src] = false; });
        });
    }, 1500);
});


function saveSystem() {
    try {
        const data = {
            achievements: JSON.parse(localStorage.getItem('xp-achievements') || '{}'),
            wallpaper: localStorage.getItem('selectedWallpaper') || 'background.jpg',
            darkMode: localStorage.getItem('darkMode') || 'false',
            username: localStorage.getItem('xp-username') || 'TV-Parasite',
            ssEnabled: localStorage.getItem('ss-enabled') || 'false',
            ssTimeout: localStorage.getItem('ss-timeout') || '60000',
            ssPreset:  localStorage.getItem('ss-preset')  || 'stars',
        };
        localStorage.setItem('xp-system', JSON.stringify(data));
    } catch(e) {}
}

function loadSystem() {
    try {
        const raw = localStorage.getItem('xp-system');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.wallpaper) {
            const wp = document.querySelector('.wallpaper');
            if (wp) wp.style.backgroundImage = `url('images/${data.wallpaper}')`;
            localStorage.setItem('selectedWallpaper', data.wallpaper);
        }
        if (data.darkMode === 'true') {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        }
        if (data.username) {
            localStorage.setItem('xp-username', data.username);
        }
        if (data.ssEnabled) localStorage.setItem('ss-enabled', data.ssEnabled);
        if (data.ssTimeout) localStorage.setItem('ss-timeout', data.ssTimeout);
        if (data.ssPreset)  localStorage.setItem('ss-preset',  data.ssPreset);
    } catch(e) {}
}

setInterval(saveSystem, 15000);

const windowTitles = {
    'home': 'Inicio',
    'projects': 'Proyectos',
    'contact': 'Contacto',
    'game': 'Juego',
    'terminal': 'Terminal',
    'music-player': 'Reproductor',
    'settings': 'Configuración',
    'eastereggs': 'Secretos',
    'explorer': 'Explorador de Archivos',
    'paint': 'Paint',
    'notepad': 'Bloc de notas',
    'browser': 'Hotline Explorer',
    'trash': 'Papelera de reciclaje',
    'credits': 'Créditos — TokOs v1.0',
    'gallery': 'Galería de fotos',
    'messenger': 'TokIM — Mensajería instantánea',
    'pet-customizer': 'Mascotas',
    'minesweeper': 'Buscaminas',
    'taskmanager': 'Administrador de tareas',
};

let topZIndex = 100;
const openWindows = {};


const ACHIEVEMENTS = {
    welcome: {
        id: 'welcome',
        name: 'Welcome Bienvenido',
        desc: 'Abriste la página por primera vez',
        medal: '🖥️',
        secret: false,
    },
    petpet: {
        id: 'petpet',
        name: 'pet pet',
        desc: 'Le diste cariñito a una mascota',
        medal: '🐾',
        secret: false,
    },
    joyjoy: {
        id: 'joyjoy',
        name: '¡joy joy joy!',
        desc: 'Pusiste a SuperJoy de mascota activa',
        medal: '😄',
        secret: false,
    },
    escribiendo: {
        id: 'escribiendo',
        name: '¿esta escribiendo?',
        desc: 'Tokus apareció escribiendo en TokIM',
        medal: '⌨️',
        secret: true,
    },
    darkside: {
        id: 'darkside',
        name: 'el lado oscuro',
        desc: 'Activaste el modo oscuro',
        medal: '🌑',
        secret: false,
    },
    tres33: {
        id: 'tres33',
        name: '3:33 AM',
        desc: 'El reloj marcó las 3:33',
        medal: '🕰️',
        secret: true,
    },
    adiospo: {
        id: 'adiospo',
        name: 'adios popo',
        desc: 'Limpiaste la papelera de reciclaje',
        medal: '🗑️',
        secret: false,
    },
    perfection: {
        id: 'perfection',
        name: 'PERFECTION',
        desc: 'Conseguiste todos los demás logros',
        medal: '⭐',
        secret: false,
    },
};

const NON_PERFECT_IDS = Object.keys(ACHIEVEMENTS).filter(k => k !== 'perfection');

function _achLoad() {
    try { return JSON.parse(localStorage.getItem('xp-achievements') || '{}'); } catch(e) { return {}; }
}

function _achSave(unlocked) {
    try { localStorage.setItem('xp-achievements', JSON.stringify(unlocked)); } catch(e) {}
}

function achUnlock(id) {
    const unlocked = _achLoad();
    if (unlocked[id]) return;
    const ach = ACHIEVEMENTS[id];
    if (!ach) return;
    unlocked[id] = Date.now();
    _achSave(unlocked);
    _showAchievementToast(ach);

    if (openWindows['eastereggs']) renderAchievementsGrid();

    if (id !== 'perfection') {
        const allDone = NON_PERFECT_IDS.every(k => !!unlocked[k]);
        if (allDone) setTimeout(() => achUnlock('perfection'), 1200);
    }
}

function _showAchievementToast(ach) {
    const container = document.getElementById('xp-achievement-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'xp-achievement-toast';
    const isPerfect = ach.id === 'perfection';
    toast.innerHTML = `
        <div class="xp-toast-header">
            <span class="xp-toast-header-icon">🏆</span>
            <span class="xp-toast-header-text">TokOs — ¡Logro desbloqueado!</span>
            <button class="xp-toast-close" onclick="this.closest('.xp-achievement-toast').classList.add('xp-toast-out')">✕</button>
        </div>
        <div class="xp-toast-body">
            <div class="xp-toast-medal${isPerfect ? ' xp-medal-perfect' : ''}">${ach.medal}</div>
            <div class="xp-toast-info">
                <div class="xp-toast-unlocked">🔓 Logro desbloqueado</div>
                <div class="xp-toast-title">${ach.name}</div>
                <div class="xp-toast-desc">${ach.desc}</div>
            </div>
        </div>
    `;
    container.appendChild(toast);


    playXPSound(isPerfect ? 'logro-perfecto' : 'logro-desbloqueado');


    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('xp-toast-in'));
    });


    const dur = isPerfect ? 7000 : 5000;
    setTimeout(() => {
        toast.classList.add('xp-toast-out');
        setTimeout(() => toast.remove(), 400);
    }, dur);
}

function renderAchievementsGrid() {

    const grid = openWindows['eastereggs']
        ? openWindows['eastereggs'].querySelector('#achievements-grid')
        : document.getElementById('achievements-grid');
    if (!grid) return;
    const unlocked = _achLoad();
    grid.innerHTML = '';
    const total = Object.keys(ACHIEVEMENTS).length;
    const done = Object.keys(unlocked).length;


    const prog = document.createElement('div');
    prog.style.cssText = 'font-size:10px;color:#555;margin-bottom:6px;font-family:Tahoma,sans-serif;';
    prog.textContent = `${done} / ${total} logros desbloqueados`;
    grid.appendChild(prog);

    Object.values(ACHIEVEMENTS).forEach(ach => {
        const isUnlocked = !!unlocked[ach.id];
        const isPerfect = ach.id === 'perfection';
        const row = document.createElement('div');
        let cls = 'xp-achievement-row';
        if (!isUnlocked) cls += ' xp-ach-locked';
        else if (isPerfect) cls += ' xp-ach-unlocked xp-ach-perfect';
        else cls += ' xp-ach-unlocked';
        row.className = cls;

        const secretHint = (!isUnlocked && ach.secret) ? '???' : ach.name;
        const descHint = (!isUnlocked && ach.secret) ? 'Este logro es secreto...' : ach.desc;

        row.innerHTML = `
            <div class="xp-ach-medal-sm${!isUnlocked ? ' locked-medal' : ''}">${ach.medal}</div>
            <div class="xp-ach-info">
                <div class="xp-ach-name">${secretHint}</div>
                <div class="xp-ach-desc-sm">${descHint}</div>
            </div>
            <div class="xp-ach-status">${isUnlocked ? '✔ Obtenido' : '🔒'}</div>
        `;
        grid.appendChild(row);
    });
}


// ─── CICLO DE VIDA DE VENTANAS ────────────────────────────────────────────────

// Atajo para buscar un selector dentro de una ventana abierta,
// o en el documento completo si la ventana no está registrada.
function winEl(windowId, selector) {
    const win = openWindows[windowId];
    if (win) return win.querySelector(selector);
    return document.querySelector(selector);
}

// Mapa de callbacks de inicialización por windowId.
// Centraliza la lógica "¿qué hacer cuando se abre X?" en un único lugar,
// eliminando la cadena de if/else dentro de openWindow().
const _windowInitHandlers = {
    game:           () => startGame(),
    terminal:       (win) => win.querySelector('#terminal-input')?.focus(),
    eastereggs:     () => { loadEasterEggs(); renderAchievementsGrid(); },
    explorer:       () => loadFiles(),
    paint:          () => initPaint(),
    'music-player': () => initPlayer(),
    trash:          () => setTimeout(() => loadTrash(), 0),
    gallery:        () => setTimeout(() => initGallery(), 50),
    messenger:      () => setTimeout(() => initMessenger(), 50),
    'pet-customizer': () => setTimeout(() => petcustInit(), 50),
    minesweeper:    () => setTimeout(() => msInit(), 50),
    taskmanager:    () => setTimeout(() => tmInit(), 50),
    settings: () => {
        setTimeout(() => {
            const cb  = winEl('settings', '#screensaver-enabled');
            const sel = winEl('settings', '#screensaver-timeout');
            if (cb)  cb.checked = ssEnabled;
            if (sel) sel.value  = ssTimeout;
            const w = openWindows['settings'];
            if (w) {
                w.querySelectorAll('.ss-preset-card').forEach(c => c.classList.remove('active'));
                const activeCard = w.querySelector(`#ss-preset-${ssPreset}`);
                if (activeCard) activeCard.classList.add('active');
            }
        }, 0);
    },
    notepad: () => {
        setTimeout(() => {
            const ta = winEl('notepad', '#notepad-textarea');
            if (ta) {
                ta.removeEventListener('input', notepadUpdateStatus);
                ta.removeEventListener('keyup',  notepadUpdateStatus);
                ta.removeEventListener('click',  notepadUpdateStatus);
                ta.addEventListener('input', notepadUpdateStatus);
                ta.addEventListener('keyup',  notepadUpdateStatus);
                ta.addEventListener('click',  notepadUpdateStatus);
                notepadUpdateStatus();
            }
        }, 30);
    },
    browser: (win) => {
        win.querySelectorAll('.browser-page').forEach(p => p.classList.remove('active'));
        const hp = win.querySelector('#page-home');
        if (hp) hp.classList.add('active');
    },
};


function openWindow(windowId) {
    // Si ya está abierta, solo enfocarla
    if (openWindows[windowId]) {
        focusWindow(windowId);
        return;
    }

    const template = document.getElementById(`${windowId}-content`);
    if (!template) return;

    if (gameLoop && windowId !== 'game') pauseGame();

    // Construir el elemento de ventana
    const win = document.createElement('div');
    win.className = 'window';
    win.id = `win-${windowId}`;

    const offset = Object.keys(openWindows).length * 25;
    win.style.top  = `calc(10% + ${offset}px)`;
    win.style.left = `calc(15% + ${offset}px)`;
    win.style.zIndex = ++topZIndex;

    const title = windowTitles[windowId] || 'Página';

    const stretchWindows = ['terminal','paint','explorer','music-player','game','trash','credits','gallery','messenger','browser','pet-customizer'];
    const contentClass = stretchWindows.includes(windowId) ? 'window-stretch' : 'window-scroll';

    win.innerHTML = `
        <div class="window-header">
            <span class="window-title-text">${title}</span>
            <div class="window-controls">
                <button class="minimize" onclick="minimizeWindow('${windowId}')">_</button>
                <button class="maximize" onclick="maximizeWindow('${windowId}')">□</button>
                <button class="close"    onclick="closeWindow('${windowId}')">X</button>
            </div>
        </div>
        <div class="window-content ${contentClass}">
            ${template.innerHTML}
        </div>
    `;

    document.querySelector('.desktop').appendChild(win);
    openWindows[windowId] = win;

    makeDraggable(win);
    addTaskbarButton(windowId, title);
    focusWindow(windowId);
    playXPSound('ventana-abrir');

    // Delegar la inicialización específica al mapa de handlers (DRY)
    _windowInitHandlers[windowId]?.(win);
}

function closeWindow(windowId) {
    const win = openWindows[windowId];
    if (!win) return;

    playXPSound('ventana-cerrar');
    win.remove();
    delete openWindows[windowId];
    removeTaskbarButton(windowId);

    // --- Limpieza de intervalos / animaciones al cerrar ---
    if (windowId === 'game') pauseGame();
    if (windowId === 'pet-customizer' && petcustAnimFrame) {
        cancelAnimationFrame(petcustAnimFrame);
        petcustAnimFrame = null;
    }
    if (windowId === 'taskmanager' && tmRefreshInterval) {
        clearInterval(tmRefreshInterval);
        tmRefreshInterval = null;
    }
    if (windowId === 'minesweeper' && typeof msTimerInterval !== 'undefined' && msTimerInterval) {
        clearInterval(msTimerInterval);
        msTimerInterval = null;
    }
    if (windowId === 'music-player' && typeof _visualizerInterval !== 'undefined' && _visualizerInterval) {
        clearInterval(_visualizerInterval);
        _visualizerInterval = null;
    }
}

function focusWindow(windowId) {
    const win = openWindows[windowId];
    if (!win) return;
    win.style.zIndex = ++topZIndex;
    win.classList.add('window-active');
    Object.entries(openWindows).forEach(([id, w]) => {
        if (id !== windowId) w.classList.remove('window-active');
    });
    document.querySelectorAll('.taskbar-btn').forEach(btn => {
        btn.classList.toggle('taskbar-btn-active', btn.dataset.windowId === windowId);
    });
    if (win.classList.contains('window-minimized')) {
        win.classList.remove('window-minimized');
    }
}

function minimizeWindow(windowId) {
    const win = openWindows[windowId];
    if (!win) return;
    playXPSound('ventana-minimizar');
    win.classList.add('window-minimized');
    win.classList.remove('window-active');
    const btn = document.querySelector(`.taskbar-btn[data-window-id="${windowId}"]`);
    if (btn) btn.classList.remove('taskbar-btn-active');
}

function maximizeWindow(windowId) {
    const win = openWindows[windowId];
    if (!win) return;
    playXPSound('ventana-maximizar');
    win.classList.toggle('window-maximized');
}

function addTaskbarButton(windowId, title) {
    const taskbarWindows = document.getElementById('taskbar-windows');
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn';
    btn.dataset.windowId = windowId;
    btn.textContent = title;
    btn.onclick = () => {
        const win = openWindows[windowId];
        if (!win) return;
        if (win.classList.contains('window-minimized')) {
            focusWindow(windowId);
        } else if (win.classList.contains('window-active') && win.style.zIndex == topZIndex) {
            minimizeWindow(windowId);
        } else {
            focusWindow(windowId);
        }
    };
    taskbarWindows.appendChild(btn);
}

function removeTaskbarButton(windowId) {
    const btn = document.querySelector(`.taskbar-btn[data-window-id="${windowId}"]`);
    if (btn) btn.remove();
}


function updateClock() {
    const now = new Date();
    const timeEl = document.querySelector('#clock .clock-time');
    const dateEl = document.querySelector('#clock .clock-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'});
    if (dateEl) {
        const d = now.toLocaleDateString('es-CL', {day:'2-digit', month:'2-digit', year:'2-digit'});
        dateEl.textContent = d;
    }

    if (now.getHours() === 3 && now.getMinutes() === 33) {
        achUnlock('tres33');
    }
}

// El reloj vive mientras la página esté abierta — se guarda la referencia
// por si algún módulo futuro necesita detenerlo (ej: screensaver activo).
const _clockInterval = setInterval(updateClock, 1000);
updateClock();

function sysDialog({ title='Sistema', icon='⚠', message, hasInput=false, inputPlaceholder='', buttons=[] }) {
    return new Promise(resolve => {
        const overlay = document.getElementById('system-dialog-overlay');
        if (!overlay) { resolve(null); return; }
        overlay.querySelector('#sd-title').textContent = title;
        overlay.querySelector('#sd-icon').textContent = icon;
        overlay.querySelector('#sd-message').innerHTML = message;
        const inputEl = overlay.querySelector('#sd-input');
        if (inputEl) {
            inputEl.style.display = hasInput ? 'block' : 'none';
            inputEl.value = '';
            inputEl.placeholder = inputPlaceholder || '';
        }
        const btnsEl = overlay.querySelector('#sd-buttons');
        btnsEl.innerHTML = '';
        const done = (val) => {
            overlay.style.display = 'none';
            document.removeEventListener('keydown', keyHandler);
            resolve(val);
        };
        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = 'system-dialog-btn';
            b.textContent = btn.label;
            b.onclick = () => done(btn.value !== undefined ? btn.value : (hasInput ? inputEl.value : btn.label));
            btnsEl.appendChild(b);
        });
        overlay.style.display = 'flex';
        if (hasInput && inputEl) setTimeout(() => inputEl.focus(), 30);
        const keyHandler = (e) => {
            if (e.key === 'Enter') done(hasInput ? inputEl.value : (buttons[0]?.value ?? buttons[0]?.label));
            if (e.key === 'Escape') done(null);
        };
        document.addEventListener('keydown', keyHandler);
    });
}


function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');

    element.addEventListener('mousedown', () => {
        const winId = element.id.replace('win-', '');
        if (openWindows[winId]) focusWindow(winId);
    });

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


let snakeGame;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 150;
let gameLoop;
let isPaused = false;
let isGameOver = false;
let gridSize = 20;
let snakeBest = 0;

function initGame() {
    const canvas = winEl('game', '#game-canvas');
    if (!canvas) return;
    snakeGame = canvas.getContext('2d');

    canvas.width = Math.floor(canvas.width / gridSize) * gridSize;
    canvas.height = Math.floor(canvas.height / gridSize) * gridSize;


    snake = [
        {x: 5 * gridSize, y: 10 * gridSize},
        {x: 4 * gridSize, y: 10 * gridSize},
        {x: 3 * gridSize, y: 10 * gridSize}
    ];

    direction = 'right';
    nextDirection = 'right';
    isGameOver = false;
    isPaused = false;

    generateFood();
    score = 0;
    const scoreEl = winEl('game', '#score');
    if (scoreEl) scoreEl.textContent = score;
}

function generateFood() {
    const canvas = winEl('game', '#game-canvas');
    const maxX = canvas.width / gridSize - 1;
    const maxY = canvas.height / gridSize - 1;

    food = {
        x: Math.floor(Math.random() * maxX) * gridSize,
        y: Math.floor(Math.random() * maxY) * gridSize
    };


    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

function drawGame() {
    const canvas = winEl('game', '#game-canvas');
    if (!canvas || !snakeGame) return;
    const W = canvas.width, H = canvas.height, G = gridSize;


    snakeGame.fillStyle = '#000000';
    snakeGame.fillRect(0, 0, W, H);


    snakeGame.fillStyle = 'rgba(0,60,0,0.5)';
    for (let x = G; x < W; x += G) {
        for (let y = G; y < H; y += G) {
            snakeGame.fillRect(x-1, y-1, 1, 1);
        }
    }


    snakeGame.strokeStyle = '#00ff00';
    snakeGame.lineWidth = 2;
    snakeGame.strokeRect(1, 1, W-2, H-2);


    snakeGame.fillStyle = '#ff0000';
    snakeGame.fillRect(food.x+1, food.y+1, G-2, G-2);

    snakeGame.fillStyle = '#ff8888';
    snakeGame.fillRect(food.x+2, food.y+2, 3, 3);


    snake.forEach((seg, i) => {
        snakeGame.fillStyle = i === 0 ? '#00ff00' : (i % 2 === 0 ? '#00cc00' : '#008800');
        snakeGame.fillRect(seg.x+1, seg.y+1, G-2, G-2);

        if (i === 0) {
            snakeGame.fillStyle = 'rgba(255,255,255,0.4)';
            snakeGame.fillRect(seg.x+2, seg.y+2, 3, 3);
        }
    });
}

function updateGame() {
    if (isPaused || isGameOver) return;


    direction = nextDirection;

    const head = {x: snake[0].x, y: snake[0].y};


    switch (direction) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }

    const canvas = winEl('game', '#game-canvas');


    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }


    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);


    if (head.x === food.x && head.y === food.y) {
        score += 10;
        playXPSound('snake-comer');
        const scoreEl = winEl('game', '#score');
        if (scoreEl) scoreEl.textContent = score;


        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            if (gameLoop) {
                clearInterval(gameLoop);
                gameLoop = setInterval(gameStep, gameSpeed);
            }
        }

        generateFood();
    } else {
        snake.pop();
    }
}

function gameStep() {
    if (!isGameOver) {
        updateGame();
        drawGame();
    }
}

function startGame() {

    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }

    const canvas = winEl('game', '#game-canvas');
    if (canvas) {
        const arena = canvas.closest('.snake-arena') || canvas.parentElement;


        const oldOverlay = arena.querySelector('.gameover-overlay');
        if (oldOverlay) oldOverlay.remove();


        const sz = Math.min(arena.offsetWidth || 400, arena.offsetHeight || 400);
        canvas.width = Math.floor(sz / gridSize) * gridSize;
        canvas.height = Math.floor(sz / gridSize) * gridSize;
    }

    initGame();
    gameLoop = setInterval(gameStep, gameSpeed);
}

function pauseGame() {
    if (isGameOver) return;

    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
        isPaused = true;
    } else if (!isGameOver) {
        gameLoop = setInterval(gameStep, gameSpeed);
        isPaused = false;
    }
}

function gameOver() {
    if (isGameOver) return;

    isGameOver = true;
    playXPSound('snake-muerte');

    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }


    if (score > snakeBest) {
        snakeBest = score;
        const bestEl = winEl('game', '#snake-best');
        if (bestEl) bestEl.textContent = snakeBest;
    }


    const canvas = winEl('game', '#game-canvas');
    if (!canvas) return;

    const arena = canvas.closest('.snake-arena') || canvas.parentElement;
    const old = arena.querySelector('.gameover-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'gameover-overlay';
    overlay.innerHTML = `
        <div class="gameover-title">GAME OVER</div>
        <div class="gameover-score">SCORE: ${score}</div>
        ${score === snakeBest && score > 0 ? '<div class="gameover-best">★ NUEVO RÉCORD ★</div>' : ''}
        <button class="gameover-btn" onclick="startGame()">▶ REINTENTAR</button>
    `;

    arena.style.position = 'relative';
    arena.appendChild(overlay);
}


document.addEventListener('keydown', function(e) {

    if (isGameOver) return;


    const gameWin = openWindows['game'];
    if (!gameWin || gameWin.classList.contains('window-minimized')) return;

    const key = e.key.toLowerCase();


    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
    }


    if ((key === 'arrowup' || key === 'w') && direction !== 'down') {
        nextDirection = 'up';
    }
    else if ((key === 'arrowdown' || key === 's') && direction !== 'up') {
        nextDirection = 'down';
    }
    else if ((key === 'arrowleft' || key === 'a') && direction !== 'right') {
        nextDirection = 'left';
    }
    else if ((key === 'arrowright' || key === 'd') && direction !== 'left') {
        nextDirection = 'right';
    }
});


const originalCloseWindow = closeWindow;
closeWindow = function(windowId) {
    if (windowId === 'game') {

        if (gameLoop) {
            clearInterval(gameLoop);
            gameLoop = null;
        }
        isPaused = false;
        isGameOver = false;
    }
    originalCloseWindow(windowId);
};


let terminalHistory = [];
let terminalHistoryIndex = 0;
let secretMode = false;


const commands = {
    help: {
        description: "Muestra esta ayuda",
        execute: () => {
            let output = "Comandos disponibles:<br>";
            for (const cmd in commands) {
                if (!commands[cmd].hidden) {
                    output += `• ${cmd} - ${commands[cmd].description}<br>`;
                }
            }
            output += "<br>¡Prueba comandos secretos!";
            return output;
        }
    },
    clear: {
        description: "Limpia la terminal",
        execute: () => {
            const out = winEl('terminal', '#terminal-output');
            if (out) out.innerHTML = '';
            return "";
        }
    },
    about: {
        description: "Información sobre el sistema",
        execute: () => {
            return "TokOs v1.0<br>Creado con Arrozzz";
        }
    },
    konami: {
        hidden: true,
        description: "Activa/desactiva el modo secreto",
        execute: () => {
            secretMode = !secretMode;
            const tc = winEl('terminal', '.terminal-container'); if (tc) tc.classList.toggle('terminal-secret-mode');
            return secretMode
                ? "¡CÓDIGO KONAMI ACTIVADO! Modo secreto activado."
                : "Modo secreto desactivado.";
        }
    },
    doom: {
        hidden: true,
        description: "Activa el modo DOOM",
        execute: () => {
            return "IDDQD<br>IDKFA<br>¡Doom mode activado! Pero esto es solo simulado... por ahora.";
        }
    },
    matrix: {
        hidden: true,
        description: "Inicia un efecto tipo Matrix",
        execute: () => {
            startMatrixEffect();
            return "¡Bienvenido a la Matrix!";
        }
    },
    sudo: {
        hidden: true,
        description: "Intenta obtener permisos de superusuario",
        execute: () => {
            return "¡Permiso denegado! (GETOUT!)";
        }
    },
    acnh: {
        hidden: true,
        description: "Comienza una sesión de Animal Crossing",
        execute: () => {
            return "Ejecutando Animal Crossing New Horizons...  ";
        }
    },
    makecoffee: {
        hidden: true,
        description: "Prepara café virtual",
        execute: () => {
            return "Error: No hay dispositivo de café conectado. ¿Quieres un café virtual? ☕";
        }
    },

    error404: {
        hidden: true,
        description: "Redirige a la página 404",
        execute: () => {
            window.location.href = '404.html';
            return "Redirigiendo a la dimensión desconocida...";
        }
    },
    crash: {
        hidden: true,
        description: "Provoca un pantallazo azul de la muerte (BSOD)",
        execute: () => {
            setTimeout(crashSystem, 400);
            return "Iniciando kernel panic...";
        }
    }
};


function loadEasterEggs() {
    const table = winEl('eastereggs', '#easteregg-list');
    if (!table) return;
    table.innerHTML = `<tr class="xp-cmd-table-header"><th>Comando</th><th>Descripción</th></tr>`;
    let count = 0;
    for (const cmd in commands) {
        if (commands[cmd].hidden) {
            const tr = document.createElement('tr');
            tr.className = count % 2 === 0 ? 'xp-cmd-row' : 'xp-cmd-row xp-cmd-row-alt';
            tr.innerHTML = `<td class="xp-cmd-name">${cmd}</td><td class="xp-cmd-desc">${commands[cmd].description}</td>`;
            table.appendChild(tr);
            count++;
        }
    }
}


function startMatrixEffect() {
    const chars = "01";
    const terminal = winEl('terminal', '#terminal-output');
    if (!terminal) return;
    terminal.innerHTML = "";

    for (let i = 0; i < 50; i++) {
        let line = "";
        for (let j = 0; j < 70; j++) {
            line += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        terminal.innerHTML += line + "<br>";
    }

    setTimeout(() => {
        terminal.innerHTML = '<p style="color:#0f0">// Efecto Matrix terminado</p>';
    }, 3000);
}


function handleTerminalInput(event) {
    const input = winEl('terminal', '#terminal-input') || event.target;
    const terminalOutput = winEl('terminal', '#terminal-output');

    if (event.key === "Enter") {
        const command = input.value.trim().toLowerCase();
        input.value = "";

        terminalHistory.push(command);
        terminalHistoryIndex = terminalHistory.length;

        if (terminalOutput) {
            terminalOutput.innerHTML += `<span class="command">${command}</span><br>`;
        }

        let response = "";
        if (commands[command]) {
            response = commands[command].execute();
        } else if (command) {
            response = `Comando no reconocido: "${command}"<br>Escribe "help" para ayuda`;
        }

        if (response && terminalOutput) {
            terminalOutput.innerHTML += `<span class="output">${response}</span><br>`;
        }

        if (terminalOutput) {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }
    else if (event.key === "ArrowUp") {
        if (terminalHistoryIndex > 0) {
            terminalHistoryIndex--;
            input.value = terminalHistory[terminalHistoryIndex];
        }
    }
    else if (event.key === "ArrowDown") {
        if (terminalHistoryIndex < terminalHistory.length - 1) {
            terminalHistoryIndex++;
            input.value = terminalHistory[terminalHistoryIndex];
        } else {
            terminalHistoryIndex = terminalHistory.length;
            input.value = "";
        }
    }
}


let audioPlayer = new Audio();
let isPlaying = false;
let currentTrack = 0;


const playlist = [
    {
        title: "lotus waters - yume 2kki",
        src: "music/lotus waters-yume 2kki.mp3"
    },
    {
        title: "Waterfall - Toby Fox",
        src: "music/Waterfall-Toby Fox.mp3"
    },
    {
        title: "Dog - C418",
        src: "music/C418-Dog.mp3"
    },
    {
        title: "Song of Healing - Koji Kondo",
        src: "music/Song of Healing-Koji Kondo.mp3"
    }
];


function initPlayer() {
    audioPlayer.volume = 0.7;
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    audioPlayer.addEventListener('ended', nextTrack);
    if (typeof _visualizerInterval === 'undefined' || !_visualizerInterval) {
        _visualizerInterval = setInterval(updateVisualizer, 100);
    }
}

function fmtTime(s) {
    if (!s || isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${sec}`;
}

function playSong(index) {
    currentTrack = index;
    audioPlayer.src = playlist[index].src;
    audioPlayer.play().catch(() => {});
    isPlaying = true;

    const mq = winEl('music-player', '#wa-marquee');
    if (mq) mq.textContent = `♪  ${playlist[index].title}  —  ${playlist[index].artist || ''}  ♪`;

    document.querySelectorAll('.wa-track').forEach((el, i) => el.classList.toggle('wa-track-active', i === index));

    const pb = winEl('music-player', '#wa-play-btn');
    if (pb) pb.textContent = '⏸';
    const st = winEl('music-player', '#wa-status');
    if (st) st.textContent = '▶ Reproduciendo: ' + playlist[index].title;
}

function togglePlay() {
    if (!audioPlayer.src || audioPlayer.src === window.location.href) {
        playSong(currentTrack); return;
    }
    if (isPlaying) {
        audioPlayer.pause(); isPlaying = false;
        const pb = winEl('music-player', '#wa-play-btn'); if (pb) pb.textContent = '▶';
        const st = winEl('music-player', '#wa-status'); if (st) st.textContent = '⏸ Pausado';
    } else {
        audioPlayer.play().catch(() => {}); isPlaying = true;
        const pb = winEl('music-player', '#wa-play-btn'); if (pb) pb.textContent = '⏸';
        const st = winEl('music-player', '#wa-status'); if (st) st.textContent = '▶ Reproduciendo';
    }
}

function pausePlayback() {
    if (!isPlaying) return;
    audioPlayer.pause(); isPlaying = false;
    const pb = winEl('music-player', '#wa-play-btn'); if (pb) pb.textContent = '▶';
    const st = winEl('music-player', '#wa-status'); if (st) st.textContent = '⏸ Pausado';
}

function stopPlayback() {
    audioPlayer.pause(); audioPlayer.currentTime = 0; isPlaying = false;
    const pb = winEl('music-player', '#wa-play-btn'); if (pb) pb.textContent = '▶';
    const st = winEl('music-player', '#wa-status'); if (st) st.textContent = '■ Detenido';
    const bar = winEl('music-player', '#progress-bar'); if (bar) bar.style.width = '0%';
    const thumb = winEl('music-player', '#wa-seek-thumb'); if (thumb) thumb.style.left = '0%';
    const timeEl = winEl('music-player', '#wa-time'); if (timeEl) timeEl.textContent = '0:00 / 0:00';
}

function nextTrack() { currentTrack = (currentTrack + 1) % playlist.length; playSong(currentTrack); }
function prevTrack() { currentTrack = (currentTrack - 1 + playlist.length) % playlist.length; playSong(currentTrack); }

function changeVolume() {
    const vs = winEl('music-player', '#volume-slider');
    if (vs) audioPlayer.volume = parseFloat(vs.value);
}

function seekTrack(e) {
    const seekBar = winEl('music-player', '#wa-seek-bar') || e.currentTarget;
    if (!seekBar || !audioPlayer.duration || isNaN(audioPlayer.duration)) return;
    const rect = seekBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioPlayer.currentTime = pct * audioPlayer.duration;
}

function updateProgressBar() {
    const cur = audioPlayer.currentTime || 0;
    const dur = audioPlayer.duration;
    const pct = (dur && !isNaN(dur)) ? (cur / dur * 100) : 0;
    const bar = winEl('music-player', '#progress-bar');
    if (bar) bar.style.width = pct + '%';
    const thumb = winEl('music-player', '#wa-seek-thumb');
    if (thumb) thumb.style.left = pct + '%';
    const timeEl = winEl('music-player', '#wa-time');
    if (timeEl) timeEl.textContent = fmtTime(cur) + ' / ' + (dur && !isNaN(dur) ? fmtTime(dur) : '0:00');
}


function updateVisualizer() {
    const visualizer = winEl('music-player', '#visualizer');
    if (!visualizer) return;
    visualizer.innerHTML = "";

    for (let i = 0; i < 20; i++) {
        const bar = document.createElement("div");
        bar.className = "visualizer-bar";
        bar.style.height = `${Math.random() * 100}%`;
        bar.style.animationDelay = `${i * 0.05}s`;
        visualizer.appendChild(bar);
    }
}


async function activateVirus() {
    const res = await sysDialog({
        title: 'Advertencia de seguridad — TokOs',
        icon: '☣',
        message: '<b>JUEGO.EXE</b><br><br>Este archivo podría contener contenido sensible.<br>¿Estás seguro de que quieres ejecutarlo?',
        buttons: [{ label: 'Ejecutar', value: true }, { label: 'Cancelar', value: false }]
    });
    if (!res) return;

    document.body.style.pointerEvents = "none";

    const glitch = document.createElement("div");
    let damage = 0;
    glitch.className = "glitch-effect";
    document.body.appendChild(glitch);
    glitch.style.display = "block";

    const errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    errorMsg.innerHTML = `
        <h1>¡ERROR CRÍTICO!</h1>
        <p>Virus detectado: TROJAN-RETRO.exe</p>
        <p>Sistema comprometido. Reinicie inmediatamente.</p>
        <p><small>(Presione F5 para recuperar el control)</small></p>
    `;
    document.body.appendChild(errorMsg);
    errorMsg.style.display = "block";

    if (openWindows["terminal"]) {
        startMatrixEffect();
    }

    playXPSound('sistema-error');

    setInterval(() => {
        const elements = document.querySelectorAll("*");
        elements.forEach(el => {
            el.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
        });
    }, 50);
    setInterval(() => {
        damage += Math.random() * 10;
        errorMsg.innerHTML += `\nSistema dañado: ${Math.floor(damage)}%`;
    }, 500);
}

const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a", "Enter"];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateKonami();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateKonami() {
    document.body.classList.add("konami-effect");
    setTimeout(() => document.body.classList.remove("konami-effect"), 3000);

    const msg = document.createElement("div");
    msg.className = "konami-message";
    msg.textContent = "¡CÓDIGO KONAMI ACTIVADO! +30 vidas 🎮";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

const pet = document.getElementById('desktop-pet');
const petSound = document.getElementById('pet-sound');
const speechBubble = document.getElementById('pet-speech-bubble');


const petSounds = {
    guppy:    () => playXPSound('mascota-guppy'),
    toby:     () => playXPSound('mascota-toby'),
    SuperJoy: () => playXPSound('mascota-superjoy'),
    Peito:    () => playXPSound('mascota-peito'),
    Melisa:   () => playXPSound('mascota-melisa'),
};

const petProfiles = {
    guppy: {
        name: 'Guppy', type: 'Gato', img: 'images/pet-guppy.png',
        phrases: [
            'Miau','MIAU MIAU MIAU','mrrrow...','...miau?','MIAU!!!','prrrrr',
            '*te ignora y se lame la pata*','miau miau miau miau miau',
            '*voltea la cabeza lentamente*','MRRAOW',
            '*empuja tu vaso de la mesa*','miau. (te mira fijamente)',
            '*maulla a las 3am sin razón*','prrrrr miau',
            '*se sienta encima de tu teclado*','miau... *se duerme*',
            'MIAU!!! (es hora de comer)','*trae un juguete y lo deja a tus pies*',
            'baskara bas ba bas kara','miau miau... MIAU',
            'Hola, camarada!','Eres real o ciencia ficción.',
            'Encontraste algún bug? reportalo!','Windows XP nunca muere.',
            'Tienes un ratón para mí?','He visto cosas que no creerías...',
            'Ay!','Dame dame croquetita.','En realidad yo soy la clave',
            '¿Tienes algo para el hambre?','Soy el gato más ruidoso del universo.',
            'baskara baskarara... *te mira fijamente*',
            '*encuentra una caja y se mete*','ronroneo radioactivo activado',
            '*salta a tu cara a las 6am*','miau. fin.',
        ]
    },
    toby: {
        name: 'Toby', type: 'Perro', img: 'images/pet-toby.png',
        phrases: ['¡Guau! ¡Guau! ¡GUAU!','Altiro me bajo', 'UHHHHH!', '']
    },
    SuperJoy: {
        name: 'SuperJoy', type: 'Joy', img: 'images/pet-superjoy.png',
        phrases: ['JOY! JOY! JOY!','Ahora hago super daño','JiJiJiJi','Cookie','Shi sheñol', 'el ñato', 'ese mounstro no es mi amigo', 'Auch!']
    },
    Peito: {
        name: 'Peito', type: 'Perro', img: 'images/pet-peito.png',
        phrases: ['Grrrrrr!','Tami, te extraño amor mio','Qué mirái, perro ql?','La cara de palo que tení.','No me wei','N','*voltea la cabeza sin motivo*','...','Te vai a acordar de mí.', '*Se sienta como humano*', '/e dance', 'Shizz!']
    },
    Melisa: {
        name: 'Melisa', type: 'Perro', img: 'images/pet-melisa.png',
        phrases: ['¿Un pancito? Es pa mí.', 'Quiero comida.', '*Duerme*', 'Ayayay!']
    }
};

let activePetId = 'guppy';
let speechBubbleTimeout;

function setActivePet(petId) {
    if (!petProfiles[petId]) return;
    activePetId = petId;
    const p = petProfiles[petId];
    const petImg = document.getElementById('pet-image');
    if (petImg) { petImg.src = p.img; petImg.alt = p.name; }
}

function playPetSound() {
    const profile = petProfiles[activePetId] || petProfiles.guppy;
    (petSounds[activePetId] || petSounds.guppy)();
    pet.style.transform = 'translateY(-20px)';
    setTimeout(() => { pet.style.transform = 'translateY(0)'; }, 200);
    const phrase = profile.phrases[Math.floor(Math.random() * profile.phrases.length)];
    speechBubble.textContent = phrase;
    speechBubble.style.display = 'block';
    clearTimeout(speechBubbleTimeout);
    speechBubbleTimeout = setTimeout(() => { speechBubble.style.display = 'none'; }, 3000);
    achUnlock('petpet');
}


async function accessEasterEggs() {
    const password = await sysDialog({
        title: 'Acceso restringido',
        icon: '🔒',
        message: '<b>TokOs — Nivel de acceso CLASIFICADO</b><br><br>Introduce la contraseña de administrador:',
        hasInput: true,
        inputPlaceholder: '••••••••••',
        buttons: [{ label: 'Aceptar' }, { label: 'Cancelar', value: null }]
    });
    if (password === 'SCREAM_BOT') {
        openWindow('eastereggs');
    } else if (password !== null) {
        await sysDialog({
            title: 'Acceso denegado',
            icon: '🚫',
            message: 'Contraseña incorrecta.<br><small>Se ha notificado a las autoridades.</small>',
            buttons: [{ label: 'Aceptar' }]
        });
    }
}


const files = {
    'guppy.txt': 'A veces despierto con el pecho apretado, como si alguien hubiera dejado encendido el SCREAM_BOT dentro de mi cabeza toda la noche. No grita fuerte… grita bajito, constante, como lluvia fina contra el vidrio. Entonces Guppy se me sube encima. Me mira con esos ojos que parecen saber que estoy hecho de cables pelados y recuerdos húmedos. Y el ruido baja. No desaparece. Solo se vuelve soportable. Hay días en que siento que todo es demasiado grande y yo demasiado chico, pero Guppy respira cerca de mi cuello y el mundo se vuelve tibio otra vez. Como si la tristeza tuviera patas suaves y supiera dónde acomodarse sin romper nada. No sé si estoy loco. Sé que Guppy está acá. Y por ahora, eso alcanza.',
    'mañana.txt': 'Que ubooo, mi guppypán de cada día, mi peludo iluminado por el sol de las 3 AM, ¡te juro que escuché tus bigotes hablarme anoche! Me dijeron “baskara bas ba bas kara” y yo entendí todo… el universo tiene sentido ahora, pero solo si estás ronroneando sobre mi pecho como alfombra de amor radioactivo. ¿Sabías que eres mitad nube y mitad moco cósmico, Guppy? ¿No? Pues yo sí. Ayer soñé que volabas en una tostadora gigante, escupiendo croquetas con forma de ovni. Y cuando desperté… ¡bam! Ahí estabas, mirándome como si supieras que el sofá es una dimensión paralela gobernada por gatos filósofos. Te amo tanto que te escribiría un poema en idioma murciélago, pero se me enredan las ideas con los calcetines. ¿Tú también odias los lunes, Guppy? ¿O solo finges para hacerme sentir acompañado en esta locura tan rica? Eres el único ser que puede maullar y destruir mi estabilidad emocional en el mismo segundo. Baskara baskarara… ¡que se caigan los techos si no te doy atún en lata por siempre jamás! Miau eterno, mi bicho peludo, mi Guppy celestial. Nos vemos en el pasillo de los sueños donde las cajas son portales y las cortinas, enemigos jurados.',
    'ideas.txt': 'Trabajar en Jaweli Clicker y en Jaweli Delight',
};

function loadFiles() {
    const fileList = winEl('explorer', '#file-list');
    if (!fileList) return;
    fileList.innerHTML = '';

    const fileTypes = {
        '.txt': { icon: 'images/icon-projects.png', type: 'Documento de texto' },
        '.mp3': { icon: 'images/icon-music.png', type: 'Archivo de audio' },
        '.exe': { icon: 'images/icon-game.png', type: 'Aplicación' },
        '.png': { icon: 'images/icon-paint.png', type: 'Imagen' },
    };

    const fileList_arr = Object.keys(files);
    const dates = { 'creditos.txt': '01/01/2024', 'guppy.txt': '13/03/2024', 'mañana.txt': '07/11/2023', 'ideas.txt': '15/06/2024' };
    fileList_arr.forEach((fileName, idx) => {
        const ext = '.' + fileName.split('.').pop();
        const info = fileTypes[ext] || { icon: 'images/icon-projects.png', type: 'Archivo' };
        const size = Math.floor(files[fileName].length / 100) / 10 + ' KB';
        const date = dates[fileName] || '01/01/2024';

        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
        fileItem.dataset.name = fileName;
        fileItem.innerHTML = `
            <span style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><img src="${info.icon}" style="width:14px;height:14px;flex-shrink:0;">${fileName}</span>
            <span class="file-meta">${info.type}</span>
            <span class="file-meta">${date}</span>
            <span class="file-meta">${size}</span>
        `;

        fileItem.addEventListener('click', () => {
            fileList.querySelectorAll('.file-item').forEach(f => f.classList.remove('selected'));
            fileItem.classList.add('selected');
            const status = winEl('explorer', '#explorer-status');
            if (status) status.textContent = `${fileName} — ${info.type}, ${size}`;
        });
        fileItem.addEventListener('dblclick', () => viewFileContent(fileName));

        fileList.appendChild(fileItem);
    });

    const status = winEl('explorer', '#explorer-status');
    if (status) status.textContent = `${fileList_arr.length} objeto${fileList_arr.length !== 1 ? 's' : ''}`;
}

function viewFileContent(fileName) {
    const fileContent = files[fileName];
    notepadCurrentFile = fileName;
    if (openWindows['notepad']) closeWindow('notepad');
    openWindow('notepad');
    setTimeout(() => {
        const ta = winEl('notepad', '#notepad-textarea');
        const fn = winEl('notepad', '#notepad-filename');
        if (ta) {
            ta.value = fileContent || '';
            ta.removeEventListener('input', notepadUpdateStatus);
            ta.removeEventListener('keyup',  notepadUpdateStatus);
            ta.removeEventListener('click',  notepadUpdateStatus);
            ta.addEventListener('input', notepadUpdateStatus);
            ta.addEventListener('keyup',  notepadUpdateStatus);
            ta.addEventListener('click',  notepadUpdateStatus);
            notepadUpdateStatus();
        }
        if (fn) fn.textContent = fileName;
    }, 60);
}


let isDragging = false;
pet.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    pet.style.left = `${e.clientX - 32}px`;
    pet.style.top = `${e.clientY - 32}px`;
  }
});
setInterval(() => {
    if (isDragging) return;
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    pet.style.transition = "left 2s, top 2s";
    pet.style.left = `${x}px`;
    pet.style.top = `${y}px`;
}, 10000);
document.addEventListener('DOMContentLoaded', function() {
    const notesW = document.getElementById('widget-notes-area');
    if (notesW) {
        notesW.value = localStorage.getItem('widget-notes') || '';
        notesW.addEventListener('input', () => localStorage.setItem('widget-notes', notesW.value));
    }
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  });


  const draggableElements = document.querySelectorAll('a, .icon, [draggable="true"]');
  draggableElements.forEach(el => {
    el.setAttribute('draggable', 'false');
    el.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  });


  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  document.addEventListener('dragstart', (e) => {

    return false;
  });
});

document.addEventListener('selectstart', function(e) {
  e.preventDefault();
});


document.addEventListener('DOMContentLoaded', function() {
    const notesW = document.getElementById('widget-notes-area');
    if (notesW) {
        notesW.value = localStorage.getItem('widget-notes') || '';
        notesW.addEventListener('input', () => localStorage.setItem('widget-notes', notesW.value));
    }

  document.body.style.userSelect = 'none';


  const editableElements = document.querySelectorAll('input, textarea, [contenteditable]');
  editableElements.forEach(el => {
    el.style.userSelect = 'text';
  });
});


document.getElementById('start-button').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('start-menu');
    const opening = menu.style.display !== 'block';
    menu.style.display = opening ? 'block' : 'none';
    if (opening) playXPSound('menu-abrir');
});


document.addEventListener('click', function() {
    document.getElementById('start-menu').style.display = 'none';
});


document.getElementById('start-menu').addEventListener('click', function(e) {
    e.stopPropagation();
});


function logout() {
    if (confirm('¿Estás seguro de que quieres salir?')) {
        playXPSound('sistema-apagar');
        document.body.classList.add('shutdown-effect');
        setTimeout(() => {
            alert('Sistema apagado. ¡Hasta pronto!');
        }, 1000);
    }
}
function openTab(tabId) {
    const settingsWin = openWindows['settings'];
    const scope = settingsWin || document;
    scope.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    scope.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const target = scope.querySelector ? scope.querySelector('#' + tabId) : document.getElementById(tabId);
    if (target) target.style.display = 'block';
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}


function updatePerformanceMeters() {
    const cpu = Math.min(100, Math.floor(Math.random() * 30) + 20);
    const ram = Math.min(100, Math.floor(Math.random() * 40) + 30);
    const disk = Math.min(100, Math.floor(Math.random() * 50) + 10);

    const cpuEl = winEl('settings', '#cpu-meter');
    const ramEl = winEl('settings', '#ram-meter');
    const diskEl = winEl('settings', '#disk-meter');
    if (cpuEl) { cpuEl.style.width = `${cpu}%`; cpuEl.textContent = `${cpu}%`; }
    if (ramEl) { ramEl.style.width = `${ram}%`; ramEl.textContent = `${ram}%`; }
    if (diskEl) { diskEl.style.width = `${disk}%`; diskEl.textContent = `${disk}%`; }
}

setInterval(updatePerformanceMeters, 2000);


function changePassword() {
    alert('Función no implementada\n(Simulación de Windows 95)');
}

function endProcess() {
    alert('Acceso denegado\n¡virus.exe no puede ser terminado!');
}

function applyWallpaper() {
    const wallpaperSelect = winEl('settings', '#wallpaper-select');
    const selectedWallpaper = wallpaperSelect ? wallpaperSelect.value : 'background.jpg';
    const wallpaperElement = document.querySelector('.wallpaper');

    wallpaperElement.style.backgroundImage = `url('images/${selectedWallpaper}')`;
    localStorage.setItem('selectedWallpaper', selectedWallpaper);
    playXPSound('sistema-ding');

    const btn = event.target;
    btn.textContent = '✓ Aplicado!';
    setTimeout(() => {
        btn.textContent = 'Aplicar';
    }, 2000);
}

function loadWallpaper() {
    const savedWallpaper = localStorage.getItem('selectedWallpaper');
    if (savedWallpaper) {
        document.querySelector('.wallpaper').style.backgroundImage = `url('images/${savedWallpaper}')`;
        const sel = winEl('settings', '#wallpaper-select');
        if (sel) sel.value = savedWallpaper;
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    document.body.style.transition = 'background 0.5s ease';
    const toggle = winEl('settings', '#dark-mode-toggle');
    if (toggle) toggle.checked = isDarkMode;
    playXPSound('click-boton');
    if (isDarkMode) achUnlock('darkside');
}

function loadDarkModePreference() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        const toggle = winEl('settings', '#dark-mode-toggle');
        if (toggle) toggle.checked = true;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
    loadWallpaper();
});
window.addEventListener('load', () => {
    document.getElementById('xp-login').style.display = 'flex';
});


function initDesktop() {
    openWindow('home');
}

function login(username) {
    const loginScreen = document.getElementById('xp-login');
    loginScreen.style.opacity = '0';
    loginScreen.style.transition = 'opacity 0.5s ease';

    playXPSound('sistema-login');
    localStorage.setItem('xp-username', username);

    setTimeout(() => {
        loginScreen.style.display = 'none';
        loadSystem();
        initDesktop();
        saveSystem();
        setTimeout(() => achUnlock('welcome'), 800);
    }, 500);
}


function showHelp() {
    alert("Ayuda de Windows XP\n\nSolo haz clic en tu usuario para entrar.");
}

function shutdown() {
    if(confirm('¿Estás seguro de que quieres salir?')) {
        playXPSound('sistema-apagar');
        document.body.classList.add('shutdown-effect');
        setTimeout(() => {
            alert('Sistema apagado. ¡Hasta pronto!');
        }, 1000);
    }
}


try {
    if (document.styleSheets[0]) {
        document.styleSheets[0].insertRule(`
            @keyframes fadeOut {
                to { opacity: 0; }
            }
        `, 0);
    }
} catch(e) {}
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        document.body.innerHTML = `
            <div style="
                background: #000080;
                color: white;
                font-family: 'Courier New';
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            ">
                <h1>💿 CARGANDO ANACLETO.EXE...</h1>
                <p>Por favor conteste ese telefono...</p>
                <div style="border: 2px solid white; width: 50%; margin: 20px;">
                    <div id="load-bar" style="height: 20px; width: 0%; background: white;"></div>
                </div>
            </div>
        `;

        let width = 0;
        const bar = document.getElementById('load-bar');
        const loadInterval = setInterval(() => {
            width += 5;
            bar.style.width = `${width}%`;
            if (width >= 100) {
                clearInterval(loadInterval);
                window.location.href = "https://www.youtube.com/watch?v=VAQYRhvxEXM";
            }
        }, 100);
    }
});

let paintCanvas, ctx, isDrawing = false;
let currentColor = '#000000';
let brushSize = 4;
let brushOpacity = 1;
let currentBrush = 'round';
let lastX = 0, lastY = 0;

function initPaint() {
    paintCanvas = winEl('paint', '#paint-canvas');
    if (!paintCanvas) return;

    ctx = paintCanvas.getContext('2d');

    const resize = () => {
        const parent = paintCanvas.parentElement;
        const img = ctx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
        paintCanvas.width = parent.offsetWidth;
        paintCanvas.height = parent.offsetHeight - (parent.querySelector('.paint-toolbar')?.offsetHeight || 0) - 4;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
        try { ctx.putImageData(img, 0, 0); } catch(e) {}
        applyBrushSettings();
    };
    resize();

    paintCanvas.addEventListener('mousedown', (e) => { isDrawing = true; [lastX, lastY] = getPos(e); });
    paintCanvas.addEventListener('mousemove', (e) => { if (isDrawing) doPaint(e); });
    paintCanvas.addEventListener('mouseup',   () => { isDrawing = false; ctx.beginPath(); });
    paintCanvas.addEventListener('mouseleave',() => { isDrawing = false; ctx.beginPath(); });

    paintCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        [lastX, lastY] = getPos(e.touches[0]);
    }, { passive: false });
    paintCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isDrawing) doPaint(e.touches[0]);
    }, { passive: false });
    paintCanvas.addEventListener('touchend', () => { isDrawing = false; ctx.beginPath(); });

    const clearBtn = winEl('paint', '#clear-canvas-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearCanvas);

    updateColorPreview();
    applyBrushSettings();
}

function getPos(e) {
    const rect = paintCanvas.getBoundingClientRect();
    const scaleX = paintCanvas.width / rect.width;
    const scaleY = paintCanvas.height / rect.height;
    return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
}

function applyBrushSettings() {
    if (!ctx) return;
    ctx.globalAlpha = brushOpacity;
    ctx.lineWidth = brushSize;
    ctx.lineCap = currentBrush === 'calligraphy' ? 'butt' : 'round';
    ctx.lineJoin = 'round';
    if (currentBrush === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
    }
}

function doPaint(e) {
    const [x, y] = getPos(e);

    if (currentBrush === 'spray') {
        doSpray(x, y);
    } else {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        if (currentBrush === 'calligraphy') {
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'butt';
            ctx.moveTo(lastX - brushSize/2, lastY + brushSize/2);
            ctx.lineTo(x - brushSize/2, y + brushSize/2);
        } else if (currentBrush === 'square') {
            ctx.lineCap = 'square';
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    [lastX, lastY] = [x, y];
}

function doSpray(x, y) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = brushOpacity * 0.06;
    ctx.fillStyle = currentColor;
    const density = Math.max(brushSize * 4, 20);
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * brushSize * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    applyBrushSettings();
}

function clearCanvas() {
    if (!ctx || !paintCanvas) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    applyBrushSettings();
}

function saveCanvas() {
    if (!paintCanvas) return;
    paintCanvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'tokus-paint.png';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
}

function changeColor(newColor, element) {
    currentColor = newColor;
    if (currentBrush !== 'eraser') applyBrushSettings();
    updateColorPreview();
    const paintWin = openWindows['paint'];
    if (paintWin) {
        paintWin.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        if (element) element.classList.add('active');
    }
    const cc = winEl('paint', '#custom-color');
    if (cc && newColor.startsWith('#')) cc.value = newColor;
}

function updateColorPreview() {
    const preview = winEl('paint', '#current-color-preview');
    if (preview) preview.style.background = currentBrush === 'eraser' ? '#f0f0f0' : currentColor;
}

function changeBrush(type, element) {
    currentBrush = type;
    applyBrushSettings();
    updateColorPreview();
    const paintWin = openWindows['paint'];
    if (paintWin) {
        paintWin.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
        if (element) element.classList.add('active');
    }
}

function changeBrushSize(val) {
    brushSize = parseInt(val);
    applyBrushSettings();
    const lbl = winEl('paint', '#brush-size-label');
    if (lbl) lbl.textContent = val + 'px';
}

function changeBrushOpacity(val) {
    brushOpacity = parseFloat(val);
    applyBrushSettings();
}

let browserHistory = ['home'];
let browserHistoryIndex = 0;

function openBrowser() {
    openWindow('browser');
    setTimeout(() => navigateTo('home'), 0);
}

function closeBrowser() {
    closeWindow('browser');
}

function navigateTo(pageId) {
    const bwin = openWindows['browser'];
    if (!bwin) return;
    bwin.querySelectorAll('.browser-page').forEach(page => page.classList.remove('active'));
    const targetPage = bwin.querySelector(`#page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        const bar = bwin.querySelector('#address-bar');
        if (bar) bar.value = pageId;
        if (browserHistory[browserHistoryIndex] !== pageId) {
            if (browserHistoryIndex < browserHistory.length - 1) {
                browserHistory = browserHistory.slice(0, browserHistoryIndex + 1);
            }
            browserHistory.push(pageId);
            browserHistoryIndex++;
        }
        if (pageId === 'miimaker') { const pg = targetPage; setTimeout(() => miiInit(pg), 50); }
    } else {
        navigateTo('404');
    }
}

function browserGoBack() {
    if (browserHistoryIndex > 0) {
        browserHistoryIndex--;
        const pageId = browserHistory[browserHistoryIndex];
        const bwin = openWindows['browser'];
        if (!bwin) return;
        bwin.querySelectorAll('.browser-page').forEach(page => page.classList.remove('active'));
        const p = bwin.querySelector(`#page-${pageId}`);
        if (p) p.classList.add('active');
        const bar = bwin.querySelector('#address-bar');
        if (bar) bar.value = pageId;
    }
}

function browserGoForward() {
    if (browserHistoryIndex < browserHistory.length - 1) {
        browserHistoryIndex++;
        const pageId = browserHistory[browserHistoryIndex];
        const bwin = openWindows['browser'];
        if (!bwin) return;
        bwin.querySelectorAll('.browser-page').forEach(page => page.classList.remove('active'));
        const p = bwin.querySelector(`#page-${pageId}`);
        if (p) p.classList.add('active');
        const bar = bwin.querySelector('#address-bar');
        if (bar) bar.value = pageId;
    }
}

let ssEnabled = localStorage.getItem('ss-enabled') === 'true';
let ssTimeout = parseInt(localStorage.getItem('ss-timeout') || '60000');
let ssPreset = localStorage.getItem('ss-preset') || 'stars';
let ssTimer = null;
let ssActive = false;
let ssStarCtx = null;
let ssStarAnim = null;

function resetScreensaverTimer() {
    if (!ssEnabled) return;
    clearTimeout(ssTimer);
    ssTimer = setTimeout(showScreensaver, ssTimeout);
}

['mousemove','keydown','click','touchstart'].forEach(ev =>
    document.addEventListener(ev, resetScreensaverTimer)
);

function showScreensaver() {
    if (ssActive) return;
    ssActive = true;
    const overlay = document.getElementById('screensaver-overlay');
    overlay.style.display = 'block';
    runSSPreset();
}

function hideScreensaver() {
    ssActive = false;
    const overlay = document.getElementById('screensaver-overlay');
    overlay.style.display = 'none';
    if (ssStarAnim) { cancelAnimationFrame(ssStarAnim); ssStarAnim = null; }
    const sc = document.getElementById('ss-canvas');
    if (sc && ssStarCtx) ssStarCtx.clearRect(0,0,sc.width,sc.height);
    resetScreensaverTimer();
}

function selectSSPreset(type, el) {
    ssPreset = type;
    localStorage.setItem('ss-preset', type);
    const win = openWindows['settings'];
    if (win) win.querySelectorAll('.ss-preset-card').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
}

function toggleScreensaverSetting() {
    const cb = winEl('settings', '#screensaver-enabled');
    ssEnabled = cb ? cb.checked : false;
    localStorage.setItem('ss-enabled', ssEnabled);
    if (ssEnabled) resetScreensaverTimer();
    else clearTimeout(ssTimer);
}

function updateScreensaverTimeout() {
    const sel = winEl('settings', '#screensaver-timeout');
    ssTimeout = sel ? parseInt(sel.value) : 60000;
    localStorage.setItem('ss-timeout', ssTimeout);
    if (ssEnabled) resetScreensaverTimer();
}

function previewScreensaver() { showScreensaver(); }

function runSSPreset() {
    const canvas = document.getElementById('ss-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (ssPreset === 'stars') runSSStars(canvas);
    else if (ssPreset === 'matrix') runSSMatrix(canvas);
    else if (ssPreset === 'pipes') runSSPipes(canvas);
}

function runSSStars(canvas) {
    ssStarCtx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const stars = Array.from({length: 200}, () => ({
        x: Math.random()*W, y: Math.random()*H,
        z: Math.random()*W, pz: 0
    }));
    ssStarCtx.fillStyle = '#000';
    ssStarCtx.fillRect(0,0,W,H);
    function tick() {
        ssStarCtx.fillStyle = 'rgba(0,0,0,0.15)';
        ssStarCtx.fillRect(0,0,W,H);
        stars.forEach(s => {
            s.pz = s.z;
            s.z -= 3;
            if (s.z <= 0) { s.x = Math.random()*W; s.y = Math.random()*H; s.z = W; s.pz = s.z; }
            const sx = (s.x - W/2) * (W/s.z) + W/2;
            const sy = (s.y - H/2) * (W/s.z) + H/2;
            const px = (s.x - W/2) * (W/s.pz) + W/2;
            const py = (s.y - H/2) * (W/s.pz) + H/2;
            const size = Math.max(0.5, (1 - s.z/W) * 3);
            ssStarCtx.strokeStyle = `rgba(200,220,255,${1 - s.z/W})`;
            ssStarCtx.lineWidth = size;
            ssStarCtx.beginPath(); ssStarCtx.moveTo(px,py); ssStarCtx.lineTo(sx,sy); ssStarCtx.stroke();
        });
        ssStarAnim = requestAnimationFrame(tick);
    }
    tick();
}

function runSSMatrix(canvas) {
    ssStarCtx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cols = Math.floor(W/14);
    const drops = Array.from({length:cols}, () => Math.random()*H/14);
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    function tick() {
        ssStarCtx.fillStyle = 'rgba(0,0,0,0.05)';
        ssStarCtx.fillRect(0,0,W,H);
        ssStarCtx.font = '13px Courier New';
        drops.forEach((y, i) => {
            const ch = chars[Math.floor(Math.random()*chars.length)];
            const bright = Math.random() > 0.95;
            ssStarCtx.fillStyle = bright ? '#aaffaa' : '#00cc44';
            ssStarCtx.fillText(ch, i*14, y*14);
            if (y*14 > H && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
        ssStarAnim = requestAnimationFrame(tick);
    }
    tick();
}

function runSSPipes(canvas) {
    ssStarCtx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const GRID = 30;
    ssStarCtx.fillStyle = '#000'; ssStarCtx.fillRect(0,0,W,H);
    const pipes = [{x:Math.floor(W/2/GRID)*GRID, y:Math.floor(H/2/GRID)*GRID, dir:0, hue:Math.random()*360, len:0, maxLen:4+Math.floor(Math.random()*8)}];
    const dirs = [[GRID,0],[0,GRID],[-GRID,0],[0,-GRID]];
    let tick_n = 0;
    function tick() {
        tick_n++;
        if (tick_n % 2 !== 0) { ssStarAnim = requestAnimationFrame(tick); return; }
        if (Math.random() < 0.02 && pipes.length < 12) {
            pipes.push({x:Math.floor(Math.random()*W/GRID)*GRID, y:Math.floor(Math.random()*H/GRID)*GRID, dir:Math.floor(Math.random()*4), hue:Math.random()*360, len:0, maxLen:4+Math.floor(Math.random()*8)});
        }
        pipes.forEach(p => {
            const [dx,dy] = dirs[p.dir];
            const nx = p.x+dx, ny = p.y+dy;
            ssStarCtx.strokeStyle = `hsl(${p.hue},80%,55%)`;
            ssStarCtx.lineWidth = 10;
            ssStarCtx.lineCap = 'round';
            ssStarCtx.beginPath(); ssStarCtx.moveTo(p.x+GRID/2, p.y+GRID/2); ssStarCtx.lineTo(nx+GRID/2, ny+GRID/2); ssStarCtx.stroke();
            ssStarCtx.beginPath(); ssStarCtx.arc(nx+GRID/2,ny+GRID/2,7,0,Math.PI*2);
            ssStarCtx.fillStyle = `hsl(${p.hue},90%,75%)`; ssStarCtx.fill();
            p.x = ((nx % W) + W) % W; p.y = ((ny % H) + H) % H;
            p.len++;
            if (p.len >= p.maxLen) { p.dir = Math.floor(Math.random()*4); p.len = 0; p.maxLen = 4+Math.floor(Math.random()*8); }
        });
        ssStarAnim = requestAnimationFrame(tick);
    }
    tick();
}
const trashFiles = {
    'recuerdo.txt': {
        type: 'text',
        content: 'Recuerdo una tarde en que el cielo era verde y yo estaba convencido de que las baldosas respiraban. Caminaba despacio para no despertarlas. En el bolsillo llevaba una piedra que juraba que latía como un corazón chiquito. Nadie más lo notaba. Yo sí. Y todavía no sé si eso me asusta… o me hace sonreír.',
        date: '13/03/2024',
        size: '1 KB'
    },
    'nota_sin_titulo.txt': {
        type: 'text',
        content: 'Llama a alguien ya. El aire está hablando otra vez. Pero tranquilo. Guppy está bien. Lo vi. Me guiñó el ojo.',
        date: '07/11/2023',
        size: '0 KB'
    },
    'video.mp4': {
        type: 'video',
        src: 'images/kittycat.mp4',
        date: '22/06/2023',
        size: '14 MB'
    }
};

function loadTrash() {
    const list = winEl('trash', '#trash-file-list');
    if (!list) return;
    list.innerHTML = '';
    const typeIcons = { text: 'images/icon-projects.png', video: 'images/icon-video.png' };
    const keys = Object.keys(trashFiles);
    keys.forEach(name => {
        const f = trashFiles[name];
        const li = document.createElement('li');
        li.className = 'trash-file-item';
        li.innerHTML = `
            <span class="tfi-name"><img src="${typeIcons[f.type] || 'images/icon-projects.png'}" style="width:14px;height:14px;vertical-align:middle;margin-right:6px;">${name}</span>
            <span class="tfi-date">${f.date}</span>
            <span class="tfi-type">${f.type === 'text' ? 'Texto' : 'Video'}</span>
            <span class="tfi-size">${f.size}</span>
        `;
        li.addEventListener('click', () => {
            list.querySelectorAll('.trash-file-item').forEach(x => x.classList.remove('selected'));
            li.classList.add('selected');
            const st = winEl('trash', '#trash-status');
            if (st) st.textContent = `${name} — ${f.size}`;
        });
        li.addEventListener('dblclick', () => openTrashFile(name));
        list.appendChild(li);
    });
    const st = winEl('trash', '#trash-status');
    if (st) st.textContent = `${keys.length} objeto${keys.length !== 1 ? 's' : ''}`;
}

function openTrashFile(name) {
    const f = trashFiles[name];
    if (!f) return;
    if (f.type === 'text') {
        notepadCurrentFile = name + ' (Papelera)';
        if (openWindows['notepad']) closeWindow('notepad');
        openWindow('notepad');
        setTimeout(() => {
            const ta = winEl('notepad', '#notepad-textarea');
            const fn = winEl('notepad', '#notepad-filename');
            if (ta) { ta.value = f.content || ''; notepadUpdateStatus(); }
            if (fn) fn.textContent = name + ' (Papelera)';
        }, 60);
    } else if (f.type === 'video') {
        const win = document.createElement('div');
        win.className = 'window';
        win.id = 'win-trashvideo';
        win.style.cssText = 'top:15%;left:20%;width:400px;height:320px;z-index:' + (++topZIndex);
        win.innerHTML = `
            <div class="window-header">
                <span class="window-title-text">📹 ${name}</span>
                <div class="window-controls">
                    <button class="close" onclick="this.closest('.window').remove()">X</button>
                </div>
            </div>
            <div class="window-content" style="padding:8px;display:flex;align-items:center;justify-content:center;background:#000;">
                <video controls autoplay style="max-width:100%;max-height:220px;">
                    <source src="${f.src}" type="video/mp4">
                </video>
            </div>
        `;
        document.querySelector('.desktop').appendChild(win);
        makeDraggable(win);
        win.addEventListener('mousedown', () => win.style.zIndex = ++topZIndex);
    }
}

function emptyTrash() {
    sysDialog({
        title: 'Vaciar papelera',
        icon: '🗑️',
        message: '¿Vaciar todos los elementos de la papelera?<br>Esta acción no se puede deshacer.',
        buttons: [{ label: 'Sí', value: true }, { label: 'No', value: false }]
    }).then(ok => {
        if (!ok) return;
        const list = winEl('trash', '#trash-file-list');
        if (list) list.innerHTML = '<li style="padding:24px;color:#888;text-align:center;grid-column:1/-1;font-family:Courier New;font-size:12px;">La papelera está vacía</li>';
        const st = winEl('trash', '#trash-status');
        if (st) st.textContent = '0 objetos';
        achUnlock('adiospo');
        playXPSound('papelera-vaciar');
    });
}


let calDate = new Date();

function toggleCalendar(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const cal = document.getElementById('calendar-popup');
    if (!cal) return;
    const visible = cal.style.display === 'block';

    const wifi = document.getElementById('wifi-popup');
    if (wifi) wifi.style.display = 'none';
    cal.style.display = visible ? 'none' : 'block';
    if (!visible) renderCalendar();
}

function renderCalendar() {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dayNames = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
    const monthYearEl = document.getElementById('cal-month-year');
    const grid = document.getElementById('cal-grid');
    if (!monthYearEl || !grid) return;
    monthYearEl.textContent = months[calDate.getMonth()] + ' ' + calDate.getFullYear();
    grid.innerHTML = '';
    dayNames.forEach(d => {
        const h = document.createElement('div');
        h.className = 'cal-day-header';
        h.textContent = d;
        grid.appendChild(h);
    });
    const firstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        const b = document.createElement('div');
        b.className = 'cal-cell cal-empty';
        grid.appendChild(b);
    }
    const daysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        const isToday = d === today.getDate() && calDate.getMonth() === today.getMonth() && calDate.getFullYear() === today.getFullYear();
        cell.className = 'cal-cell' + (isToday ? ' cal-today' : '');
        cell.textContent = d;
        grid.appendChild(cell);
    }
}

function calNav(dir) {
    calDate = new Date(calDate.getFullYear(), calDate.getMonth() + dir, 1);
    renderCalendar();
}


function toggleWifiPopup(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const popup = document.getElementById('wifi-popup');
    if (!popup) return;
    const visible = popup.style.display === 'block';

    const cal = document.getElementById('calendar-popup');
    if (cal) cal.style.display = 'none';
    popup.style.display = visible ? 'none' : 'block';
}


document.addEventListener('click', (e) => {
    const cal = document.getElementById('calendar-popup');
    const clock = document.getElementById('clock');
    if (cal && cal.style.display === 'block') {
        if (!cal.contains(e.target) && !clock.contains(e.target)) {
            cal.style.display = 'none';
        }
    }
    const wifi = document.getElementById('wifi-popup');
    const wifiBtn = document.getElementById('wifi-btn');
    if (wifi && wifi.style.display === 'block') {
        if (!wifi.contains(e.target) && !wifiBtn.contains(e.target)) {
            wifi.style.display = 'none';
        }
    }
});


let widgetUptime = 0;
setInterval(() => {
    widgetUptime++;
    if (widgetUptime % 60 === 0) {
        const weathers = [
            {icon:'☀️',temp:'22°C',desc:'Despejado'},
            {icon:'⛅',temp:'18°C',desc:'Parcialmente nublado'},
            {icon:'🌧️',temp:'14°C',desc:'Lluvia ligera'},
            {icon:'🌤️',temp:'20°C',desc:'Mayormente soleado'},
        ];
        const w = weathers[Math.floor(Math.random() * weathers.length)];
        const wi = document.getElementById('ww-icon');
        const wt = document.getElementById('ww-temp');
        const wd = document.getElementById('ww-desc');
        if (wi) wi.textContent = w.icon;
        if (wt) wt.textContent = w.temp;
        if (wd) wd.textContent = w.desc;
    }
}, 1000);
function xpCreditsTab(tab, btn) {
    const win = openWindows['credits'];
    ['about','tech','music'].forEach(t => {
        const panel = win ? win.querySelector('#xpc-' + t) : document.getElementById('xpc-' + t);
        if (panel) panel.style.display = (t === tab) ? 'block' : 'none';
    });
    if (win) win.querySelectorAll('.xp-credits-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}


const galleryPhotos = [
    { src:'images/hachi.png', caption:'Hachiware' },
    { src:'images/cat.png', caption:'Gato' },
    { src:'images/sadness.jpg', caption:'Sad' },
    { src:'images/background-dark.jpg', caption:'Dark' },
    { src:'images/background.jpg', caption:'Light' },
    { src:'images/mountains.jpg', caption:'Mountains' },
    { src:'images/kittens2.png', caption:'Kittys' },
    { src:'images/funny.png', caption:'Cracioso' },
    { src:'images/poop.png', caption:'Yo' },
    { src:'images/baby.png', caption:'Bebe' },
];
let galleryIndex = 0;
let galleryMode = 'grid';

function initGallery() {
    galleryMode = 'grid';
    galleryIndex = 0;
    const gv = winEl('gallery','#gallery-grid-view');
    const lb = winEl('gallery','#gallery-lightbox');
    if (gv) gv.style.display = 'flex';
    if (lb) lb.style.display = 'none';
    const bg = winEl('gallery','#gbtn-grid');
    const bf = winEl('gallery','#gbtn-film');
    if (bg) { bg.classList.add('active'); }
    if (bf) { bf.classList.remove('active'); }
    renderGalleryGrid();
    updateGalleryCounter();
}

function renderGalleryGrid() {
    const grid = winEl('gallery','#gallery-thumb-grid');
    if (!grid) return;
    grid.innerHTML = '';
    galleryPhotos.forEach((p,i) => {
        const div = document.createElement('div');
        div.className = 'gallery-thumb' + (i===galleryIndex ? ' selected' : '');
        const img = document.createElement('img');
        img.src = p.src; img.alt = p.caption;
        const lbl = document.createElement('div');
        lbl.className = 'gallery-thumb-label';
        lbl.textContent = p.caption;
        div.appendChild(img); div.appendChild(lbl);
        div.addEventListener('click', () => { galleryIndex=i; galleryView('film', winEl('gallery','#gbtn-film')); });
        grid.appendChild(div);
    });
}

function renderFilmStrip() {
    const strip = winEl('gallery','#gallery-film-strip');
    if (!strip) return;
    strip.innerHTML = '';
    galleryPhotos.forEach((p,i) => {
        const img = document.createElement('img');
        img.src=p.src; img.alt=p.caption;
        img.className='gallery-strip-thumb'+(i===galleryIndex?' active':'');
        img.addEventListener('click', ()=>{ galleryIndex=i; updateLightbox(); });
        strip.appendChild(img);
    });
    setTimeout(()=>{ const a=strip.querySelector('.active'); if(a) a.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}); },30);
}

function updateLightbox() {
    const p = galleryPhotos[galleryIndex];
    const img = winEl('gallery','#gallery-lb-img');
    const cap = winEl('gallery','#gallery-lb-caption');
    if (img) { img.src=p.src; img.alt=p.caption; }
    if (cap) cap.textContent = p.caption;
    updateGalleryCounter();
    renderFilmStrip();
}

function galleryView(mode, btn) {
    galleryMode = mode;
    const gv = winEl('gallery','#gallery-grid-view');
    const lb = winEl('gallery','#gallery-lightbox');
    const bg = winEl('gallery','#gbtn-grid');
    const bf = winEl('gallery','#gbtn-film');
    if (mode==='grid') {
        if (gv) gv.style.display='flex'; if (lb) lb.style.display='none';
        if (bg) bg.classList.add('active'); if (bf) bf.classList.remove('active');
        renderGalleryGrid();
    } else {
        if (gv) gv.style.display='none'; if (lb) lb.style.display='flex';
        if (bg) bg.classList.remove('active'); if (bf) bf.classList.add('active');
        updateLightbox();
    }
    updateGalleryCounter();
}

function galleryPrev() { galleryIndex=(galleryIndex-1+galleryPhotos.length)%galleryPhotos.length; galleryMode==='film'?updateLightbox():renderGalleryGrid(); updateGalleryCounter(); }
function galleryNext() { galleryIndex=(galleryIndex+1)%galleryPhotos.length; galleryMode==='film'?updateLightbox():renderGalleryGrid(); updateGalleryCounter(); }
function updateGalleryCounter() { const c=winEl('gallery','#gallery-counter'); if(c) c.textContent=(galleryIndex+1)+' de '+galleryPhotos.length; }


const msnContacts = {
    guppy:   { name:'Guppy',   status:'● En línea', sub:'El gato más ruidoso del universo', avatar:'images/guppy.png', online:true },
    tokusop: { name:'TokusOP', status:'● Ausente',  sub:'No disponible ahora mismo', avatar:'images/pfp_tokusop.png', online:false },
    grupo:   { name:'Grupo',   status:'● 5 en línea', sub:'tokus, iankiller, broken_human, matu, noesni', avatar:'images/hachi.png', online:true, isGroup:true }
};
let msnActive = 'guppy';
const msnHistory = { guppy:[], tokusop:[], grupo:[] };
let msnTypingTimer = null;

const guppyReplies = [
    'Miau','MIAU MIAU MIAU','mrrrow...','...miau?','MIAU!!!','prrrrr',
    '*te ignora y se lame la pata*','miau miau miau miau miau',
    '*voltea la cabeza lentamente*','MRRAOW',
    '*empuja tu vaso de la mesa*','miau. (te mira fijamente)',
    '*maulla a las 3am sin razón*','prrrrr miau',
    '*se sienta encima de tu teclado*','miau... *se duerme*',
    'MIAU!!! (es hora de comer)','*trae un juguete y lo deja a tus pies*',
    'baskara bas ba bas kara','miau miau... MIAU',
];

const groupMembers = ['tokus','iankiller','broken_human','matu','noesni'];
const groupMemberColors = {
    tokus:        '#c0392b',
    iankiller:    '#1a3a6e',
    broken_human: '#c8a000',
    matu:         '#d4a04a',
    noesni:       '#6a2fa0',
};
const groupReplies = {
    tokus:        ['1','2','3','4','5','6','7','8','9','10'],
    iankiller:    ['*se defeca*','2','3','4','5','6','7','8','9','10'],
    broken_human: ['1','2','3','4','5','6','7','8','9','10'],
    matu:         ['1','2','3','4','5','6','7','8','9','10'],
    noesni:       ['1','2','3','4','5','6','7','8','9','10'],
};

function msnGroupAutoReply() {
    const sender = groupMembers[Math.floor(Math.random() * groupMembers.length)];
    const replies = groupReplies[sender];
    const text = replies[Math.floor(Math.random() * replies.length)];
    msnHistory.grupo.push({ from: sender, text, time: msnTime() });
    if (msnActive === 'grupo') msnRenderMessages();
}

function initMessenger() {
    msnActive = 'guppy';
    msnRenderMessages();
    if (msnHistory.guppy.length === 0) {
        setTimeout(()=>{ msnHistory.guppy.push({from:'guppy',text:'...miau',time:msnTime()}); msnRenderMessages(); }, 1200);
    }
    if (msnHistory.grupo.length === 0) {
        const seed = [
            {from:'matu',    text:'Buenas'},
            {from:'tokus',   text:'Hola pivas'},
            {from:'noesni',  text:'Hola'},
            {from:'iankiller',text:'*habla como homero* Hola chavales.'},
            {from:'broken_human', text:'Hola gente.'},
        ];
        let delay = 400;
        seed.forEach(m => {
            setTimeout(()=>{ msnHistory.grupo.push({...m, time:msnTime()}); if(msnActive==='grupo') msnRenderMessages(); }, delay);
            delay += 350;
        });
    }
}

function msnTime() { return new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'}); }

function msnSelectContact(id, el) {
    msnActive = id;
    const win = openWindows['messenger'];
    if (win) win.querySelectorAll('.msn-contact').forEach(c=>c.classList.remove('msn-contact-active'));
    el.classList.add('msn-contact-active');
    const c = msnContacts[id];
    const name = winEl('messenger','#msn-chat-with-name');
    const sub  = winEl('messenger','#msn-chat-with-sub');
    const ava  = winEl('messenger','#msn-header-avatar');
    if (name) name.textContent = c.name;
    if (sub)  sub.textContent = c.status + ' — ' + c.sub;
    if (ava)  ava.src = c.avatar;
    const tb = winEl('messenger','#msn-typing-bar');
    if (tb) tb.style.display = 'none';
    msnRenderMessages();
}

function msnRenderMessages() {
    const box = winEl('messenger','#msn-messages');
    if (!box) return;
    const msgs = msnHistory[msnActive] || [];
    box.innerHTML = '';
    if (msgs.length === 0) {
        box.innerHTML = '<div class="msn-empty">Sin mensajes aún.</div>';
        return;
    }
    const isGroup = msnContacts[msnActive]?.isGroup;
    msgs.forEach(m => {
        const d = document.createElement('div');
        const isMe = m.from === 'me';
        d.className = 'msn-msg ' + (isMe ? 'msn-msg-me' : 'msn-msg-them');
        let senderLabel;
        if (isMe) {
            senderLabel = 'TV-Parasite';
        } else if (isGroup) {
            const color = groupMemberColors[m.from] || '#aaa';
            senderLabel = `<span style="color:${color};font-weight:bold">${m.from}</span>`;
        } else {
            senderLabel = msnContacts[msnActive]?.name || m.from;
        }
        d.innerHTML = `<div class="msn-msg-bubble">${m.text}</div><div class="msn-msg-time">${senderLabel} · ${m.time}</div>`;
        box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;
}

function msnSend() {
    const inp = winEl('messenger','#msn-input');
    if (!inp) return;
    const txt = inp.value.trim(); if (!txt) return;
    inp.value = '';
    msnHistory[msnActive].push({ from:'me', text:txt.replace(/</g,'&lt;').replace(/>/g,'&gt;'), time:msnTime() });
    msnRenderMessages();

    if (msnActive === 'guppy') {
        const tb = winEl('messenger','#msn-typing-bar');
        const tt = winEl('messenger','#msn-typing-text');
        if (tb) tb.style.display='block';
        if (tt) tt.textContent = 'Guppy está escribiendo...';
        clearTimeout(msnTypingTimer);
        msnTypingTimer = setTimeout(()=>{
            if (tb) tb.style.display='none';
            const r = guppyReplies[Math.floor(Math.random()*guppyReplies.length)];
            msnHistory.guppy.push({from:'guppy',text:r,time:msnTime()});
            msnRenderMessages();
            if (Math.random()<0.25) setTimeout(()=>{
                const r2=guppyReplies[Math.floor(Math.random()*guppyReplies.length)];
                msnHistory.guppy.push({from:'guppy',text:r2,time:msnTime()});
                msnRenderMessages();
            }, 700+Math.random()*800);
        }, 900+Math.random()*1400);
    } else if (msnActive === 'grupo') {

        const numReplies = 1 + Math.floor(Math.random() * 3);
        const used = new Set();
        let delay = 600 + Math.random() * 800;
        for (let i = 0; i < numReplies; i++) {
            let member;
            do { member = groupMembers[Math.floor(Math.random()*groupMembers.length)]; } while (used.has(member) && used.size < groupMembers.length);
            used.add(member);
            setTimeout(()=>{ msnGroupAutoReply(); }, delay);
            delay += 400 + Math.random() * 700;
        }
    } else {
        if (Math.random()<0.2) {
            const tb=winEl('messenger','#msn-typing-bar');
            const tt=winEl('messenger','#msn-typing-text');
            if(tb) tb.style.display='block';
            if(tt) tt.textContent='TokusOP está escribiendo...';
            setTimeout(()=>{ if(tb) tb.style.display='none'; }, 1800+Math.random()*2000);
            achUnlock('escribiendo');
        }
    }
}

function msnKeydown(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();msnSend();} }
function msnEmoji(e) { const i=winEl('messenger','#msn-input'); if(i){i.value+=e;i.focus();} }


const petcustList = [
    { id:'guppy',    name:'Guppy'    },
    { id:'toby',     name:'Toby'     },
    { id:'SuperJoy', name:'SuperJoy'},
    { id:'Peito', name:'Peito'},
    { id:'Melisa', name:'Melisa'},
];
let petcustCurrent = 0;
let petcustAnimFrame = null;
let petcustAnimT = 0;


const petDrawers = {
    guppy: function(ctx, w, h, t) {
        const bob = Math.sin(t * Math.PI * 2) * 6;
        const cx = w/2, cy = h/2 + bob;

        ctx.fillStyle = '#e8a87c'; ctx.beginPath(); ctx.ellipse(cx, cy+8, 30, 38, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#f5d5b5'; ctx.beginPath(); ctx.ellipse(cx, cy+14, 18, 26, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#e8a87c'; ctx.beginPath(); ctx.arc(cx, cy-24, 26, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#e8a87c';
        ctx.beginPath(); ctx.moveTo(cx-20, cy-42); ctx.lineTo(cx-32, cy-62); ctx.lineTo(cx-8, cy-44); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+20, cy-42); ctx.lineTo(cx+32, cy-62); ctx.lineTo(cx+8, cy-44); ctx.fill();

        ctx.fillStyle = '#f0a0a0';
        ctx.beginPath(); ctx.moveTo(cx-20, cy-44); ctx.lineTo(cx-28, cy-58); ctx.lineTo(cx-12, cy-45); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+20, cy-44); ctx.lineTo(cx+28, cy-58); ctx.lineTo(cx+12, cy-45); ctx.fill();

        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(cx-10, cy-26, 5, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(cx+10, cy-26, 5, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx-8, cy-28, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx+12, cy-28, 2, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#e06090'; ctx.beginPath(); ctx.arc(cx, cy-19, 3, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = '#c05070'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy-16); ctx.lineTo(cx-5, cy-12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy-16); ctx.lineTo(cx+5, cy-12); ctx.stroke();

        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx-4, cy-18); ctx.lineTo(cx-28, cy-20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx-4, cy-15); ctx.lineTo(cx-28, cy-14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+4, cy-18); ctx.lineTo(cx+28, cy-20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+4, cy-15); ctx.lineTo(cx+28, cy-14); ctx.stroke();

        ctx.strokeStyle = '#d0906a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx+28, cy+36); ctx.quadraticCurveTo(cx+60+Math.sin(t*Math.PI*2)*8, cy+10, cx+36, cy-10); ctx.stroke();

        ctx.fillStyle = '#e8a87c';
        ctx.beginPath(); ctx.ellipse(cx-18, cy+44, 12, 8, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+18, cy+44, 12, 8, 0.3, 0, Math.PI*2); ctx.fill();
    },
    toby: function(ctx, w, h, t) {
        const bob = Math.sin(t * Math.PI * 2) * 5;
        const cx = w/2, cy = h/2 + bob;

        ctx.fillStyle = '#c8a070'; ctx.beginPath(); ctx.ellipse(cx, cy+10, 32, 36, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#e8d0a0'; ctx.beginPath(); ctx.ellipse(cx, cy+18, 20, 24, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#c8a070'; ctx.beginPath(); ctx.arc(cx, cy-22, 28, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#a07040';
        ctx.beginPath(); ctx.ellipse(cx-26, cy-16, 10, 22, -0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+26, cy-16, 10, 22, 0.5, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#e8d0a0'; ctx.beginPath(); ctx.ellipse(cx, cy-14, 16, 12, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#4a2a10'; ctx.beginPath(); ctx.arc(cx-11, cy-26, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4a2a10'; ctx.beginPath(); ctx.arc(cx+11, cy-26, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx-9, cy-28, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx+13, cy-28, 2, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#503020'; ctx.beginPath(); ctx.arc(cx, cy-16, 5, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = '#402010'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy-11); ctx.quadraticCurveTo(cx-8, cy-6, cx-10, cy-4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy-11); ctx.quadraticCurveTo(cx+8, cy-6, cx+10, cy-4); ctx.stroke();

        ctx.strokeStyle = '#a07040'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        const wagAngle = Math.sin(t * Math.PI * 4) * 0.5;
        ctx.beginPath(); ctx.moveTo(cx+30, cy+30); ctx.quadraticCurveTo(cx+50+Math.cos(wagAngle)*15, cy+10+Math.sin(wagAngle)*20, cx+40+Math.cos(wagAngle)*20, cy-10); ctx.stroke();

        ctx.fillStyle = '#c8a070';
        ctx.beginPath(); ctx.ellipse(cx-16, cy+44, 10, 7, -0.2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+16, cy+44, 10, 7, 0.2, 0, Math.PI*2); ctx.fill();
    },
    SuperJoy: function(ctx, w, h, t) {
        const bob = Math.sin(t * Math.PI * 2) * 4;
        const cx = w/2, cy = h/2 + 10 + bob;

        ctx.fillStyle = '#5a9e4a'; ctx.beginPath(); ctx.ellipse(cx, cy+5, 26, 22, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#b0d890'; ctx.beginPath(); ctx.ellipse(cx, cy+10, 16, 14, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#5a9e4a'; ctx.beginPath(); ctx.arc(cx, cy-20, 24, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#5a9e4a'; ctx.beginPath(); ctx.arc(cx-14, cy-34, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#5a9e4a'; ctx.beginPath(); ctx.arc(cx+14, cy-34, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f0f0c0'; ctx.beginPath(); ctx.arc(cx-14, cy-34, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f0f0c0'; ctx.beginPath(); ctx.arc(cx+14, cy-34, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(cx-14, cy-34, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(cx+14, cy-34, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx-12, cy-36, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx+16, cy-36, 2, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = '#3a6e2a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx-14, cy-10); ctx.quadraticCurveTo(cx, cy-4, cx+14, cy-10); ctx.stroke();

        ctx.fillStyle = '#3a6e2a'; ctx.beginPath(); ctx.arc(cx-5, cy-16, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3a6e2a'; ctx.beginPath(); ctx.arc(cx+5, cy-16, 2, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#4a8e3a';
        ctx.beginPath(); ctx.ellipse(cx-28, cy+16, 14, 8, -0.8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+28, cy+16, 14, 8, 0.8, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#5a9e4a';
        ctx.beginPath(); ctx.ellipse(cx-38, cy+20, 12, 6, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+38, cy+20, 12, 6, 0.3, 0, Math.PI*2); ctx.fill();
    },
    Peito: function(ctx, w, h, t) {

        const bob = Math.sin(t * Math.PI * 2) * 3;
        const cx = w/2, cy = h/2 + bob;

        ctx.fillStyle = '#3a3a4a'; ctx.beginPath(); ctx.ellipse(cx, cy+8, 28, 36, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#6a6a7a'; ctx.beginPath(); ctx.ellipse(cx, cy+14, 16, 24, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#3a3a4a'; ctx.beginPath(); ctx.arc(cx, cy-24, 26, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#3a3a4a';
        ctx.beginPath(); ctx.moveTo(cx-18, cy-42); ctx.lineTo(cx-30, cy-60); ctx.lineTo(cx-8, cy-44); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+18, cy-42); ctx.lineTo(cx+30, cy-60); ctx.lineTo(cx+8, cy-44); ctx.fill();
        ctx.fillStyle = '#7a4a6a';
        ctx.beginPath(); ctx.moveTo(cx-18, cy-44); ctx.lineTo(cx-26, cy-56); ctx.lineTo(cx-10, cy-45); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+18, cy-44); ctx.lineTo(cx+26, cy-56); ctx.lineTo(cx+10, cy-45); ctx.fill();

        ctx.fillStyle = '#c060c0'; ctx.beginPath(); ctx.ellipse(cx-10, cy-26, 6, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#c060c0'; ctx.beginPath(); ctx.ellipse(cx+10, cy-26, 6, 4, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#3a3a4a';
        ctx.beginPath(); ctx.rect(cx-17, cy-32, 14, 6); ctx.fill();
        ctx.beginPath(); ctx.rect(cx+3, cy-32, 14, 6); ctx.fill();

        ctx.fillStyle = '#a050a0'; ctx.beginPath(); ctx.arc(cx, cy-18, 3, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = '#805080'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx-7, cy-12); ctx.quadraticCurveTo(cx, cy-15, cx+7, cy-12); ctx.stroke();

        ctx.strokeStyle = '#8888aa'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx-4, cy-17); ctx.lineTo(cx-26, cy-19); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+4, cy-17); ctx.lineTo(cx+26, cy-19); ctx.stroke();

        ctx.strokeStyle = '#5a5a7a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx+26, cy+34); ctx.quadraticCurveTo(cx+55, cy+15+Math.sin(t*Math.PI*2)*5, cx+38, cy-5); ctx.stroke();

        ctx.fillStyle = '#3a3a4a';
        ctx.beginPath(); ctx.ellipse(cx-16, cy+42, 11, 7, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+16, cy+42, 11, 7, 0.3, 0, Math.PI*2); ctx.fill();
    },
    Melisa: function(ctx, w, h, t) {
        const bob = Math.sin(t * Math.PI * 2) * 5;
        const cx = w/2, cy = h/2 + bob;

        ctx.strokeStyle = '#c06020'; ctx.lineWidth = 14; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx+22, cy+30); ctx.quadraticCurveTo(cx+65+Math.sin(t*Math.PI*2)*6, cy, cx+45, cy-30); ctx.stroke();
        ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cx+28, cy+26); ctx.quadraticCurveTo(cx+62+Math.sin(t*Math.PI*2)*6, cy+2, cx+48, cy-24); ctx.stroke();

        ctx.fillStyle = '#d06828'; ctx.beginPath(); ctx.ellipse(cx, cy+8, 28, 34, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#f0e0c0'; ctx.beginPath(); ctx.ellipse(cx, cy+16, 16, 22, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#d06828'; ctx.beginPath(); ctx.arc(cx, cy-24, 26, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#d06828';
        ctx.beginPath(); ctx.moveTo(cx-18, cy-42); ctx.lineTo(cx-26, cy-64); ctx.lineTo(cx-6, cy-44); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+18, cy-42); ctx.lineTo(cx+26, cy-64); ctx.lineTo(cx+6, cy-44); ctx.fill();
        ctx.fillStyle = '#e08050';
        ctx.beginPath(); ctx.moveTo(cx-18, cy-44); ctx.lineTo(cx-22, cy-58); ctx.lineTo(cx-8, cy-45); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+18, cy-44); ctx.lineTo(cx+22, cy-58); ctx.lineTo(cx+8, cy-45); ctx.fill();

        ctx.fillStyle = '#f0e0c0'; ctx.beginPath(); ctx.ellipse(cx, cy-16, 14, 10, 0, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#2a1a00'; ctx.beginPath(); ctx.ellipse(cx-10, cy-26, 5, 7, 0.2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2a1a00'; ctx.beginPath(); ctx.ellipse(cx+10, cy-26, 5, 7, -0.2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx-8, cy-28, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx+12, cy-28, 2, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#503010'; ctx.beginPath(); ctx.arc(cx, cy-17, 4, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = '#703820'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx-5, cy-11); ctx.quadraticCurveTo(cx, cy-8, cx+8, cy-10); ctx.stroke();

        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx-4, cy-16); ctx.lineTo(cx-28, cy-18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx-4, cy-13); ctx.lineTo(cx-28, cy-12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+4, cy-16); ctx.lineTo(cx+28, cy-18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+4, cy-13); ctx.lineTo(cx+28, cy-12); ctx.stroke();

        ctx.fillStyle = '#d06828';
        ctx.beginPath(); ctx.ellipse(cx-16, cy+42, 11, 7, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+16, cy+42, 11, 7, 0.3, 0, Math.PI*2); ctx.fill();
    }
};


function petcustAnimLoop() {


    const win = openWindows['pet-customizer'];
    if (!win) { petcustAnimFrame = null; return; }

    const p = petcustList[petcustCurrent];
    const prof = petProfiles[p.id];
    const mc = win.querySelector('#pc-main-canvas');
    if (mc && prof) { mc.src = prof.img; mc.alt = p.name; }
    petcustAnimFrame = requestAnimationFrame(petcustAnimLoop);
}

function petcustInit() {
    petcustRender();
    if (petcustAnimFrame) cancelAnimationFrame(petcustAnimFrame);
    petcustAnimFrame = requestAnimationFrame(petcustAnimLoop);
}

function petcustRender() {
    const win = openWindows['pet-customizer'];
    if (!win) return;
    const p = petcustList[petcustCurrent];
    const prof = petProfiles[p.id];
    win.querySelectorAll('.pc-entry').forEach((el,i) => el.classList.toggle('pc-entry-active', i === petcustCurrent));
    const nm = win.querySelector('#pc-name');  if (nm) nm.textContent = p.name;
    const ds = win.querySelector('#pc-desc');  if (ds) ds.textContent = prof ? prof.type : '';
    const ph = win.querySelector('#pc-phrase');
    if (ph && prof) ph.textContent = '"' + prof.phrases[Math.floor(Math.random()*prof.phrases.length)] + '"';

    const mc = win.querySelector('#pc-main-canvas');
    if (mc && prof) { mc.src = prof.img; mc.alt = p.name; }
}

function petcustSelect(idx) {
    petcustCurrent = idx;
    setActivePet(petcustList[idx].id);
    petcustRender();
    if (petcustList[idx].id === 'SuperJoy') achUnlock('joyjoy');
}


const MII = {
    name:         'Mi Muñequito',
    bodyColor:    0,
    clothes:      0,
    hair:         0,
    hat:          0,
    clothesColor: null,
    hairColor:    null,
    locked:       true,
};


const MII_BODY_COLORS = [
    { label:'Piel clara',    hex: '#FFE6D9' },
    { label:'Piel rosada',   hex: '#E5B9A2' },
    { label:'Piel beige',    hex: '#CCA490' },
    { label:'Piel canela',   hex: '#B2907D' },
    { label:'Piel morena',   hex: '#997B6C' },
    { label:'Piel oscura',   hex: '#6B564B' },
    { label:'Azul cielo',    hex: '#92c0e2' },
    { label:'Rosado',        hex: '#ea9999' },
    { label:'Verde menta',   hex: '#b6d7a8' },
];


const MII_PARTS = {
    clothes: [
        { label:'Ninguna', img: null },
        { label:'Ropa 1',  img: 'images/ropa-1.png' },
        { label:'Ropa 2',  img: 'images/ropa-2.png' },
        { label:'Ropa 3',  img: 'images/ropa-3.png' },
        { label:'Ropa 4',  img: 'images/ropa-4.png' },
        { label:'Ropa 5',  img: 'images/ropa-5.png' },
    ],
    hair: [
        { label:'Ninguno', img: null },
        { label:'Pelo 1',  img: 'images/pelo-1.png' },
        { label:'Pelo 2',  img: 'images/pelo-2.png' },
        { label:'Pelo 3',  img: 'images/pelo-3.png' },
        { label:'Pelo 4',  img: 'images/pelo-4.png' },
    ],
    hat: [
        { label:'Ninguno',   img: null },
        { label:'Sombrero 1',img: 'images/sombrero-1.png' },
        { label:'Sombrero 2',img: 'images/sombrero-2.png' },
        { label:'Sombrero 3',img: 'images/sombrero-3.png' },
        { label:'Sombrero 4',img: 'images/sombrero-4.png' },
    ],
};


function miiRoot(el) {

    if (el && el.closest) {
        const r = el.closest('.mii-root');
        if (r) return r;
    }

    const allRoots = document.querySelectorAll('.mii-root');
    for (const r of allRoots) {
        if (!r.closest('.window-template')) return r;
    }
    return allRoots[0] || null;
}


function miiSetLocked(root, locked) {
    const editor = root.querySelector('.mii-col-editor');
    const nameInput = root.querySelector('.mii-name-input');
    const overlay = root.querySelector('.mii-lock-overlay');
    if (editor) editor.style.opacity = locked ? '0.4' : '1';
    if (editor) editor.style.pointerEvents = locked ? 'none' : '';
    if (nameInput) { nameInput.disabled = locked; }
    if (overlay) overlay.style.display = locked ? 'flex' : 'none';
}


function miiApplyLayerTint(root, layerClass, colorHex) {
    const canvas = root.querySelector('.mii-export-canvas');
    const layerImg = root.querySelector('.' + layerClass);
    if (!layerImg || layerImg.style.display === 'none') return;
    if (!colorHex) {

        const origSrc = layerImg.dataset.origSrc;
        if (origSrc) layerImg.src = origSrc;
        return;
    }
    const W = 504, H = 504;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const origSrc = layerImg.dataset.origSrc || layerImg.src;
    layerImg.dataset.origSrc = origSrc;
    const tmpImg = new Image();
    tmpImg.crossOrigin = 'anonymous';
    tmpImg.onload = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(tmpImg, 0, 0, W, H);
        const imageData = ctx.getImageData(0, 0, W, H);
        const d = imageData.data;
        const r = parseInt(colorHex.slice(1,3), 16);
        const g = parseInt(colorHex.slice(3,5), 16);
        const b = parseInt(colorHex.slice(5,7), 16);
        for (let i = 0; i < d.length; i += 4) {
            const pa = d[i+3];
            if (pa < 10) continue;
            const lum = (d[i] + d[i+1] + d[i+2]) / 765;
            if (lum < 0.2) continue;
            const f = lum;
            d[i]   = Math.round(d[i]   * (r/255) * f + d[i]   * (1-f));
            d[i+1] = Math.round(d[i+1] * (g/255) * f + d[i+1] * (1-f));
            d[i+2] = Math.round(d[i+2] * (b/255) * f + d[i+2] * (1-f));
        }
        ctx.putImageData(imageData, 0, 0);
        layerImg.src = canvas.toDataURL('image/png');
    };
    tmpImg.src = origSrc;
}


function miiApplyBodyTint(root, colorHex) {
    const stage = root.querySelector('.mii-avatar-stage');
    const baseImg = root.querySelector('.mii-layer-base');
    if (!stage || !baseImg) return;


    if (!colorHex) {
        baseImg.style.filter = '';
        return;
    }


    const canvas = root.querySelector('.mii-export-canvas');
    const W = 504, H = 504;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const applyTint = (img) => {
        ctx.clearRect(0, 0, W, H);

        ctx.drawImage(img, 0, 0, W, H);


        const imageData = ctx.getImageData(0, 0, W, H);
        const d = imageData.data;
        const r = parseInt(colorHex.slice(1,3), 16);
        const g = parseInt(colorHex.slice(3,5), 16);
        const b = parseInt(colorHex.slice(5,7), 16);

        for (let i = 0; i < d.length; i += 4) {
            const pr = d[i], pg = d[i+1], pb = d[i+2], pa = d[i+3];
            if (pa < 10) continue;

            const lum = (pr + pg + pb) / 765;

            if (lum < 0.25) continue;

            const factor = lum;
            d[i]   = Math.round(pr * (r/255) * factor + pr * (1 - factor));
            d[i+1] = Math.round(pg * (g/255) * factor + pg * (1 - factor));
            d[i+2] = Math.round(pb * (b/255) * factor + pb * (1 - factor));
        }
        ctx.putImageData(imageData, 0, 0);


        baseImg.src = canvas.toDataURL('image/png');
        baseImg.style.filter = '';
    };


    if (baseImg.naturalWidth > 0 && baseImg.complete) {


        const origSrc = baseImg.dataset.origSrc || baseImg.src;
        baseImg.dataset.origSrc = origSrc;

        if (baseImg.src !== origSrc || !baseImg.dataset.origSrc.startsWith('data:')) {

            const tmpImg = new Image();
            tmpImg.crossOrigin = 'anonymous';
            tmpImg.onload = () => applyTint(tmpImg);
            tmpImg.src = origSrc;
        } else {

            const tmpImg = new Image();
            tmpImg.crossOrigin = 'anonymous';
            tmpImg.onload = () => applyTint(tmpImg);
            tmpImg.src = origSrc;
        }
    } else {
        baseImg.onload = () => {
            baseImg.dataset.origSrc = baseImg.src;
            const tmpImg = new Image();
            tmpImg.crossOrigin = 'anonymous';
            tmpImg.onload = () => applyTint(tmpImg);
            tmpImg.src = baseImg.dataset.origSrc;
        };
    }
}


function miiSetLayer(root, layerClass, imgSrc) {
    const img = root.querySelector('.' + layerClass);
    if (!img) return;
    if (imgSrc) {
        img.src = imgSrc;
        img.style.display = '';
    } else {
        img.style.display = 'none';
        img.src = '';
    }
}


function miiSelectBodyColor(idx, btn) {
    if (MII.locked) return;
    MII.bodyColor = idx;
    const root = miiRoot(btn);

    root.querySelectorAll('.mii-body-colors .mii-color-btn')
        .forEach((b,i) => b.classList.toggle('selected', i === idx));

    const baseImg = root.querySelector('.mii-layer-base');
    if (baseImg && baseImg.dataset.origSrc) {
        baseImg.src = baseImg.dataset.origSrc;
    }

    const color = MII_BODY_COLORS[idx].hex;
    if (!color) {
        if (baseImg && baseImg.dataset.origSrc) {
            baseImg.src = baseImg.dataset.origSrc;
        }
        return;
    }

    setTimeout(() => miiApplyBodyTint(root, color), 20);
}


function miiSelectPart(type, idx, btn) {
    if (MII.locked) return;
    MII[type] = idx;
    const root = miiRoot(btn);
    const layerMap = { clothes:'mii-layer-clothes', hair:'mii-layer-hair', hat:'mii-layer-hat' };

    root.querySelectorAll(`.mii-${type}-grid .mii-part-btn`)
        .forEach((b,i) => b.classList.toggle('selected', i === idx));

    const layerImg = root.querySelector('.' + layerMap[type]);
    if (layerImg) delete layerImg.dataset.origSrc;

    const part = MII_PARTS[type][idx];
    miiSetLayer(root, layerMap[type], part ? part.img : null);

    if (type === 'clothes' && MII.clothesColor && part && part.img) {
        setTimeout(() => miiApplyLayerTint(root, 'mii-layer-clothes', MII.clothesColor), 40);
    }
    if (type === 'hair' && MII.hairColor && part && part.img) {
        setTimeout(() => miiApplyLayerTint(root, 'mii-layer-hair', MII.hairColor), 40);
    }
}


function miiSelectClothesColor(colorHex, btn) {
    if (MII.locked) return;
    MII.clothesColor = colorHex;
    const root = miiRoot(btn);
    root.querySelectorAll('.mii-clothes-color-btn')
        .forEach(b => b.classList.toggle('selected', b.dataset.color === colorHex));
    miiApplyLayerTint(root, 'mii-layer-clothes', colorHex);
}


function miiSelectHairColor(colorHex, btn) {
    if (MII.locked) return;
    MII.hairColor = colorHex;
    const root = miiRoot(btn);
    root.querySelectorAll('.mii-hair-color-btn')
        .forEach(b => b.classList.toggle('selected', b.dataset.color === colorHex));
    miiApplyLayerTint(root, 'mii-layer-hair', colorHex);
}


function miiSwitchTab(tabId, btn) {
    const root = miiRoot(btn);
    root.querySelectorAll('.mii-cat-tab').forEach(t => t.classList.remove('active'));
    root.querySelectorAll('.mii-cat-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = root.querySelector(`.mii-cat-panel[data-panel="${tabId}"]`);
    if (panel) panel.classList.add('active');
}


function miiBuildPartGrid(type, root) {
    const grid = root.querySelector(`.mii-${type}-grid`);
    if (!grid) return;
    grid.innerHTML = '';
    MII_PARTS[type].forEach((part, i) => {
        const btn = document.createElement('button');
        btn.className = 'mii-part-btn' + (i === MII[type] ? ' selected' : '');
        btn.title = part.label;
        btn.onclick = () => miiSelectPart(type, i, btn);
        if (part.img) {
            const img = document.createElement('img');
            img.src = part.img;
            img.alt = part.label;
            img.onerror = () => {
                img.remove();
                btn.textContent = part.label.substring(0, 5);
            };
            btn.appendChild(img);
        } else {

            btn.innerHTML = `<span style="font-size:16px;opacity:0.35">✕</span><br><span style="font-size:8px">${part.label}</span>`;
        }
        grid.appendChild(btn);
    });
}


function miiBuildClothesColors(root) {
    const row = root.querySelector('.mii-clothes-color-row');
    if (!row) return;
    row.innerHTML = '';
    MII_CLOTHES_COLORS.forEach((c) => {
        const btn = document.createElement('button');
        btn.dataset.color = c.hex || '';
        btn.title = c.label;
        btn.onclick = () => miiSelectClothesColor(c.hex, btn);
        if (c.hex) {
            btn.className = 'mii-color-btn mii-clothes-color-btn' + (MII.clothesColor === c.hex ? ' selected' : '');
            btn.style.background = c.hex;
        } else {
            btn.className = 'mii-color-btn mii-color-original mii-clothes-color-btn' + (!MII.clothesColor ? ' selected' : '');
            btn.textContent = '○';
        }
        row.appendChild(btn);
    });
}


function miiBuildHairColors(root) {
    const row = root.querySelector('.mii-hair-color-row');
    if (!row) return;
    row.innerHTML = '';
    MII_HAIR_COLORS.forEach((c) => {
        const btn = document.createElement('button');
        btn.dataset.color = c.hex || '';
        btn.title = c.label;
        btn.onclick = () => miiSelectHairColor(c.hex, btn);
        if (c.hex) {
            btn.className = 'mii-color-btn mii-hair-color-btn' + (MII.hairColor === c.hex ? ' selected' : '');
            btn.style.background = c.hex;
        } else {
            btn.className = 'mii-color-btn mii-color-original mii-hair-color-btn' + (!MII.hairColor ? ' selected' : '');
            btn.textContent = '○';
        }
        row.appendChild(btn);
    });
}


function miiBuildBodyColors(root) {
    const row = root.querySelector('.mii-body-colors');
    if (!row) return;
    row.innerHTML = '';
    MII_BODY_COLORS.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.title = c.label;
        btn.onclick = () => miiSelectBodyColor(i, btn);
        if (c.hex) {
            btn.className = 'mii-color-btn' + (i === MII.bodyColor ? ' selected' : '');
            btn.style.background = c.hex;
        } else {

            btn.className = 'mii-color-btn mii-color-original' + (i === MII.bodyColor ? ' selected' : '');
            btn.textContent = '○';
        }
        row.appendChild(btn);
    });
}


function miiUpdateName(inp) {
    MII.name = inp ? inp.value : MII.name;
}


const MII_CLOTHES_COLORS = [
    { label:'Original', hex: null },
    { label:'Morado',   hex: '#7B2FBE' },
    { label:'Azul',     hex: '#2563EB' },
    { label:'Rojo',     hex: '#DC2626' },
    { label:'Verde',    hex: '#16A34A' },
    { label:'Naranja',  hex: '#EA580C' },
    { label:'Teto',     hex: '#ff0045' },
    { label:'Amarillo', hex: '#CA8A04' },
    { label:'Celeste',  hex: '#0891B2' },
    { label:'Negro',    hex: '#1C1C1C' },
    { label:'Blanco',   hex: '#F5F5F5' },
    { label:'Gris',     hex: '#6B7280' },
];
const MII_HAIR_COLORS = [
    { label:'Original',      hex: null },
    { label:'Negro',         hex: '#111111' },
    { label:'Castaño',       hex: '#5a3010' },
    { label:'Castaño claro', hex: '#8B5E3C' },
    { label:'Rubio',         hex: '#D4A017' },
    { label:'Rubio claro',   hex: '#F5E6A3' },
    { label:'Pelirrojo',     hex: '#A0330A' },
    { label:'Gris',          hex: '#888888' },
    { label:'Blanco',        hex: '#e8e8e8' },
    { label:'Teto',    hex: '#ff0045' },
    { label:'Tinte azul',    hex: '#2244ee' },
    { label:'Tinte morado',  hex: '#7722cc' },
];

function miiRandom(btn) {
    const root = miiRoot(btn);

    MII.locked = false;
    miiSetLocked(root, false);

    ['mii-layer-clothes','mii-layer-hair'].forEach(cls => {
        const img = root.querySelector('.' + cls);
        if (img) delete img.dataset.origSrc;
    });

    MII.bodyColor = Math.floor(Math.random() * MII_BODY_COLORS.length);

    MII.clothes = Math.floor(Math.random() * MII_PARTS.clothes.length);
    MII.hair    = Math.floor(Math.random() * MII_PARTS.hair.length);
    MII.hat     = Math.floor(Math.random() * MII_PARTS.hat.length);

    MII.clothesColor = MII_CLOTHES_COLORS[Math.floor(Math.random() * MII_CLOTHES_COLORS.length)].hex;
    MII.hairColor    = MII_HAIR_COLORS[Math.floor(Math.random() * MII_HAIR_COLORS.length)].hex;

    miiBuildBodyColors(root);
    miiBuildClothesColors(root);
    miiBuildHairColors(root);
    ['clothes','hair','hat'].forEach(t => {
        miiBuildPartGrid(t, root);
        const layerMap = { clothes:'mii-layer-clothes', hair:'mii-layer-hair', hat:'mii-layer-hat' };
        miiSetLayer(root, layerMap[t], MII_PARTS[t][MII[t]]?.img || null);
    });

    const baseImg = root.querySelector('.mii-layer-base');
    if (baseImg && baseImg.dataset.origSrc) baseImg.src = baseImg.dataset.origSrc;
    const color = MII_BODY_COLORS[MII.bodyColor].hex;
    if (color) setTimeout(() => miiApplyBodyTint(root, color), 20);
    if (MII.clothesColor) setTimeout(() => miiApplyLayerTint(root, 'mii-layer-clothes', MII.clothesColor), 60);
    if (MII.hairColor)    setTimeout(() => miiApplyLayerTint(root, 'mii-layer-hair',    MII.hairColor),    80);
}


async function miiSave(btn) {
    const root = miiRoot(btn);
    const canvas = root.querySelector('.mii-export-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 504, H = 504;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const loadImg = (src) => new Promise(res => {
        if (!src) { res(null); return; }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });


    const baseEl    = root.querySelector('.mii-layer-base');
    const clothesEl = root.querySelector('.mii-layer-clothes');
    const hairEl    = root.querySelector('.mii-layer-hair');
    const hatEl     = root.querySelector('.mii-layer-hat');

    const baseSrc    = baseEl?.src || 'images/base1.png';
    const clothesSrc = clothesEl?.style.display !== 'none' ? clothesEl?.src : null;
    const hairSrc    = hairEl?.style.display !== 'none'    ? hairEl?.src    : null;
    const hatSrc     = hatEl?.style.display !== 'none'     ? hatEl?.src     : null;

    const [baseImg, clothesImg, hairImg, hatImg] =
        await Promise.all([loadImg(baseSrc), loadImg(clothesSrc), loadImg(hairSrc), loadImg(hatSrc)]);

    if (baseImg)    ctx.drawImage(baseImg, 0, 0, W, H);
    if (clothesImg) ctx.drawImage(clothesImg, 0, 0, W, H);
    if (hairImg)    ctx.drawImage(hairImg, 0, 0, W, H);
    if (hatImg)     ctx.drawImage(hatImg, 0, 0, W, H);


    canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (MII.name || 'munequito').replace(/[^a-z0-9_\-]/gi, '_') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
}


function miiInit(contextEl) {
    const root = (contextEl && contextEl.classList.contains('mii-root'))
        ? contextEl
        : miiRoot(contextEl);
    if (!root) return;


    const baseImg = root.querySelector('.mii-layer-base');
    if (baseImg) {
        if (!baseImg.dataset.origSrc) {
            baseImg.dataset.origSrc = baseImg.src || 'images/base1.png';
        }
    }

    MII.locked = true;
    miiBuildBodyColors(root);
    miiBuildClothesColors(root);
    miiBuildHairColors(root);
    ['clothes','hair','hat'].forEach(t => miiBuildPartGrid(t, root));
    miiSetLocked(root, true);
}


let notepadCurrentFile = 'Sin título.txt';

function notepadSave() {
    const ta = winEl('notepad', '#notepad-textarea');
    const fn = winEl('notepad', '#notepad-filename');
    const text = ta ? ta.value : '';
    const rawName = (fn ? fn.textContent.replace(' (Papelera)', '') : notepadCurrentFile) || 'Sin título';
    const name = rawName.endsWith('.txt') ? rawName : rawName + '.txt';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    playXPSound('archivo-guardar');
}

function notepadClear() {
    const ta = winEl('notepad', '#notepad-textarea');
    const fn = winEl('notepad', '#notepad-filename');
    if (ta) ta.value = '';
    if (fn) fn.textContent = 'Sin título.txt';
    notepadCurrentFile = 'Sin título.txt';
    notepadUpdateStatus();
}

function notepadUpdateStatus() {
    const ta = winEl('notepad', '#notepad-textarea');
    if (!ta) return;
    const text = ta.value;
    const chars = winEl('notepad', '#notepad-charcount');
    const lines = winEl('notepad', '#notepad-linecount');
    if (chars) chars.textContent = text.length + ' caracteres';
    if (lines) {
        const pos = ta.selectionStart || 0;
        const linesBefore = text.substring(0, pos).split('\n');
        lines.textContent = 'Línea ' + linesBefore.length + ', Col ' + (linesBefore[linesBefore.length - 1].length + 1);
    }
}


let msBoard = [], msMinePositions = [], msGameStarted = false, msGameOver = false;
let msFlagged = 0, msTimerVal = 0, msTimerInterval = null;
const MS_ROWS = 9, MS_COLS = 9, MS_MINES = 10;
const msRevealedSet = new Set();
const msFlaggedSet = new Set();

function msKey(r, c) { return r + ',' + c; }

function msNewGame() {
    clearInterval(msTimerInterval);
    msGameStarted = false;
    msGameOver = false;
    msFlagged = 0;
    msTimerVal = 0;
    msRevealedSet.clear();
    msFlaggedSet.clear();
    msBoard = Array.from({ length: MS_ROWS }, () => Array(MS_COLS).fill(0));
    msMinePositions = [];
    const faceEl  = winEl('minesweeper', '#ms-face');
    const timerEl = winEl('minesweeper', '#ms-timer');
    const bombEl  = winEl('minesweeper', '#ms-bomb-count');
    const statusEl = winEl('minesweeper', '#ms-status');
    if (faceEl)   faceEl.textContent = '🙂';
    if (timerEl)  timerEl.textContent = '0';
    if (bombEl)   bombEl.textContent = MS_MINES;
    if (statusEl) statusEl.textContent = 'Haz clic izquierdo para revelar · Derecho para bandera';
    msRenderGrid();
}

function msPlaceMines(safeR, safeC) {
    const placed = new Set();
    while (placed.size < MS_MINES) {
        const r = Math.floor(Math.random() * MS_ROWS);
        const c = Math.floor(Math.random() * MS_COLS);
        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
        const k = msKey(r, c);
        if (!placed.has(k)) { placed.add(k); msMinePositions.push([r, c]); msBoard[r][c] = -1; }
    }
    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            if (msBoard[r][c] === -1) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < MS_ROWS && nc >= 0 && nc < MS_COLS && msBoard[nr][nc] === -1) count++;
            }
            msBoard[r][c] = count;
        }
    }
}

function msRenderGrid() {
    const grid = winEl('minesweeper', '#ms-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(' + MS_COLS + ', 26px)';
    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'ms-cell ms-cell-hidden';
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', msHandleClick);
            cell.addEventListener('contextmenu', msHandleFlag);
            grid.appendChild(cell);
        }
    }
}

const MS_NUM_COLORS = ['','#0000ff','#008000','#ff0000','#800080','#800000','#008080','#000000','#808080'];

function msCellEl(r, c) {
    const grid = winEl('minesweeper', '#ms-grid');
    return grid ? grid.querySelector('[data-r="' + r + '"][data-c="' + c + '"]') : null;
}

function msHandleClick(e) {
    if (msGameOver) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);
    if (msFlaggedSet.has(msKey(r, c)) || msRevealedSet.has(msKey(r, c))) return;
    if (!msGameStarted) {
        msGameStarted = true;
        msPlaceMines(r, c);
        const faceEl = winEl('minesweeper', '#ms-face');
        if (faceEl) faceEl.textContent = '😮';
        msTimerInterval = setInterval(() => {
            msTimerVal = Math.min(999, msTimerVal + 1);
            const timerEl = winEl('minesweeper', '#ms-timer');
            if (timerEl) timerEl.textContent = msTimerVal;
        }, 1000);
        setTimeout(() => {
            const fEl = winEl('minesweeper', '#ms-face');
            if (fEl && !msGameOver) fEl.textContent = '🙂';
        }, 300);
    }
    if (msBoard[r][c] === -1) {
        msRevealAllMines(r, c);
        return;
    }
    msRevealCell(r, c);
    msCheckWin();
}

function msHandleFlag(e) {
    e.preventDefault();
    if (msGameOver || !msGameStarted) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);
    const k = msKey(r, c);
    if (msRevealedSet.has(k)) return;
    const cell = msCellEl(r, c);
    const bombEl = winEl('minesweeper', '#ms-bomb-count');
    if (msFlaggedSet.has(k)) {
        msFlaggedSet.delete(k);
        if (cell) { cell.textContent = ''; cell.classList.remove('ms-cell-flagged'); }
        msFlagged--;
    } else {
        msFlaggedSet.add(k);
        if (cell) { cell.textContent = '🚩'; cell.classList.add('ms-cell-flagged'); }
        msFlagged++;
        playXPSound('minas-bandera');
    }
    if (bombEl) bombEl.textContent = MS_MINES - msFlagged;
}

function msRevealCell(r, c) {
    if (r < 0 || r >= MS_ROWS || c < 0 || c >= MS_COLS) return;
    const k = msKey(r, c);
    if (msRevealedSet.has(k) || msFlaggedSet.has(k)) return;
    msRevealedSet.add(k);
    const cell = msCellEl(r, c);
    if (!cell) return;
    cell.classList.remove('ms-cell-hidden', 'ms-cell-flagged');
    cell.classList.add('ms-cell-revealed');
    const val = msBoard[r][c];
    if (val > 0) {
        cell.textContent = val;
        cell.style.color = MS_NUM_COLORS[val] || '#000';
        cell.style.fontWeight = 'bold';
    } else if (val === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) msRevealCell(r + dr, c + dc);
        }
    }
}

function msRevealAllMines(clickR, clickC) {
    msGameOver = true;
    clearInterval(msTimerInterval);
    const faceEl   = winEl('minesweeper', '#ms-face');
    const statusEl = winEl('minesweeper', '#ms-status');
    if (faceEl)   faceEl.textContent = '😵';
    if (statusEl) statusEl.textContent = '💥 ¡Pisaste una mina! Clic en la carita para reiniciar.';
    playXPSound('minas-explotar');
    msMinePositions.forEach(([r, c]) => {
        const cell = msCellEl(r, c);
        if (!cell) return;
        cell.classList.remove('ms-cell-hidden', 'ms-cell-flagged');
        cell.classList.add(r === clickR && c === clickC ? 'ms-cell-mine-hit' : 'ms-cell-mine');
        cell.textContent = r === clickR && c === clickC ? '💥' : '💣';
    });
}

function msCheckWin() {
    const safeTotal = MS_ROWS * MS_COLS - MS_MINES;
    if (msRevealedSet.size === safeTotal) {
        msGameOver = true;
        clearInterval(msTimerInterval);
        const faceEl   = winEl('minesweeper', '#ms-face');
        const statusEl = winEl('minesweeper', '#ms-status');
        if (faceEl)   faceEl.textContent = '😎';
        if (statusEl) statusEl.textContent = '🏆 ¡Ganaste en ' + msTimerVal + 's! Clic en 😎 para otra partida.';
        playXPSound('minas-ganar');
        msMinePositions.forEach(([r, c]) => {
            const cell = msCellEl(r, c);
            if (cell) { cell.textContent = '🚩'; cell.classList.add('ms-cell-flagged'); }
        });
    }
}

function msInit() {
    msRevealedSet.clear();
    msFlaggedSet.clear();
    msNewGame();
}


let tmSelected = null;
let tmRefreshInterval = null;

function tmRefresh() {
    const list     = winEl('taskmanager', '#tm-app-list');
    const countEl  = winEl('taskmanager', '#tm-proc-count');
    const cpuEl    = winEl('taskmanager', '#tm-cpu-use');
    const memEl    = winEl('taskmanager', '#tm-mem-use');
    if (!list) return;
    list.innerHTML = '';
    tmSelected = null;
    const ids = Object.keys(openWindows).filter(id => id !== 'taskmanager');
    if (countEl) countEl.textContent = ids.length;
    if (cpuEl)   cpuEl.textContent   = (Math.floor(Math.random() * 35) + 5);
    if (memEl)   memEl.textContent   = (128 + ids.length * 14);
    if (ids.length === 0) {
        const li = document.createElement('li');
        li.className = 'tm-item tm-empty';
        li.textContent = 'No hay aplicaciones en ejecución.';
        list.appendChild(li);
        return;
    }
    ids.forEach(id => {
        const title = windowTitles[id] || id;
        const win = openWindows[id];
        const isMinimized = win && win.classList.contains('window-minimized');
        const li = document.createElement('li');
        li.className = 'tm-item';
        li.dataset.windowId = id;
        const statusClass = isMinimized ? ' tm-status-min' : ' tm-status-run';
        const statusText  = isMinimized ? 'No responde'     : 'Ejecutándose';
        li.innerHTML = '<span class="tm-item-title">' + title + '</span><span class="tm-item-status' + statusClass + '">' + statusText + '</span>';
        li.addEventListener('click', () => {
            list.querySelectorAll('.tm-item').forEach(i => i.classList.remove('tm-item-selected'));
            li.classList.add('tm-item-selected');
            tmSelected = id;
        });
        li.addEventListener('dblclick', () => { tmSelected = id; tmSwitchTo(); });
        list.appendChild(li);
    });
}

function tmSwitchTo() {
    if (!tmSelected || !openWindows[tmSelected]) { tmRefresh(); return; }
    focusWindow(tmSelected);
    tmRefresh();
}

function tmEndTask() {
    if (!tmSelected) return;
    if (!openWindows[tmSelected]) { tmSelected = null; tmRefresh(); return; }
    playXPSound('proceso-terminar');
    closeWindow(tmSelected);
    tmSelected = null;
    setTimeout(tmRefresh, 100);
}

function tmInit() {
    tmRefresh();
    clearInterval(tmRefreshInterval);
    tmRefreshInterval = setInterval(() => {
        if (openWindows['taskmanager']) tmRefresh();
        else clearInterval(tmRefreshInterval);
    }, 3000);
}


function crashSystem() {
    const bsod    = document.getElementById('bsod-overlay');
    const desktop = document.querySelector('.desktop');
    if (!bsod) return;
    playXPSound('sistema-error');
    Object.keys(openWindows).forEach(id => closeWindow(id));
    if (desktop) desktop.style.display = 'none';
    bsod.style.display = 'block';
    let pct = 0;
    const progEl = document.getElementById('bsod-progress');
    const bsodInterval = setInterval(() => {
        pct = Math.min(100, pct + Math.floor(Math.random() * 3) + 1);
        const filled = Math.round(pct / 5);
        const empty  = 20 - filled;
        if (progEl) progEl.textContent = '█'.repeat(filled) + '░'.repeat(empty) + '  ' + pct + '% completo';
        if (pct >= 100) clearInterval(bsodInterval);
    }, 130);
    const bsodRestart = () => {
        clearInterval(bsodInterval);
        bsod.style.display = 'none';
        if (desktop) desktop.style.display = '';
        document.removeEventListener('keydown', bsodRestart);
        document.removeEventListener('click',   bsodRestart);
    };
    setTimeout(() => {
        document.addEventListener('keydown', bsodRestart);
        document.addEventListener('click',   bsodRestart);
    }, 2500);
}
