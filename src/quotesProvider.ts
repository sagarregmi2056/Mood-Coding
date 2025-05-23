import * as vscode from 'vscode';

interface Quote {
    content: string;
    author: string;
}

export class QuotesProvider {
    private cachedQuotes: Quote[] = [];
    private readonly CACHE_SIZE = 10;
    private readonly API_URL = 'https://api.quotable.io';
    private quotePanel: vscode.WebviewPanel | undefined;
    
    // Fallback quotes when offline
    private readonly fallbackQuotes: Quote[] = [
        {
            content: "First, solve the problem. Then, write the code.",
            author: "John Johnson"
        },
        {
            content: "Code is like humor. When you have to explain it, it's bad.",
            author: "Cory House"
        },
        {
            content: "Make it work, make it right, make it fast.",
            author: "Kent Beck"
        },
        {
            content: "The best error message is the one that never shows up.",
            author: "Thomas Fuchs"
        },
        {
            content: "Programming isn't about what you know; it's about what you can figure out.",
            author: "Chris Pine"
        },
        {
            content: "The most important property of a program is whether it accomplishes the intention of its user.",
            author: "C.A.R. Hoare"
        },
        {
            content: "Simplicity is the soul of efficiency.",
            author: "Austin Freeman"
        },
        {
            content: "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
            author: "Patrick McKenzie"
        }
    ];

    constructor() {
        // Initialize with fallback quotes
        this.cachedQuotes = [...this.fallbackQuotes];
        // Try to fetch online quotes in the background
        this.refreshQuoteCache().catch(() => {
            console.log('Using fallback quotes due to network issues');
        });
    }

    private async refreshQuoteCache(): Promise<void> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(
                `${this.API_URL}/quotes/random?limit=${this.CACHE_SIZE}&tags=technology,wisdom,philosophy`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }

            const newQuotes = await response.json();
            this.cachedQuotes = newQuotes;
        } catch (error) {
            console.log('Error fetching online quotes, using fallback quotes');
            if (this.cachedQuotes.length === 0) {
                this.cachedQuotes = [...this.fallbackQuotes];
            }
            throw error;
        }
    }

    public async showRandomQuote() {
        try {
            // If cache is running low and we're not using fallback quotes, try to refresh
            if (this.cachedQuotes.length < 3 && this.cachedQuotes !== this.fallbackQuotes) {
                await this.refreshQuoteCache().catch(() => {
                    this.cachedQuotes = [...this.fallbackQuotes];
                });
            }

            // Get a random quote
            const randomIndex = Math.floor(Math.random() * this.cachedQuotes.length);
            const quote = this.cachedQuotes[randomIndex];

            // Create and show webview panel
            this.quotePanel = vscode.window.createWebviewPanel(
                'codeMoodQuote',
                'Code Mood - Daily Quote',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: false
                }
            );

            // Set the content
            this.quotePanel.webview.html = this.getQuoteWebviewContent(quote);

            // Auto-close after 5 seconds
            setTimeout(() => {
                if (this.quotePanel) {
                    this.quotePanel.dispose();
                }
            }, 5000);

            // Clean up
            this.quotePanel.onDidDispose(() => {
                this.quotePanel = undefined;
            });

        } catch (error) {
            console.error('Error showing quote:', error);
            // Ensure we always show something
            const fallbackQuote = this.fallbackQuotes[
                Math.floor(Math.random() * this.fallbackQuotes.length)
            ];
            
            vscode.window.showInformationMessage(
                `"${fallbackQuote.content}" - ${fallbackQuote.author}`
            );
        }
    }

    private getQuoteWebviewContent(quote: Quote): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .quote {
                    font-size: 24px;
                    margin-bottom: 20px;
                    line-height: 1.4;
                    max-width: 800px;
                }
                .author {
                    font-size: 18px;
                    color: var(--vscode-textLink-foreground);
                }
                .timer {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    font-size: 14px;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div class="timer">Closing in <span id="countdown">5</span>s</div>
            <div class="quote">"${quote.content}"</div>
            <div class="author">- ${quote.author}</div>
            <script>
                let timeLeft = 5;
                const countdownElement = document.getElementById('countdown');
                
                const timer = setInterval(() => {
                    timeLeft--;
                    countdownElement.textContent = timeLeft;
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                    }
                }, 1000);
            </script>
        </body>
        </html>`;
    }

    public addQuote(content: string, author: string = "Unknown") {
        const quote: Quote = { content, author };
        if (!this.cachedQuotes.some(q => q.content === content)) {
            this.cachedQuotes.push(quote);
        }
    }
} 