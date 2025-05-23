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

class RainDrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.speed = 15 + Math.random() * 5;
        this.length = 20 + Math.random() * 30;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height + this.length) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = 1;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 1, this.y + this.length);
        ctx.stroke();
    }
}

class Lightning {
    constructor() {
        this.reset();
    }

    reset() {
        this.active = false;
        this.nextStrike = Math.random() * 10000 + 5000; // Random time between 5-15 seconds
        this.lastUpdate = Date.now();
        this.opacity = 0;
    }

    update() {
        const now = Date.now();
        if (!this.active) {
            if (now - this.lastUpdate > this.nextStrike) {
                this.active = true;
                this.opacity = 0.8;
                this.lastUpdate = now;
                // Play thunder sound after a delay
                setTimeout(() => {
                    const thunder = new Audio('https://assets.mixkit.co/active_storage/sfx/2527/2527.wav');
                    thunder.volume = audio.volume * 0.5; // Half the main volume
                    thunder.play();
                }, 500);
            }
        } else {
            this.opacity -= 0.1;
            if (this.opacity <= 0) {
                this.reset();
            }
        }
    }

    draw() {
        if (this.active) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
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

// Scene initialization and animation
function initializeScene(sceneIndex) {
    animationObjects = [];
    switch(sceneIndex) {
        case 0: // Aquarium
            for(let i = 0; i < 8; i++) {
                animationObjects.push(new Fish());
            }
            break;
        case 1: // Rainy Night
            for(let i = 0; i < 200; i++) {
                animationObjects.push(new RainDrop());
            }
            animationObjects.push(new Lightning());
            break;
        case 2: // Space
            for(let i = 0; i < 200; i++) {
                animationObjects.push(new SpaceParticle());
            }
            break;
        case 3: // Solar System
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
    ctx.fillStyle = SCENES_DATA[currentScene].backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sun for solar system
    if (currentScene === 3) {
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

// Audio control functions
function toggleAudio() {
    try {
        if (isPlaying) {
            audio.pause();
            audioButton.textContent = 'Play Music';
        } else {
            audio.play().catch(e => {
                console.error('Error playing audio:', e);
                statusDiv.textContent = "Error playing audio. Please try again.";
            });
            audioButton.textContent = 'Pause Music';
        }
        isPlaying = !isPlaying;
    } catch (error) {
        console.error('Error toggling audio:', error);
        statusDiv.textContent = 'Error controlling playback. Please try again.';
    }
}

function changeScene() {
    try {
        const wasPlaying = !audio.paused;
        currentScene = parseInt(document.getElementById('sceneSelect').value);
        
        // Update track list for the new scene
        const trackSelect = document.getElementById('trackSelect');
        const currentSceneTracks = SCENES_DATA[currentScene].tracks;
        
        trackSelect.innerHTML = currentSceneTracks.map((track, index) => 
            `<option value="${index}">${track.name}</option>`
        ).join('');
        
        // Update audio source
        const newAudio = new Audio(currentSceneTracks[0].url);
        newAudio.volume = audio.volume;
        newAudio.loop = true;
        
        // Replace the old audio element
        audio.pause();
        audio = newAudio;
        
        if (wasPlaying) {
            audio.play().catch(e => {
                console.error('Error playing audio:', e);
                statusDiv.textContent = "Error playing audio. Please try again.";
            });
        }
        
        // Initialize new scene
        initializeScene(currentScene);
        statusDiv.textContent = `Switched to ${currentSceneTracks[0].name}`;
    } catch (error) {
        console.error('Error changing scene:', error);
        statusDiv.textContent = 'Error changing scene. Please try again.';
    }
}

function changeTrack() {
    try {
        const trackIndex = parseInt(document.getElementById('trackSelect').value);
        const wasPlaying = !audio.paused;
        const currentSceneTracks = SCENES_DATA[currentScene].tracks;
        
        statusDiv.textContent = "Loading audio...";
        audioButton.disabled = true;
        audioButton.textContent = 'Loading...';
        
        const newTrack = currentSceneTracks[trackIndex];
        
        // Create a new Audio element for better reliability
        const newAudio = new Audio(newTrack.url);
        newAudio.volume = audio.volume;
        newAudio.loop = true;
        
        // Replace the old audio element
        audio.pause();
        audio = newAudio;
        
        audio.addEventListener('canplaythrough', () => {
            audioButton.disabled = false;
            audioButton.textContent = wasPlaying ? 'Pause Music' : 'Play Music';
            if (wasPlaying) {
                audio.play().catch(e => {
                    console.error('Error playing audio:', e);
                    statusDiv.textContent = "Error playing audio. Please try again.";
                });
            }
            statusDiv.textContent = `Switched to ${newTrack.name}`;
        });
        
        audio.addEventListener('error', () => {
            console.error('Error loading audio');
            statusDiv.textContent = "Error loading audio. Please try another track.";
            audioButton.disabled = false;
            audioButton.textContent = 'Play Music';
        });
    } catch (error) {
        console.error('Error changing track:', error);
        statusDiv.textContent = 'Error changing track. Please try again.';
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
        const opacity = document.getElementById('opacitySlider').value;
        document.body.style.backgroundColor = `rgba(13, 15, 44, ${opacity})`;
    } catch (error) {
        console.error('Error updating opacity:', error);
        statusDiv.textContent = 'Error adjusting opacity.';
    }
}

// Initialize canvas and start animation
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initializeScene(currentScene);
});

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

// Start the scene
resizeCanvas();
initializeScene(0);
animate();
updateVolume(); 