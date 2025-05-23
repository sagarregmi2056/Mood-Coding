import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface MoodState {
    mood: string;
    quote: string;
}

export class ShareManager {
    private panel: vscode.WebviewPanel | undefined;
    private readonly MARKETPLACE_URL = 'https://marketplace.visualstudio.com/items?itemName=sagarregmi.mood-coding';
    private readonly GITHUB_URL = 'https://github.com/sagarregmi2056/Mood-Coding';

    constructor() {}

    async captureAndShareMood(context: vscode.ExtensionContext) {
        try {
            // Get current mood state
            const moodState = await vscode.commands.executeCommand('moodCoding.getCurrentMood') as MoodState;
            const quote = await vscode.commands.executeCommand('moodCoding.getCurrentQuote') as string;
            
            // Create webview panel for screenshot
            this.panel = vscode.window.createWebviewPanel(
                'moodShare',
                'Share Your Mood',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Set webview content
            this.panel.webview.html = this.getSharePanelContent(moodState.mood, quote);

            // Handle messages from webview
            this.panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'share':
                            const imageDataUrl = message.imageData;
                            const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
                            const imageBuffer = Buffer.from(base64Data, 'base64');

                            // Generate share text
                            const shareText = this.generateShareText(moodState.mood, quote);
                            const encodedText = encodeURIComponent(shareText);
                            const encodedUrl = encodeURIComponent(this.MARKETPLACE_URL);

                            const shareOptions = [
                                {
                                    label: '$(file) Save Image',
                                    id: 'save',
                                    description: 'Save mood card as PNG'
                                },
                                {
                                    label: '$(clippy) Copy as Markdown',
                                    id: 'copy-md',
                                    description: 'Copy as formatted markdown with badge'
                                },
                                {
                                    label: '$(twitter) Share to Twitter',
                                    id: 'twitter',
                                    description: 'Share mood and quote on Twitter'
                                },
                                {
                                    label: '$(link) Share to LinkedIn',
                                    id: 'linkedin',
                                    description: 'Share on LinkedIn with custom message'
                                },
                                {
                                    label: '$(comment-discussion) Share to Facebook',
                                    id: 'facebook',
                                    description: 'Share on Facebook'
                                },
                                {
                                    label: '$(repo) Create GitHub Gist',
                                    id: 'github',
                                    description: 'Share as a GitHub Gist'
                                }
                            ];

                            const shareOption = await vscode.window.showQuickPick(shareOptions, {
                                placeHolder: 'Choose how to share your mood'
                            });

                            if (!shareOption) return;

                            // Save temp file for image-based sharing
                            const tempPath = path.join(context.extensionPath, 'mood-share.png');
                            fs.writeFileSync(tempPath, imageBuffer);

                            switch (shareOption.id) {
                                case 'save':
                                    const saveLocation = await vscode.window.showSaveDialog({
                                        defaultUri: vscode.Uri.file('mood-share.png'),
                                        filters: { 'Images': ['png'] }
                                    });
                                    if (saveLocation) {
                                        fs.copyFileSync(tempPath, saveLocation.fsPath);
                                        vscode.window.showInformationMessage('Mood card saved! 🎨');
                                    }
                                    break;

                                case 'copy-md':
                                    const markdownText = this.generateMarkdownShare(moodState.mood, quote);
                                    await vscode.env.clipboard.writeText(markdownText);
                                    vscode.window.showInformationMessage('Markdown copied to clipboard! 📋');
                                    break;

                                case 'twitter':
                                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=VSCode,MoodCoding,Programming`;
                                    vscode.env.openExternal(vscode.Uri.parse(twitterUrl));
                                    break;

                                case 'linkedin':
                                    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
                                    vscode.env.openExternal(vscode.Uri.parse(linkedinUrl));
                                    break;

                                case 'facebook':
                                    vscode.window.showInformationMessage('To share on Facebook:', 'Copy Text', 'Open Facebook').then(selection => {
                                        if (selection === 'Copy Text') {
                                            vscode.env.clipboard.writeText(shareText);
                                            vscode.window.showInformationMessage('Share text copied! Now you can paste it on Facebook 📘');
                                        } else if (selection === 'Open Facebook') {
                                            vscode.env.openExternal(vscode.Uri.parse('https://www.facebook.com'));
                                        }
                                    });
                                    break;

                                case 'github':
                                    const gistContent = this.generateGistContent(moodState.mood, quote);
                                    const gistUrl = `https://gist.github.com/new?filename=mood-coding.md&value=${encodeURIComponent(gistContent)}`;
                                    vscode.env.openExternal(vscode.Uri.parse(gistUrl));
                                    break;
                            }

                            // Cleanup temp file
                            fs.unlinkSync(tempPath);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to share mood: ${error.message}`);
        }
    }

    private generateShareText(mood: string, quote: string): string {
        return `🎯 Current Coding Mood: ${this.getMoodEmoji(mood)}\n\n${quote}\n\nCoding with Mood Coding - The mindful VS Code extension`;
    }

    private generateMarkdownShare(mood: string, quote: string): string {
        return `## My Coding Mood ${this.getMoodEmoji(mood)}\n\n> ${quote}\n\n` +
               `[![Powered by Mood Coding](https://img.shields.io/badge/Powered%20by-Mood%20Coding%20🎯-blueviolet)](${this.GITHUB_URL})\n\n` +
               `*Shared via [Mood Coding](${this.MARKETPLACE_URL}) - The mindful VS Code extension*`;
    }

    private generateGistContent(mood: string, quote: string): string {
        return `# Mood Coding Share ${this.getMoodEmoji(mood)}\n\n` +
               `> ${quote}\n\n` +
               `## About\n\n` +
               `This mood was captured using [Mood Coding](${this.MARKETPLACE_URL}), ` +
               `a VS Code extension that helps developers stay mindful and productive.\n\n` +
               `## Current Mood\n\n` +
               `${mood.charAt(0).toUpperCase() + mood.slice(1)} ${this.getMoodEmoji(mood)}\n\n` +
               `---\n\n` +
               `[![Powered by Mood Coding](https://img.shields.io/badge/Powered%20by-Mood%20Coding%20🎯-blueviolet)](${this.GITHUB_URL})`;
    }

    private getSharePanelContent(mood: string, quote: string): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    font-family: 'Segoe UI', sans-serif;
                    background: var(--vscode-editor-background);
                }
                #capture {
                    padding: 20px;
                    background: ${this.getMoodBackground(mood)};
                    color: white;
                    border-radius: 8px;
                    width: 600px;
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .mood-emoji {
                    font-size: 48px;
                    margin: 20px 0;
                }
                .quote {
                    font-style: italic;
                    margin: 20px;
                    font-size: 1.2em;
                    line-height: 1.4;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    opacity: 0.8;
                }
                #shareBtn {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 20px;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                #shareBtn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div id="capture">
                <h2 style="margin: 0;">My Coding Mood</h2>
                <div class="mood-emoji">${this.getMoodEmoji(mood)}</div>
                <p class="quote">"${quote}"</p>
                <div class="footer">Generated with Code Mood 🎯</div>
            </div>
            <button id="shareBtn">Share This Mood</button>

            <script>
                const vscode = acquireVsCodeApi();
                const captureElement = document.getElementById('capture');
                const shareBtn = document.getElementById('shareBtn');

                shareBtn.addEventListener('click', async () => {
                    try {
                        // Use html2canvas from CDN
                        const script = document.createElement('script');
                        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                        script.onload = async () => {
                            const canvas = await html2canvas(captureElement, {
                                backgroundColor: null,
                                scale: 2
                            });
                            const imageData = canvas.toDataURL('image/png');
                            vscode.postMessage({ 
                                command: 'share',
                                imageData: imageData
                            });
                        };
                        document.head.appendChild(script);
                    } catch (error) {
                        console.error('Failed to capture screenshot:', error);
                    }
                });
            </script>
        </body>
        </html>`;
    }

    private getMoodEmoji(mood: string): string {
        const moodEmojis: { [key: string]: string } = {
            'focused': '🎯',
            'energetic': '⚡',
            'calm': '🧘',
            'creative': '🎨',
            'productive': '🚀'
        };
        return moodEmojis[mood] || '🎯';
    }

    private getMoodBackground(mood: string): string {
        const moodColors: { [key: string]: string } = {
            'focused': 'linear-gradient(45deg, #2196F3, #21CBF3)',
            'energetic': 'linear-gradient(45deg, #FF4081, #FF9100)',
            'calm': 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            'creative': 'linear-gradient(45deg, #9C27B0, #E91E63)',
            'productive': 'linear-gradient(45deg, #FF5722, #FFC107)'
        };
        return moodColors[mood] || 'linear-gradient(45deg, #2196F3, #21CBF3)';
    }
} 