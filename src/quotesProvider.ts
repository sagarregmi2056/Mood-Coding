import * as vscode from 'vscode';

interface Quote {
    content: string;
    author: string;
}

export class QuotesProvider {
    private cachedQuotes: Quote[] = [];
    private readonly CACHE_SIZE = 10;
    private readonly API_URL = 'https://api.quotable.io';
    private currentQuote: string = '';
    
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
        // Initialize with a random quote
        this.currentQuote = this.getRandomQuote();
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

    public async showRandomQuote(): Promise<void> {
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
            this.currentQuote = `"${quote.content}" - ${quote.author}`;
            
            // Show the quote
            await vscode.window.showInformationMessage(this.currentQuote);
        } catch (error) {
            console.error('Error showing quote:', error);
            // Ensure we always show something
            const fallbackQuote = this.fallbackQuotes[
                Math.floor(Math.random() * this.fallbackQuotes.length)
            ];
            this.currentQuote = `"${fallbackQuote.content}" - ${fallbackQuote.author}`;
            await vscode.window.showInformationMessage(this.currentQuote);
        }
    }

    public getCurrentQuote(): string {
        return this.currentQuote || this.getRandomQuote();
    }

    private getRandomQuote(): string {
        const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
        const quote = this.fallbackQuotes[randomIndex];
        return `"${quote.content}" - ${quote.author}`;
    }

    public addQuote(content: string, author: string = "Unknown") {
        const quote: Quote = { content, author };
        if (!this.cachedQuotes.some(q => q.content === content)) {
            this.cachedQuotes.push(quote);
        }
    }
} 