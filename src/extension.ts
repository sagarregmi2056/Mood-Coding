import * as vscode from 'vscode';
import { MoodManager } from './moodManager';
import { QuotesProvider } from './quotesProvider';
import { AmbientScene } from './ambientScene';
import { ShareManager } from './shareManager';
import { OnboardingModal } from './onboarding';
import { BreakReminder } from './breakReminder';

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

    // Initialize features
    const shareManager = new ShareManager();
    const breakReminder = new BreakReminder(context);
    
    // Show onboarding on first install
    const hasShownOnboarding = context.globalState.get('moodCoding.hasShownOnboarding');
    if (!hasShownOnboarding) {
        new OnboardingModal(context);
        context.globalState.update('moodCoding.hasShownOnboarding', true);
    }

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

    // Add commands to get current mood and quote
    const getCurrentMoodCommand = vscode.commands.registerCommand('moodCoding.getCurrentMood', () => {
        try {
            return {
                mood: moodManager.getCurrentMood(),
                quote: quotesProvider.getCurrentQuote()
            };
        } catch (error) {
            console.error('Error getting current mood:', error);
            throw error;
        }
    });

    const getCurrentQuoteCommand = vscode.commands.registerCommand('moodCoding.getCurrentQuote', () => {
        try {
            return quotesProvider.getCurrentQuote();
        } catch (error) {
            console.error('Error getting current quote:', error);
            throw error;
        }
    });

    // Register all commands
    let disposables = [
        toggleMoodCommand,
        showQuoteCommand,
        toggleAmbientCommand,

        // Share mood command
        vscode.commands.registerCommand('moodCoding.shareMood', () => {
            shareManager.captureAndShareMood(context);
        }),

        // Break reminder commands
        vscode.commands.registerCommand('moodCoding.startBreakReminder', () => {
            breakReminder.start();
        }),

        vscode.commands.registerCommand('moodCoding.stopBreakReminder', () => {
            breakReminder.stop();
        }),

        // Show onboarding command (can be triggered manually)
        vscode.commands.registerCommand('moodCoding.showOnboarding', () => {
            new OnboardingModal(context);
        }),

        // Create GitHub issue command
        vscode.commands.registerCommand('moodCoding.createGitHubIssue', async () => {
            const title = await vscode.window.showInputBox({
                prompt: 'Enter issue title',
                placeHolder: 'Feature request: ...'
            });

            if (!title) return;

            const description = await vscode.window.showInputBox({
                prompt: 'Enter issue description',
                placeHolder: 'Describe your suggestion or report a bug...'
            });

            if (!description) return;

            const issueUrl = `https://github.com/yourusername/Code-Mood/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}`;
            vscode.env.openExternal(vscode.Uri.parse(issueUrl));
        }),

        getCurrentMoodCommand,
        getCurrentQuoteCommand
    ];

    context.subscriptions.push(...disposables);

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