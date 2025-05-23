import * as vscode from 'vscode';

interface Track {
    name: string;
    url: string;
}

interface Scene {
    name: string;
    tracks: Track[];
    backgroundColor: string;
}

export class AmbientScene {
    private panel: vscode.WebviewPanel | undefined;
    private readonly scenes: Scene[] = [
        {
            name: "Aquarium",
            tracks: [
                { name: "Ocean Waves", url: "https://www.soundjay.com/nature/ocean-wave-1.mp3" },
                { name: "Underwater Ambience", url: "https://www.soundjay.com/nature/underwater-bubbles-1.mp3" }
            ],
            backgroundColor: "rgba(35, 92, 140, 0.3)"
        },
        {
            name: "Space",
            tracks: [
                { name: "Space Ambient", url: "https://www.soundjay.com/ambient/ambient-1.mp3" },
                { name: "Cosmic Waves", url: "https://www.soundjay.com/ambient/ambient-2.mp3" }
            ],
            backgroundColor: "rgba(13, 15, 44, 0.3)"
        },
        {
            name: "Solar System",
            tracks: [
                { name: "Planetary Motion", url: "https://www.soundjay.com/ambient/ambient-3.mp3" },
                { name: "Solar Winds", url: "https://www.soundjay.com/ambient/ambient-4.mp3" }
            ],
            backgroundColor: "rgba(25, 29, 71, 0.3)"
        }
    ];

    constructor() {}

    public togglePanel() {
        if (this.panel) {
            this.panel.dispose();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'codeMoodAmbient',
            'Code Mood - Ambient Scene',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: []
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    background-color: rgba(13, 15, 44, 0.7);
                    color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: Arial, sans-serif;
                    height: 100vh;
                    overflow: hidden;
                }
                #canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                .controls {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin: 20px 0;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 20px;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    min-width: 300px;
                }
                select, button {
                    padding: 12px 20px;
                    background: #0e639c;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 14px;
                    width: 100%;
                }
                select:hover, button:hover {
                    background: #1177bb;
                    transform: translateY(-1px);
                }
                select:active, button:active {
                    transform: translateY(1px);
                }
                .slider-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                }
                .slider-container label {
                    font-size: 14px;
                    color: #ccc;
                }
                input[type="range"] {
                    width: 100%;
                    height: 6px;
                    -webkit-appearance: none;
                    background: #0e639c;
                    border-radius: 3px;
                    outline: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    background: #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .status {
                    font-size: 12px;
                    color: #aaa;
                    text-align: center;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="controls">
                <div class="slider-container">
                    <label>Scene Selection</label>
                    <select id="sceneSelect" onchange="changeScene()">
                        ${this.scenes.map((scene, index) => 
                            `<option value="${index}">${scene.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="slider-container">
                    <label>Audio Track</label>
                    <select id="trackSelect" onchange="changeTrack()">
                        ${this.scenes[0].tracks.map((track, index) => 
                            `<option value="${index}">${track.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="slider-container">
                    <label>Volume</label>
                    <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5" onchange="updateVolume()">
                </div>

                <div class="slider-container">
                    <label>Background Opacity</label>
                    <input type="range" id="opacitySlider" min="0.1" max="1" step="0.1" value="0.7" onchange="updateOpacity()">
                </div>

                <button onclick="toggleAudio()" id="audioButton" disabled>Loading...</button>
                <div id="status" class="status">Initializing audio...</div>
            </div>
            <canvas id="canvas"></canvas>
            <audio id="ambientAudio" preload="auto">
                <source src="${this.scenes[0].tracks[0].url}" type="audio/mp3">
                Your browser does not support the audio element.
            </audio>
            <script>
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                const audio = document.getElementById('ambientAudio');
                const audioButton = document.getElementById('audioButton');
                const statusDiv = document.getElementById('status');
                let isPlaying = false;
                let currentScene = 0;
                let animationObjects = [];

                // Audio setup and error handling
                audio.addEventListener('canplaythrough', () => {
                    audioButton.disabled = false;
                    audioButton.textContent = 'Play Music';
                    statusDiv.textContent = 'Ready to play';
                });

                audio.addEventListener('error', (e) => {
                    console.error('Audio error:', e.target.error);
                    statusDiv.textContent = 'Error loading audio. Please try another track.';
                    audioButton.disabled = true;
                });

                audio.addEventListener('playing', () => {
                    statusDiv.textContent = 'Playing music';
                });

                audio.addEventListener('pause', () => {
                    statusDiv.textContent = 'Music paused';
                });

                // Resize canvas to fill window
                function resizeCanvas() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();

                // Animation classes
                class Fish {
                    constructor() {
                        this.reset();
                        this.y = Math.random() * (canvas.height - 100) + 50;
                        this.size = 15 + Math.random() * 20;
                        this.color = this.getRandomColor();
                    }

                    reset() {
                        this.speed = 1 + Math.random() * 2;
                        if (Math.random() > 0.5) {
                            this.x = -50;
                            this.direction = 1;
                        } else {
                            this.x = canvas.width + 50;
                            this.direction = -1;
                        }
                    }

                    getRandomColor() {
                        const colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#88D8B0'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    }

                    update() {
                        this.x += this.speed * this.direction;
                        this.y += Math.sin(this.x / 50) * 0.5;
                        if ((this.direction === 1 && this.x > canvas.width + 50) ||
                            (this.direction === -1 && this.x < -50)) {
                            this.reset();
                        }
                    }

                    draw() {
                        ctx.save();
                        ctx.translate(this.x, this.y);
                        ctx.scale(this.direction, 1);
                        
                        // Draw fish body
                        ctx.beginPath();
                        ctx.fillStyle = this.color;
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(this.size, -this.size/2, this.size*1.5, 0);
                        ctx.quadraticCurveTo(this.size, this.size/2, 0, 0);
                        ctx.fill();
                        
                        // Draw tail
                        ctx.beginPath();
                        ctx.moveTo(-this.size/4, 0);
                        ctx.lineTo(-this.size/2, -this.size/2);
                        ctx.lineTo(-this.size/2, this.size/2);
                        ctx.closePath();
                        ctx.fill();
                        
                        // Draw eye
                        ctx.beginPath();
                        ctx.fillStyle = '#000';
                        ctx.arc(this.size/2, -this.size/6, this.size/10, 0, Math.PI * 2);
                        ctx.fill();
                        
                        ctx.restore();
                    }
                }

                class SpaceParticle {
                    constructor() {
                        this.reset();
                    }

                    reset() {
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.size = Math.random() * 2;
                        this.speed = 0.1 + Math.random() * 0.5;
                        this.brightness = Math.random();
                        this.color = this.getRandomColor();
                    }

                    getRandomColor() {
                        const colors = ['#ffffff', '#ffe4e1', '#f0ffff', '#f5f5dc'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    }

                    update() {
                        this.y -= this.speed;
                        if (this.y < 0) {
                            this.y = canvas.height;
                            this.x = Math.random() * canvas.width;
                        }
                        this.brightness = Math.sin(Date.now() / 1000) * 0.2 + 0.8;
                    }

                    draw() {
                        ctx.beginPath();
                        ctx.fillStyle = this.color;
                        ctx.globalAlpha = this.brightness;
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }

                class Planet {
                    constructor(orbitRadius, size, color, speed, name) {
                        this.orbitRadius = orbitRadius;
                        this.size = size;
                        this.color = color;
                        this.speed = speed;
                        this.angle = Math.random() * Math.PI * 2;
                        this.name = name;
                        this.moons = [];
                        
                        // Add moons based on planet size
                        if (size > 8) {
                            const moonCount = Math.floor(Math.random() * 3) + 1;
                            for (let i = 0; i < moonCount; i++) {
                                this.moons.push({
                                    radius: size * 2 + Math.random() * size,
                                    size: size * 0.2,
                                    speed: 0.02 + Math.random() * 0.02,
                                    angle: Math.random() * Math.PI * 2,
                                    color: '#aaa'
                                });
                            }
                        }
                    }

                    update() {
                        this.angle += this.speed;
                        this.x = canvas.width/2 + Math.cos(this.angle) * this.orbitRadius;
                        this.y = canvas.height/2 + Math.sin(this.angle) * this.orbitRadius;

                        this.moons.forEach(moon => {
                            moon.angle += moon.speed;
                        });
                    }

                    draw() {
                        // Draw orbit
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        ctx.arc(canvas.width/2, canvas.height/2, this.orbitRadius, 0, Math.PI * 2);
                        ctx.stroke();

                        // Draw planet
                        ctx.beginPath();
                        ctx.fillStyle = this.color;
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fill();

                        // Draw planet name
                        ctx.fillStyle = '#fff';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(this.name, this.x, this.y - this.size - 5);

                        // Draw moons and their orbits
                        this.moons.forEach(moon => {
                            // Draw moon orbit
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                            ctx.arc(this.x, this.y, moon.radius, 0, Math.PI * 2);
                            ctx.stroke();

                            // Draw moon
                            const moonX = this.x + Math.cos(moon.angle) * moon.radius;
                            const moonY = this.y + Math.sin(moon.angle) * moon.radius;
                            ctx.beginPath();
                            ctx.fillStyle = moon.color;
                            ctx.arc(moonX, moonY, moon.size, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                }

                function initializeScene(sceneIndex) {
                    animationObjects = [];
                    switch(sceneIndex) {
                        case 0: // Aquarium
                            for(let i = 0; i < 8; i++) {
                                animationObjects.push(new Fish());
                            }
                            break;
                        case 1: // Space
                            for(let i = 0; i < 200; i++) {
                                animationObjects.push(new SpaceParticle());
                            }
                            break;
                        case 2: // Solar System
                            const planets = [
                                { name: 'Mercury', radius: 50, size: 5, color: '#A0522D', speed: 0.008 },
                                { name: 'Venus', radius: 80, size: 8, color: '#DEB887', speed: 0.007 },
                                { name: 'Earth', radius: 110, size: 9, color: '#4169E1', speed: 0.006 },
                                { name: 'Mars', radius: 140, size: 7, color: '#CD5C5C', speed: 0.005 },
                                { name: 'Jupiter', radius: 180, size: 15, color: '#DAA520', speed: 0.004 },
                                { name: 'Saturn', radius: 220, size: 14, color: '#F4A460', speed: 0.003 },
                                { name: 'Uranus', radius: 260, size: 11, color: '#87CEEB', speed: 0.002 },
                                { name: 'Neptune', radius: 300, size: 11, color: '#4682B4', speed: 0.001 }
                            ];
                            
                            planets.forEach(p => {
                                animationObjects.push(new Planet(p.radius, p.size, p.color, p.speed, p.name));
                            });
                            break;
                    }
                }

                function animate() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw scene background
                    const scenes = ${JSON.stringify(this.scenes)};
                    ctx.fillStyle = scenes[currentScene].backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw sun for solar system
                    if (currentScene === 2) {
                        ctx.beginPath();
                        ctx.fillStyle = '#FFD700';
                        ctx.arc(canvas.width/2, canvas.height/2, 20, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Add sun glow
                        const gradient = ctx.createRadialGradient(
                            canvas.width/2, canvas.height/2, 20,
                            canvas.width/2, canvas.height/2, 40
                        );
                        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
                        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                        ctx.fillStyle = gradient;
                        ctx.arc(canvas.width/2, canvas.height/2, 40, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Update and draw all objects
                    animationObjects.forEach(obj => {
                        obj.update();
                        obj.draw();
                    });

                    requestAnimationFrame(animate);
                }

                function changeScene() {
                    try {
                        const wasPlaying = !audio.paused;
                        currentScene = parseInt(document.getElementById('sceneSelect').value);
                        
                        // Update track list for the new scene
                        const trackSelect = document.getElementById('trackSelect');
                        const tracks = ${JSON.stringify(this.scenes.map(s => s.tracks))};
                        const currentSceneTracks = tracks[currentScene];
                        
                        trackSelect.innerHTML = currentSceneTracks.map((track, index) => 
                            \`<option value="\${index}">\${track.name}</option>\`
                        ).join('');
                        
                        // Update audio source
                        audio.src = currentSceneTracks[0].url;
                        audio.load();
                        
                        if (wasPlaying) {
                            const playPromise = audio.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(e => {
                                    console.error('Error playing audio:', e);
                                    statusDiv.textContent = "Error playing audio. Please try again.";
                                });
                            }
                        }
                        
                        // Initialize new scene
                        initializeScene(currentScene);
                        statusDiv.textContent = \`Switched to \${tracks[currentScene][0].name}\`;
                    } catch (error) {
                        console.error('Error changing scene:', error);
                        statusDiv.textContent = 'Error changing scene. Please try again.';
                    }
                }

                function changeTrack() {
                    try {
                        const trackIndex = document.getElementById('trackSelect').value;
                        const wasPlaying = !audio.paused;
                        const tracks = ${JSON.stringify(this.scenes.map(s => s.tracks))};
                        
                        statusDiv.textContent = "Loading audio...";
                        audioButton.disabled = true;
                        audioButton.textContent = 'Loading...';
                        
                        const newTrack = tracks[currentScene][trackIndex];
                        audio.src = newTrack.url;
                        audio.load();
                        
                        if (wasPlaying) {
                            const playPromise = audio.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(e => {
                                    console.error('Error playing audio:', e);
                                    statusDiv.textContent = "Error playing audio. Please try again.";
                                    audioButton.textContent = 'Play Music';
                                });
                            }
                        }
                        
                        statusDiv.textContent = \`Switched to \${newTrack.name}\`;
                    } catch (error) {
                        console.error('Error changing track:', error);
                        statusDiv.textContent = 'Error changing track. Please try again.';
                    }
                }

                function toggleAudio() {
                    try {
                        if (isPlaying) {
                            audio.pause();
                            audioButton.textContent = 'Play Music';
                        } else {
                            const playPromise = audio.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(e => {
                                    console.error('Error playing audio:', e);
                                    statusDiv.textContent = "Error playing audio. Please try again.";
                                });
                            }
                            audioButton.textContent = 'Pause Music';
                        }
                        isPlaying = !isPlaying;
                    } catch (error) {
                        console.error('Error toggling audio:', error);
                        statusDiv.textContent = 'Error controlling playback. Please try again.';
                    }
                }

                function updateVolume() {
                    try {
                        audio.volume = document.getElementById('volumeSlider').value;
                    } catch (error) {
                        console.error('Error updating volume:', error);
                        statusDiv.textContent = 'Error adjusting volume.';
                    }
                }

                function updateOpacity() {
                    try {
                        document.body.style.backgroundColor = 
                            \`rgba(13, 15, 44, \${document.getElementById('opacitySlider').value})\`;
                    } catch (error) {
                        console.error('Error updating opacity:', error);
                        statusDiv.textContent = 'Error adjusting opacity.';
                    }
                }

                // Initialize first scene and start animation
                initializeScene(0);
                animate();
                updateVolume();

                // Handle window resize
                window.addEventListener('resize', () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    initializeScene(currentScene);
                });
            </script>
        </body>
        </html>`;
    }
}