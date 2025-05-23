import * as vscode from 'vscode';

export type Mood = 'focus' | 'chill' | 'creative' | 'debug';

interface MoodTheme {
    darkTheme: string;
}

export class MoodManager {
    private static readonly MOOD_KEY = 'codeMood.currentMood';
    private currentMood: Mood = 'focus';
    private moodThemes: Record<Mood, MoodTheme> = {
        focus: {
            darkTheme: 'Dark+ (default dark)'
        },
        chill: {
            darkTheme: 'One Dark Pro'
        },
        creative: {
            darkTheme: 'Monokai'
        },
        debug: {
            darkTheme: 'GitHub Dark'
        }
    };

    constructor(private context: vscode.ExtensionContext) {
        this.currentMood = context.globalState.get(MoodManager.MOOD_KEY, 'focus');
        this.setupTheme();
    }

    private setupTheme() {
        // Update theme immediately
        this.updateTheme();
    }

    private async updateTheme() {
        try {
            const theme = this.moodThemes[this.currentMood];
            const targetTheme = theme.darkTheme;

            // Get the current theme
            const config = vscode.workspace.getConfiguration();
            const currentTheme = config.get('workbench.colorTheme');

            // Only update if the theme is different
            if (currentTheme !== targetTheme) {
                await config.update('workbench.colorTheme', targetTheme, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Theme updated to: ${targetTheme}`);
            }
        } catch (error) {
            console.error('Error updating theme:', error);
            vscode.window.showErrorMessage('Failed to update theme. Please try again.');
        }
    }

    public async toggleMood() {
        try {
            const moods: Mood[] = ['focus', 'chill', 'creative', 'debug'];
            
            // Show mood selection dialog
            const items: vscode.QuickPickItem[] = moods.map(mood => ({
                label: mood === this.currentMood ? `✓ ${mood}` : mood,
                description: mood === this.currentMood ? 'Current mood' : '',
                detail: this.getMoodDescription(mood)
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select your coding mood',
                ignoreFocusOut: true
            });

            if (selected) {
                const selectedMood = selected.label.replace('✓ ', '') as Mood;
                if (selectedMood !== this.currentMood) {
                    this.currentMood = selectedMood;
                    await this.context.globalState.update(MoodManager.MOOD_KEY, this.currentMood);
                    await this.updateTheme();
                }
            }
        } catch (error) {
            console.error('Error toggling mood:', error);
            vscode.window.showErrorMessage('Failed to toggle mood. Please try again.');
        }
    }

    private getMoodDescription(mood: Mood): string {
        const descriptions: Record<Mood, string> = {
            focus: 'Default VS Code dark theme for distraction-free coding',
            chill: 'One Dark Pro theme for relaxed coding sessions',
            creative: 'Vibrant Monokai theme to boost creativity',
            debug: 'High contrast GitHub Dark theme for debugging'
        };
        return descriptions[mood];
    }

    public getCurrentMood(): Mood {
        return this.currentMood;
    }
} 