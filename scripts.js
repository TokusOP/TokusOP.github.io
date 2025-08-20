function openWindow(windowId) {
    const windowContent = document.getElementById('window-content');
    const template = document.getElementById(`${windowId}-content`);
    
    if (template) {
        if (gameLoop && windowId !== 'game') {
            pauseGame();
        }

        windowContent.innerHTML = template.innerHTML;
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
            'paint': 'Paint'
        };
        document.getElementById('window-title').textContent = windowTitles[windowId] || 'Página';
        
        const mainWindow = document.getElementById('main-window');
        mainWindow.style.display = 'flex';

        if (windowId === 'game') {
            startGame();
        } else if (windowId === 'terminal') {
            document.getElementById('terminal-input').focus();
        } else if (windowId === 'eastereggs') {
            loadEasterEggs();
        } else if (windowId === 'explorer') {
            loadFiles();
        } else if (windowId === 'paint') {
            initPaint();
        }
    }
}


function closeWindow() {
    document.getElementById('main-window').style.display = 'none';
    pauseGame();
}


function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('clock').textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');
    
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

document.addEventListener('DOMContentLoaded', function() {
    makeDraggable(document.getElementById('main-window'));
    makeDraggable(document.getElementById('browser-window'));
    openWindow('home');
});

let snakeGame;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 150;
let gameLoop;
let isPaused = false;
let gridSize = 20;


function initGame() {
    const canvas = document.getElementById('game-canvas');
    snakeGame = canvas.getContext('2d');
    
    canvas.width = Math.floor(canvas.width / gridSize) * gridSize;
    canvas.height = Math.floor(canvas.height / gridSize) * gridSize;
    
    snake = [
        {x: 5 * gridSize, y: 10 * gridSize},
        {x: 4 * gridSize, y: 10 * gridSize},
        {x: 3 * gridSize, y: 10 * gridSize}
    ];
    
    generateFood();
    score = 0;
    document.getElementById('score').textContent = score;
}


function generateFood() {
    const canvas = document.getElementById('game-canvas');
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
    const canvas = document.getElementById('game-canvas');
    snakeGame.clearRect(0, 0, canvas.width, canvas.height);
    
    snakeGame.fillStyle = '#ff0000';
    snakeGame.fillRect(food.x, food.y, gridSize, gridSize);
    
    snake.forEach((segment, index) => {
        snakeGame.fillStyle = index === 0 ? '#00ff00' : '#00cc00';
        snakeGame.fillRect(segment.x, segment.y, gridSize, gridSize);
        snakeGame.strokeStyle = '#000';
        snakeGame.strokeRect(segment.x, segment.y, gridSize, gridSize);
    });
}


function updateGame() {
    if (isPaused) return;
    
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
    
    const canvas = document.getElementById('game-canvas');
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
        document.getElementById('score').textContent = score;

        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
        
        generateFood();
    } else {
        snake.pop();
    }
}


function gameStep() {
    updateGame();
    drawGame();
}


function startGame() {
    if (gameLoop) clearInterval(gameLoop);
    initGame();
    isPaused = false;
    gameLoop = setInterval(gameStep, gameSpeed);
    
    document.getElementById('game-canvas').focus();
}

function pauseGame() {
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null; 
      isPaused = true;
    }
}


function gameOver() {
    clearInterval(gameLoop);
    alert(`¡Game Over! Puntuación: ${score}`);
}


document.addEventListener('keydown', function(e) {
    const key = e.keyCode;
    
    if (key === 37 && direction !== 'right') nextDirection = 'left';
    else if (key === 38 && direction !== 'down') nextDirection = 'up';
    else if (key === 39 && direction !== 'left') nextDirection = 'right';
    else if (key === 40 && direction !== 'up') nextDirection = 'down';
    
    if (key === 32) pauseGame();
});


document.getElementById('game-canvas').tabIndex = 0;

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}


function checkDarkModePreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const localStoragePref = localStorage.getItem('darkMode');
}

document.addEventListener('DOMContentLoaded', function() {
    checkDarkModePreference();
});

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
            document.getElementById('terminal-output').innerHTML = 
                '<p>> <span class="cursor" id="cursor">_</span></p>';
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
            document.querySelector('.terminal-container').classList.toggle('terminal-secret-mode');
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
        description: "Simula un error fatal",
        execute: () => {
            const terminalOutput = document.getElementById('terminal-output');
            terminalOutput.innerHTML = `
                <div style="color:red;font-weight:bold;">
                ■ ERROR FATAL ■<br>
                EXCEPTION 0E EN 0028:C0011E36<br>
                SYSTEM HALTED<br><br>
                </div>
                <div>
                Causa posible:<br>
                - Memoria insuficiente<br>
                - Virus detectado<br>
                - Archivo corrupto<br><br>
                </div>
                <div class="command-line">
                C:\> <span class="cursor">_</span>
                </div>
            `;
            new Audio('sounds/error.mp3').play();
            return "";
        }
    }
};


function loadEasterEggs() {
    const list = document.getElementById('easteregg-list');
    list.innerHTML = '';
    
    for (const cmd in commands) {
        if (commands[cmd].hidden) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${cmd}</strong>: ${commands[cmd].description}`;
            list.appendChild(li);
        }
    }
}


function startMatrixEffect() {
    const chars = "01";
    const terminal = document.getElementById('terminal-output');
    terminal.innerHTML = "";
    
    for (let i = 0; i < 50; i++) {
        let line = "";
        for (let j = 0; j < 70; j++) {
            line += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        terminal.innerHTML += line + "<br>";
    }
    
    setTimeout(() => {
        terminal.innerHTML = '<p>Efecto Matrix terminado</p><p>> <span class="cursor" id="cursor">_</span></p>';
    }, 3000);
}


function handleTerminalInput(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('terminal-input');
        const command = input.value.trim().toLowerCase();
        input.value = "";
        
        terminalHistory.push(command);
        terminalHistoryIndex = terminalHistory.length;
        
        const terminalOutput = document.getElementById('terminal-output');
        terminalOutput.innerHTML += `<span class="command">${command}</span><br>`;
        
        let response = "";
        if (commands[command]) {
            response = commands[command].execute();
        } else if (command) {
            response = `Comando no reconocido: "${command}"<br>Escribe "help" para ayuda`;
        }
        
        if (response) {
            terminalOutput.innerHTML += `<span class="output">${response}</span><br>`;
        }
        
        terminalOutput.innerHTML += '<p>> <span class="cursor" id="cursor">_</span></p>';
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    else if (event.key === "ArrowUp") {
        if (terminalHistoryIndex > 0) {
            terminalHistoryIndex--;
            document.getElementById('terminal-input').value = terminalHistory[terminalHistoryIndex];
        }
    }
    else if (event.key === "ArrowDown") {
        if (terminalHistoryIndex < terminalHistory.length - 1) {
            terminalHistoryIndex++;
            document.getElementById('terminal-input').value = terminalHistory[terminalHistoryIndex];
        } else {
            terminalHistoryIndex = terminalHistory.length;
            document.getElementById('terminal-input').value = "";
        }
    }
}


function openTerminal() {
    openWindow('terminal');
    document.getElementById('terminal-input').focus();
}

function closeTerminal() {
    document.getElementById('main-window').style.display = 'none';
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
    
    audioPlayer.addEventListener("timeupdate", updateProgressBar);
    audioPlayer.addEventListener("ended", nextTrack);
    setInterval(updateVisualizer, 100);
}


function playSong(index) {
    currentTrack = index;
    audioPlayer.src = playlist[index].src;
    audioPlayer.play();
    isPlaying = true;
    document.getElementById("now-playing").textContent = `♪ ${playlist[index].title} ♪`;
}


function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
}


function stopPlayback() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % playlist.length;
    playSong(currentTrack);
}


function prevTrack() {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    playSong(currentTrack);
}

function changeVolume() {
    audioPlayer.volume = document.getElementById("volume-slider").value;
}


function updateProgressBar() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById("progress-bar").style.width = `${progress}%`;
}


function updateVisualizer() {
    const visualizer = document.getElementById("visualizer");
    visualizer.innerHTML = "";
    
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement("div");
        bar.className = "visualizer-bar";
        bar.style.height = `${Math.random() * 100}%`;
        bar.style.animationDelay = `${i * 0.05}s`;
        visualizer.appendChild(bar);
    }
}


window.onload = function() {
    initPlayer();
};
function activateVirus() {
    if (!confirm('Este archivo podría contener contenido sensible, como fotos. ¿Estás seguro de que quieres ejecutarlo?')) {
        return;
    }

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
    
    if (document.querySelector(".terminal")) {
        startMatrixEffect(); 
    }
    
    const errorSound = new Audio("sounds/error.mp3");
    errorSound.loop = true;
    errorSound.play();
    
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

const randomPhrases = [
  "Hola, camarada!",
  "Eres real o ciencia ficción.",
  "Encontraste algún bug? reportalo!",
  "Windows XP nunca muere.",
  "¡Huida de emergencia!",
  "Tienes un ratón para mí?",
  "He visto cosas que no creerías...",
  "Miau!",
  "Ay!",
  "Dame dame croquetita.",
  "En realidad yo soy la clave",
  "¿Tienes algo para el hambre?"
];

let speechBubbleTimeout;

function playPetSound() {
    petSound.currentTime = 0;
    petSound.play();
  
    pet.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        pet.style.transform = 'translateY(0)';
    }, 200);

    const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
    speechBubble.textContent = randomPhrase;
    speechBubble.style.display = 'block';

    clearTimeout(speechBubbleTimeout);
    speechBubbleTimeout = setTimeout(() => {
        speechBubble.style.display = 'none';
    }, 3000);
}


function accessEasterEggs() {
    const password = prompt("Introduce la contraseña para acceder a los secretos:");
    if (password === 'SCREAM_BOT') {
        openWindow('eastereggs');
    } else {
        alert('Acceso denegado. Se ha notificado a las autoridades.');
    }
}


const files = {
    'guppy.txt': 'Guppy no era solo un gato, era un destello de luz anaranjada. Se movía por la casa como si el sol mismo hubiera decidido tomar una siesta en el sofá. Su pelo, del color de la mandarina más dulce, brillaba cada vez que los rayos de la tarde se filtraban por la ventana, haciendo que el salón se sintiera un poco más cálido, un poco más alegre. Pero Guppy no era solo un adorno. Su maullido, ese que le valió el sobrenombre de "SCREAM_BOT", era un himno a la vida, una declaración de su presencia que podía escucharse desde cualquier rincón. Era su forma de decir: "Estoy aquí. Y necesito mimos. Y un poco de comida. Y más mimos." Más que una mascota, Guppy era un compañero. Cuando el día era largo y el silencio de la casa pesaba, su suave ronroneo era la melodía que calmaba la mente. Se acurrucaba en tu regazo, una bola de calor y confort, y en esos momentos, no había ruidos, ni preocupaciones, solo la compañía silenciosa y perfecta de ese pequeño ser anaranjado. Él no juzgaba, solo estaba ahí. Era la definición de un amigo. Y en ese pequeño cuerpo, color mandarina, estaba todo lo que se necesitaba para sentirse en casa.',
    'mañana.txt': 'Que ubooo, mi guppypán de cada día, mi peludo iluminado por el sol de las 3 AM, ¡te juro que escuché tus bigotes hablarme anoche! Me dijeron “baskara bas ba bas kara” y yo entendí todo… el universo tiene sentido ahora, pero solo si estás ronroneando sobre mi pecho como alfombra de amor radioactivo. ¿Sabías que eres mitad nube y mitad moco cósmico, Guppy? ¿No? Pues yo sí. Ayer soñé que volabas en una tostadora gigante, escupiendo croquetas con forma de ovni. Y cuando desperté… ¡bam! Ahí estabas, mirándome como si supieras que el sofá es una dimensión paralela gobernada por gatos filósofos. Te amo tanto que te escribiría un poema en idioma murciélago, pero se me enredan las ideas con los calcetines. ¿Tú también odias los lunes, Guppy? ¿O solo finges para hacerme sentir acompañado en esta locura tan rica? Eres el único ser que puede maullar y destruir mi estabilidad emocional en el mismo segundo. Baskara baskarara… ¡que se caigan los techos si no te doy atún en lata por siempre jamás! Miau eterno, mi bicho peludo, mi Guppy celestial. Nos vemos en el pasillo de los sueños donde las cajas son portales y las cortinas, enemigos jurados.',
    'ideas.txt': 'Necesito hacer esa mascota virtual para linux.',
};

function loadFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    for (const fileName in files) {
        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
        fileItem.onclick = () => viewFileContent(fileName);

        const fileIcon = document.createElement('img');
        fileIcon.src = 'images/icon-projects.png';
        fileIcon.alt = 'Icono de texto';

        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = fileName;

        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileNameSpan);
        fileList.appendChild(fileItem);
    }
}

function viewFileContent(fileName) {
    const fileContent = files[fileName];
    const newWindowContent = document.getElementById('notepad-content');
    
    if (newWindowContent) {
        newWindowContent.querySelector('#notepad-title').textContent = fileName;
        newWindowContent.querySelector('#notepad-text').textContent = fileContent;
        openWindow('notepad');
    }
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
    console.log('Arrastre bloqueado');
    return false;
  });
});

document.addEventListener('selectstart', function(e) {
  e.preventDefault();
});


document.addEventListener('DOMContentLoaded', function() {

  document.body.style.userSelect = 'none';
  

  const editableElements = document.querySelectorAll('input, textarea, [contenteditable]');
  editableElements.forEach(el => {
    el.style.userSelect = 'text';
  });
});

function adjustIconGrid() {
  const grid = document.querySelector('.desktop-grid');
  const iconWidth = 80;
  const gap = 20;
  const availableWidth = window.innerWidth - 30; 
  const columns = Math.max(1, Math.floor(availableWidth / (iconWidth + gap)));
  
  grid.style.gridTemplateColumns = `repeat(${columns}, ${iconWidth}px)`;
}

window.addEventListener('resize', adjustIconGrid);
window.addEventListener('load', adjustIconGrid);

document.getElementById('start-button').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('start-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});


document.addEventListener('click', function() {
    document.getElementById('start-menu').style.display = 'none';
});


document.getElementById('start-menu').addEventListener('click', function(e) {
    e.stopPropagation();
});


function logout() {
    if (confirm('¿Estás seguro de que quieres salir?')) {
        document.body.classList.add('shutdown-effect');
        setTimeout(() => {
            alert('Sistema apagado. ¡Hasta pronto!');
        }, 1000);
    }
}
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
}
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function applyWallpaper() {
    const wallpaper = document.getElementById('wallpaper-select').value;
    document.querySelector('.wallpaper').style.backgroundImage = `url('images/${wallpaper}')`;
}

function updatePerformanceMeters() {
    const cpu = Math.min(100, Math.floor(Math.random() * 30) + 20);
    const ram = Math.min(100, Math.floor(Math.random() * 40) + 30);
    const disk = Math.min(100, Math.floor(Math.random() * 50) + 10);
    
    document.getElementById('cpu-meter').style.width = `${cpu}%`;
    document.getElementById('cpu-meter').textContent = `${cpu}%`;
    document.getElementById('ram-meter').style.width = `${ram}%`;
    document.getElementById('ram-meter').textContent = `${ram}%`;
    document.getElementById('disk-meter').style.width = `${disk}%`;
    document.getElementById('disk-meter').textContent = `${disk}%`;
}

setInterval(updatePerformanceMeters, 2000);


function changePassword() {
    alert('Función no implementada\n(Simulación de Windows 95)');
}

function endProcess() {
    alert('Acceso denegado\n¡virus.exe no puede ser terminado!');
}

function applyWallpaper() {
    const selectedWallpaper = document.getElementById('wallpaper-select').value;
    const wallpaperElement = document.querySelector('.wallpaper');
    

    wallpaperElement.style.backgroundImage = `url('images/${selectedWallpaper}')`;

    localStorage.setItem('selectedWallpaper', selectedWallpaper);

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
        document.getElementById('wallpaper-select').value = savedWallpaper;
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    document.getElementById('dark-mode-toggle').checked = isDarkMode;

    document.body.style.transition = 'background 0.5s ease';
}

function loadDarkModePreference() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').checked = true;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
    loadWallpaper();
    

    setInterval(updatePerformanceMeters, 2000);
});
window.addEventListener('load', () => {
    document.getElementById('xp-login').style.display = 'flex';
});


function login(username) {
    const loginScreen = document.getElementById('xp-login');
    loginScreen.style.opacity = '0';
    loginScreen.style.transition = 'opacity 0.5s ease';
    
    new Audio('sounds/windows-login.mp3').play();
    

    setTimeout(() => {
        loginScreen.style.display = 'none';
 
        initDesktop();
    }, 500);
}


function showHelp() {
    alert("Ayuda de Windows XP\n\nSolo haz clic en tu usuario para entrar.");
}

function shutdown() {
    if(confirm('¿Estás seguro de que quieres salir?')) {
        document.body.classList.add('shutdown-effect');
        setTimeout(() => {
            alert('Sistema apagado. ¡Hasta pronto!');
        }, 1000);
    }
}


document.styleSheets[0].insertRule(`
    @keyframes fadeOut {
        to { opacity: 0; }
    }
`, 0);
document.addEventListener('DOMContentLoaded', function() {
    const music = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('music-toggle');
    
    function startMusic() {
  
        toggleBtn.click();
        

        music.volume = 0.3;
        

        setTimeout(() => {
            toggleBtn.remove();
        }, 1000);
    }
    

    function toggleMusic() {
        if (music.paused) {
            music.play().catch(e => console.log("Error al reproducir:", e));
        } else {
            music.pause();
        }
    }
    

    const playPromise = music.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            const musicHint = document.createElement('div');
            musicHint.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 5px;
                    font-family: 'Courier New';
                    font-size: 12px;
                ">
                    Presiona <kbd>M</kbd> para activar la música
                </div>
            `;
            document.body.appendChild(musicHint);
            
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'm') {
                    startMusic();
                    musicHint.remove();
                }
            });
        });
    }
});
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

let paintCanvas, ctx, isDrawing = false, currentColor = 'black', lastX = 0, lastY = 0;

function initPaint() {
    paintCanvas = document.getElementById('paint-canvas');
    if (!paintCanvas) return;
    
    ctx = paintCanvas.getContext('2d');
    
    paintCanvas.width = paintCanvas.offsetWidth;
    paintCanvas.height = paintCanvas.offsetHeight;
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', () => isDrawing = false);
    paintCanvas.addEventListener('mouseout', () => isDrawing = false);

    document.getElementById('clear-canvas-btn').addEventListener('click', clearCanvas);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function clearCanvas() {
    ctx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
}

function changeColor(newColor, element) {
    currentColor = newColor;
    ctx.strokeStyle = currentColor;

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.remove('active');
    });
    element.classList.add('active');
}

let browserHistory = ['home']; 
let browserHistoryIndex = 0;

function openBrowser() {
    const browserWindow = document.getElementById('browser-window');
    browserWindow.style.display = 'flex';
    navigateTo('home'); 
}

function closeBrowser() {
    document.getElementById('browser-window').style.display = 'none';
}

function navigateTo(pageId) {
    
    document.querySelectorAll('.browser-page').forEach(page => {
        page.classList.remove('active');
    });

    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        document.getElementById('address-bar').value = pageId;

        
        if (browserHistory[browserHistoryIndex] !== pageId) {
            
            if (browserHistoryIndex < browserHistory.length - 1) {
                browserHistory = browserHistory.slice(0, browserHistoryIndex + 1);
            }
            browserHistory.push(pageId);
            browserHistoryIndex++;
        }
    } else {
        
        navigateTo('404');
    }
}

function browserGoBack() {
    if (browserHistoryIndex > 0) {
        browserHistoryIndex--;
        const pageId = browserHistory[browserHistoryIndex];
        
        document.querySelectorAll('.browser-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageId}`).classList.add('active');
        document.getElementById('address-bar').value = pageId;
    }
}

function browserGoForward() {
    if (browserHistoryIndex < browserHistory.length - 1) {
        browserHistoryIndex++;
        const pageId = browserHistory[browserHistoryIndex];
        
        document.querySelectorAll('.browser-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageId}`).classList.add('active');
        document.getElementById('address-bar').value = pageId;
    }
}