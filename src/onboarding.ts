import * as vscode from 'vscode';

export class OnboardingModal {
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.panel = vscode.window.createWebviewPanel(
            'moodOnboarding',
            'Welcome to Mood Coding! 🎯',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'close':
                        this.panel.dispose();
                        break;
                }
            },
            null,
            context.subscriptions
        );

        // Clean up resources when panel is closed
        this.panel.onDidDispose(
            () => {
                this.dispose();
            },
            null,
            context.subscriptions
        );

        // Add panel disposables to extension subscriptions
        context.subscriptions.push(this.panel);
    }

    private getWebviewContent() {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: var(--vscode-editor-foreground);
                    background: var(--vscode-editor-background);
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    text-align: center;
                }
                .step {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: fadeIn 0.5s ease forwards;
                    margin-bottom: 30px;
                }
                @keyframes fadeIn {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .feature {
                    background: var(--vscode-editor-selectionBackground);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 10px 0;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                .breath-animation {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #4CAF50, #8BC34A);
                    margin: 20px auto;
                    animation: breathe 4s infinite ease-in-out;
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="step" style="animation-delay: 0s">
                    <h1>🎯 Welcome to Code Mood!</h1>
                    <p>Your personal coding companion for a more mindful development experience.</p>
                </div>
                
                <div class="step" style="animation-delay: 0.5s">
                    <h2>✨ Key Features</h2>
                    <div class="feature">
                        <h3>🎨 Mood Themes</h3>
                        <p>Customize your editor based on your current mood</p>
                    </div>
                    <div class="feature">
                        <h3>🎵 Ambient Sounds</h3>
                        <p>Focus-enhancing background music</p>
                    </div>
                    <div class="feature">
                        <h3>💭 Inspirational Quotes</h3>
                        <p>Get motivated with programming wisdom</p>
                    </div>
                </div>

                <div class="step" style="animation-delay: 1s">
                    <h2>🧘 Take a Breath</h2>
                    <div class="breath-animation"></div>
                    <p>Remember to take regular breaks and stay mindful</p>
                </div>

                <div class="step" style="animation-delay: 1.5s">
                    <h2>🚀 Ready to Start?</h2>
                    <p>Press Cmd/Ctrl + Shift + P and type "Mood" to see available commands</p>
                    <button onclick="closeOnboarding()">Let's Begin!</button>
                </div>
            </div>

            <script>
                function closeOnboarding() {
                    vscode.postMessage({ command: 'close' });
                }
                const vscode = acquireVsCodeApi();
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
} 