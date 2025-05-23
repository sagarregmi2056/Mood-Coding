import * as vscode from 'vscode';

export class MusicPlayer {
    private panel: vscode.WebviewPanel | undefined;
    private readonly lofiTracks = [
        {
            name: "Peaceful Lofi",
            url: "https://dl.dropboxusercontent.com/s/37te89k4db35sth/peaceful-lofi.mp3"
        },
        {
            name: "Ocean Waves",
            url: "https://dl.dropboxusercontent.com/s/qtxfwe95svktmxj/ocean-waves.mp3"
        }
    ];

    constructor() {}

    public toggleMusicPanel() {
        if (this.panel) {
            this.panel.dispose();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'codeMoodMusic',
            'Code Mood - Ambient Aquarium',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
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
                    background-color: rgba(30, 30, 30, 0.7);
                    color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: Arial, sans-serif;
                }
                #aquarium {
                    border: 2px solid #235c8c;
                    border-radius: 10px;
                    margin: 20px 0;
                    background: linear-gradient(180deg, #235c8c 0%, #1e4c73 100%);
                }
                .controls {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 20px 0;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 15px;
                    border-radius: 8px;
                }
                button {
                    padding: 8px 16px;
                    background: #0e639c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                button:hover {
                    background: #1177bb;
                }
                .slider-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                input[type="range"] {
                    width: 150px;
                }
                select {
                    padding: 8px;
                    background: #0e639c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="controls">
                <select id="trackSelect" onchange="changeTrack()">
                    ${this.lofiTracks.map((track, index) => 
                        `<option value="${index}">${track.name}</option>`
                    ).join('')}
                </select>
                <div class="slider-container">
                    <label>Volume:</label>
                    <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5" onchange="updateVolume()">
                </div>
                <div class="slider-container">
                    <label>Opacity:</label>
                    <input type="range" id="opacitySlider" min="0.1" max="1" step="0.1" value="0.7" onchange="updateOpacity()">
                </div>
                <button onclick="toggleAudio()" id="audioButton">Play Music</button>
            </div>
            <canvas id="aquarium" width="600" height="400"></canvas>
            <audio id="ambientAudio" loop>
                <source src="${this.lofiTracks[0].url}" type="audio/mp3">
            </audio>
            <script>
                const canvas = document.getElementById('aquarium');
                const ctx = canvas.getContext('2d');
                const audio = document.getElementById('ambientAudio');
                const audioButton = document.getElementById('audioButton');
                let isPlaying = false;

                class Fish {
                    constructor(type) {
                        this.type = type;
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
                        const colors = [
                            '#FF6B6B', '#4ECDC4', '#45B7D1',
                            '#96CEB4', '#FFEEAD', '#D4A5A5'
                        ];
                        return colors[Math.floor(Math.random() * colors.length)];
                    }

                    update() {
                        this.x += this.speed * this.direction;
                        
                        // Smooth vertical movement
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
                        
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        
                        if (this.type === 'tropical') {
                            // Tropical fish shape
                            ctx.moveTo(0, 0);
                            ctx.quadraticCurveTo(this.size, -this.size/2, this.size*2, 0);
                            ctx.quadraticCurveTo(this.size, this.size/2, 0, 0);
                            ctx.moveTo(this.size*1.5, -this.size/3);
                            ctx.lineTo(this.size*1.8, 0);
                            ctx.lineTo(this.size*1.5, this.size/3);
                        } else {
                            // Standard fish shape
                            ctx.moveTo(0, 0);
                            ctx.quadraticCurveTo(this.size, -this.size/2, this.size*1.5, 0);
                            ctx.quadraticCurveTo(this.size, this.size/2, 0, 0);
                        }
                        
                        ctx.fill();
                        ctx.restore();
                    }
                }

                class Bubble {
                    constructor() {
                        this.reset();
                    }

                    reset() {
                        this.x = Math.random() * canvas.width;
                        this.y = canvas.height + 10;
                        this.size = 2 + Math.random() * 6;
                        this.speed = 1 + Math.random() * 2;
                    }

                    update() {
                        this.y -= this.speed;
                        this.x += Math.sin(this.y / 30) * 0.5;

                        if (this.y < -10) {
                            this.reset();
                        }
                    }

                    draw() {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.fill();
                    }
                }

                // Create fish and bubbles
                const fishes = [
                    ...Array(5).fill().map(() => new Fish('standard')),
                    ...Array(3).fill().map(() => new Fish('tropical'))
                ];
                const bubbles = Array(20).fill().map(() => new Bubble());

                function drawPlants() {
                    const plants = [
                        { x: 50, width: 30, height: 100 },
                        { x: 150, width: 20, height: 80 },
                        { x: canvas.width - 100, width: 25, height: 90 },
                        { x: canvas.width - 200, width: 30, height: 110 }
                    ];

                    plants.forEach(plant => {
                        ctx.beginPath();
                        ctx.moveTo(plant.x, canvas.height);
                        
                        // Draw wavy plant
                        for (let y = 0; y < plant.height; y += 5) {
                            const waveOffset = Math.sin(Date.now() / 1000 + y / 20) * 5;
                            ctx.quadraticCurveTo(
                                plant.x + waveOffset,
                                canvas.height - y - 2.5,
                                plant.x,
                                canvas.height - y - 5
                            );
                        }
                        
                        ctx.strokeStyle = '#3a9c35';
                        ctx.lineWidth = plant.width;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    });
                }

                function animate() {
                    ctx.fillStyle = 'rgba(35, 92, 140, 0.3)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    drawPlants();

                    bubbles.forEach(bubble => {
                        bubble.update();
                        bubble.draw();
                    });

                    fishes.forEach(fish => {
                        fish.update();
                        fish.draw();
                    });

                    requestAnimationFrame(animate);
                }

                function toggleAudio() {
                    if (isPlaying) {
                        audio.pause();
                        audioButton.textContent = 'Play Music';
                    } else {
                        audio.play();
                        audioButton.textContent = 'Pause Music';
                    }
                    isPlaying = !isPlaying;
                }

                function updateVolume() {
                    audio.volume = document.getElementById('volumeSlider').value;
                }

                function updateOpacity() {
                    document.body.style.backgroundColor = 
                        \`rgba(30, 30, 30, \${document.getElementById('opacitySlider').value})\`;
                }

                function changeTrack() {
                    const trackIndex = document.getElementById('trackSelect').value;
                    const wasPlaying = !audio.paused;
                    audio.src = '${this.lofiTracks.map(t => t.url).join("','")}'.split(',')[trackIndex];
                    if (wasPlaying) {
                        audio.play();
                    }
                }

                // Start animation
                animate();

                // Set initial volume
                updateVolume();
            </script>
        </body>
        </html>`;
    }
} 