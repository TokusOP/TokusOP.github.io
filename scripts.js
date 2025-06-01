
function openWindow(windowId) {
    const windowContent = document.getElementById('window-content');
    const template = document.getElementById(`${windowId}-content`);
    
    if (template) {
        windowContent.innerHTML = template.innerHTML;
        document.getElementById('window-title').textContent = 
            windowId === 'home' ? 'Inicio' : 
            windowId === 'projects' ? 'Proyectos' : 'Contacto';
        
        const mainWindow = document.getElementById('main-window');
        mainWindow.style.display = 'flex';
    }
}


function closeWindow() {
    document.getElementById('main-window').style.display = 'none';
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
    isPaused = !isPaused;
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
    const desktop = document.querySelector('.desktop');
    const isDarkMode = body.classList.toggle('dark-mode');
    

    if (isDarkMode) {
        desktop.style.backgroundImage = "url('images/background-dark.jpg')";
        localStorage.setItem('darkMode', 'enabled');
    } else {
        desktop.style.backgroundImage = "url('images/background.jpg')";
        localStorage.setItem('darkMode', 'disabled');
    }
}


function checkDarkModePreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const localStoragePref = localStorage.getItem('darkMode');
    
    if (localStoragePref === 'enabled' || (localStoragePref === null && prefersDark)) {
        document.body.classList.add('dark-mode');
        document.querySelector('.desktop').style.backgroundImage = "url('images/background-dark.jpg')";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkDarkModePreference();
});

let terminalHistory = [];
let historyIndex = 0;
let secretMode = false;


const commands = {
    help: {
        description: "Muestra esta ayuda",
        execute: () => {
            let output = "Comandos disponibles:<br>";
            for (const cmd in commands) {
                output += `• ${cmd} - ${commands[cmd].description}<br>`;
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
        execute: () => {
            return "IDDQD<br>IDKFA<br>¡Doom mode activado! Pero esto es solo simulado... por ahora.";
        }
    },
    matrix: {
        hidden: true,
        execute: () => {
            startMatrixEffect();
            return "¡Bienvenido a la Matrix!";
        }
    },
    sudo: {
        hidden: true,
        execute: () => {
            return "¡Permiso denegado! (GETOUT!)";
        }
    },
    acnh: {
        hidden: true,
        execute: () => {
            return "Ejecutando Animal Crossing New Horizons...  ";
        }
    },
    makecoffee: {
        hidden: true,
        execute: () => {
            return "Error: No hay dispositivo de café conectado. ¿Quieres un café virtual? ☕";
        }
    }
};


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
        historyIndex = terminalHistory.length;
        

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
        if (historyIndex > 0) {
            historyIndex--;
            document.getElementById('terminal-input').value = terminalHistory[historyIndex];
        }
    }
    else if (event.key === "ArrowDown") {
        if (historyIndex < terminalHistory.length - 1) {
            historyIndex++;
            document.getElementById('terminal-input').value = terminalHistory[historyIndex];
        } else {
            historyIndex = terminalHistory.length;
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
        title: "yume 2kki - lotus waters",
        src: "music/yume 2kki-lotus waters.mp3" 
    },
    { 
        title: "C418 - Dog",
        src: "music/C418-Dog.mp3" 
    },
    { 
        title: "Eternal.Temp - Graham Kartna",
        src: "music/Eternal.Temp-GrahamKartna.mp3" 
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

    document.body.style.pointerEvents = "none";
    

    const glitch = document.createElement("div");
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
    

    const errorSound = new Audio("null");
    errorSound.loop = true;
    errorSound.play();
    
   
    setInterval(() => {
        const elements = document.querySelectorAll("*");
        elements.forEach(el => {
            el.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
        });
    }, 50);
}
let damage = 0;
setInterval(() => {
    damage += Math.random() * 10;
    errorMsg.innerHTML += `\nSistema dañado: ${Math.floor(damage)}%`;
}, 500);

const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a", "Enter"];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
    if (e.key === konamiCode[konamiIndex]) {
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

function playPetSound() {
  petSound.currentTime = 0;
  petSound.play();
  
  pet.style.transform = 'translateY(-20px)';
  setTimeout(() => {
    pet.style.transform = 'translateY(0)';
  }, 200);
}

function movePet() {
  const x = Math.random() * (window.innerWidth - 100);
  const y = Math.random() * (window.innerHeight - 100);
  
  pet.style.left = `${x}px`;
  pet.style.top = `${y}px`;
  

  if (x > parseInt(pet.style.left || 0)) {
    pet.querySelector('img').style.transform = 'scaleX(1)';
  } else {
    pet.querySelector('img').style.transform = 'scaleX(-1)';
  }
}

setInterval(() => {
    if (isDragging) return;
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    pet.style.transition = "left 2s, top 2s";
    pet.style.left = `${x}px`;
    pet.style.top = `${y}px`;
}, 10000);

let isDragging = false;
pet.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    pet.style.left = `${e.clientX - 32}px`;
    pet.style.top = `${e.clientY - 32}px`;
  }
});    
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