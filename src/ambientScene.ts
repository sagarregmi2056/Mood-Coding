import * as vscode from 'vscode';
import * as path from 'path';

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
                { name: "Ocean Waves", url: "https://assets.mixkit.co/active_storage/sfx/897/897.wav" },
                { name: "Underwater Ambience", url: "https://assets.mixkit.co/active_storage/sfx/146/146.wav" },
                { name: "Handpan Meditation", url: "https://assets.mixkit.co/active_storage/sfx/2815/2815.wav" }
            ],
            backgroundColor: "rgba(35, 92, 140, 0.3)"
        },
        {
            name: "Rainy Night",
            tracks: [
                { name: "Rain & Thunder", url: "https://assets.mixkit.co/active_storage/sfx/2526/2526.wav" },
                { name: "Gentle Rain", url: "https://assets.mixkit.co/active_storage/sfx/2523/2523.wav" },
                { name: "Night Ambience", url: "https://assets.mixkit.co/active_storage/sfx/2521/2521.wav" }
            ],
            backgroundColor: "rgba(20, 20, 30, 0.4)"
        },
        {
            name: "Space",
            tracks: [
                { name: "Space Ambient", url: "https://assets.mixkit.co/active_storage/sfx/2729/2729.wav" },
                { name: "Cosmic Waves", url: "https://assets.mixkit.co/active_storage/sfx/2730/2730.wav" }
            ],
            backgroundColor: "rgba(13, 15, 44, 0.3)"
        },
        {
            name: "Solar System",
            tracks: [
                { name: "Planetary Motion", url: "https://assets.mixkit.co/active_storage/sfx/2731/2731.wav" },
                { name: "Solar Winds", url: "https://assets.mixkit.co/active_storage/sfx/2732/2732.wav" }
            ],
            backgroundColor: "rgba(25, 29, 71, 0.3)"
        }
    ];

    constructor(private readonly extensionPath: string) {}

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
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.extensionPath, 'src', 'webview'))
                ]
            }
        );

        const htmlContent = this.getWebviewContent();
        this.panel.webview.html = htmlContent;

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private getWebviewContent(): string {
        // Get path to ambient.js
        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this.extensionPath, 'src', 'webview', 'ambient.js')
        );
        const scriptUri = this.panel?.webview.asWebviewUri(scriptPathOnDisk);

        // Serialize scenes data for safe injection into HTML
        const serializedScenes = JSON.stringify(this.scenes)
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        const sceneOptions = this.scenes
            .map((scene, index) => `<option value="${index}">${scene.name}</option>`)
            .join('');

        const trackOptions = this.scenes[0].tracks
            .map((track, index) => `<option value="${index}">${track.name}</option>`)
            .join('');

        return `
<!DOCTYPE html>
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
        }
        .slider-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }
        input[type="range"] {
            width: 100%;
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
            <select id="sceneSelect" onchange="changeScene()">${sceneOptions}</select>
        </div>
        <div class="slider-container">
            <label>Audio Track</label>
            <select id="trackSelect" onchange="changeTrack()">${trackOptions}</select>
        </div>
        <div class="slider-container">
            <label>Volume</label>
            <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5" onchange="updateVolume()">
        </div>
        <div class="slider-container">
            <label>Background Opacity</label>
            <input type="range" id="opacitySlider" min="0.1" max="1" step="0.1" value="0.7" onchange="updateOpacity()">
        </div>
        <button onclick="toggleAudio()" id="audioButton">Play Music</button>
        <div id="status" class="status">Ready to play</div>
    </div>
    <canvas id="canvas"></canvas>
    <audio id="ambientAudio" preload="auto">
        <source src="${this.scenes[0].tracks[0].url}" type="audio/wav">
        Your browser does not support the audio element.
    </audio>
    <script>
        // Initialize global variables
        const SCENES_DATA = JSON.parse('${serializedScenes}');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const audio = document.getElementById('ambientAudio');
        const audioButton = document.getElementById('audioButton');
        const statusDiv = document.getElementById('status');
        let isPlaying = false;
        let currentScene = 0;
        let animationObjects = [];
    </script>
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}