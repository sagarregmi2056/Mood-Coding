import * as vscode from 'vscode';

export class BreakReminder {
    private timer: NodeJS.Timeout | undefined;
    private panel: vscode.WebviewPanel | undefined;
    private readonly breakInterval: number = 30; // minutes
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public start() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        // Convert minutes to milliseconds
        const interval = this.breakInterval * 60 * 1000;
        
        this.timer = setInterval(() => {
            this.showBreakReminder();
        }, interval);

        vscode.window.showInformationMessage(`Break reminder set for every ${this.breakInterval} minutes`);
    }

    public stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        if (this.panel) {
            this.panel.dispose();
        }
        vscode.window.showInformationMessage('Break reminders stopped');
    }

    private showBreakReminder() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'breakReminder',
            'Time for a Break! 🧘',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getBreakReminderContent();

        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            this.context.subscriptions
        );

        // Auto-close after 2 minutes
        setTimeout(() => {
            if (this.panel) {
                this.panel.dispose();
            }
        }, 120000);
    }

    private getBreakReminderContent() {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    color: var(--vscode-editor-foreground);
                    background: var(--vscode-editor-background);
                }
                .container {
                    text-align: center;
                }
                .breath-circle {
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #4CAF50, #8BC34A);
                    margin: 20px auto;
                    animation: breathe 8s infinite cubic-bezier(0.5, 0, 0.5, 1);
                    position: relative;
                }
                .breath-text {
                    position: absolute;
                    width: 100%;
                    text-align: center;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 1.2em;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                }
                @keyframes breathe {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    25% { 
                        transform: scale(1.3);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 1;
                    }
                    75% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                }
                .tips {
                    margin-top: 30px;
                    padding: 15px;
                    background: var(--vscode-editor-selectionBackground);
                    border-radius: 8px;
                    max-width: 400px;
                }
                .tip {
                    margin: 10px 0;
                    opacity: 0;
                    animation: fadeIn 0.5s forwards;
                }
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Time for a Mindful Break 🧘</h1>
                <p>Follow the circle to practice deep breathing</p>
                
                <div class="breath-circle">
                    <div class="breath-text">Breathe</div>
                </div>

                <div class="tips">
                    <div class="tip" style="animation-delay: 0.5s">
                        🪑 Stand up and stretch
                    </div>
                    <div class="tip" style="animation-delay: 1s">
                        👀 Look away from the screen (20-20-20 rule)
                    </div>
                    <div class="tip" style="animation-delay: 1.5s">
                        💧 Take a sip of water
                    </div>
                    <div class="tip" style="animation-delay: 2s">
                        🚶 Take a short walk if possible
                    </div>
                </div>
            </div>

            <script>
                let breathText = document.querySelector('.breath-text');
                setInterval(() => {
                    breathText.textContent = 'Inhale';
                    setTimeout(() => {
                        breathText.textContent = 'Hold';
                    }, 2000);
                    setTimeout(() => {
                        breathText.textContent = 'Exhale';
                    }, 4000);
                    setTimeout(() => {
                        breathText.textContent = 'Rest';
                    }, 6000);
                }, 8000);
            </script>
        </body>
        </html>`;
    }
} 