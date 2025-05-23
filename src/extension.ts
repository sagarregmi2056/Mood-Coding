import * as vscode from 'vscode';
import { MoodManager } from './moodManager';
import { QuotesProvider } from './quotesProvider';
import { AmbientScene } from './ambientScene';

// Store instances globally so they persist between command invocations
let moodManager: MoodManager;
let quotesProvider: QuotesProvider;
let ambientScene: AmbientScene;

export function activate(context: vscode.ExtensionContext) {
    console.log('Code Mood extension is now active!');

    // Initialize components
    moodManager = new MoodManager(context);
    quotesProvider = new QuotesProvider();
    ambientScene = new AmbientScene();

    // Register commands with proper error handling
    const toggleMoodCommand = vscode.commands.registerCommand('code-mood.toggleMood', async () => {
        try {
            await moodManager.toggleMood();
        } catch (error) {
            console.error('Error toggling mood:', error);
            vscode.window.showErrorMessage('Failed to toggle mood. Please try again.');
        }
    });

    const showQuoteCommand = vscode.commands.registerCommand('code-mood.showQuote', async () => {
        try {
            await quotesProvider.showRandomQuote();
        } catch (error) {
            console.error('Error showing quote:', error);
            vscode.window.showErrorMessage('Failed to show quote. Please try again.');
        }
    });

    const toggleAmbientCommand = vscode.commands.registerCommand('code-mood.toggleAmbient', () => {
        try {
            ambientScene.togglePanel();
        } catch (error) {
            console.error('Error toggling ambient scene:', error);
            vscode.window.showErrorMessage('Failed to toggle ambient scene. Please try again.');
        }
    });

    // Register all commands
    context.subscriptions.push(toggleMoodCommand);
    context.subscriptions.push(showQuoteCommand);
    context.subscriptions.push(toggleAmbientCommand);

    // Show initial quote
    quotesProvider.showRandomQuote().catch(error => {
        console.error('Error showing initial quote:', error);
    });
}

export function deactivate() {
    // Clean up resources
    if (ambientScene) {
        try {
            ambientScene.togglePanel();
        } catch (error) {
            console.error('Error cleaning up ambient scene:', error);
        }
    }
} 