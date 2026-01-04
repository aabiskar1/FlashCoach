import { GoogleGenerativeAI } from '@google/generative-ai';
import { CompactedMatch } from '../utils/types.js';

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async init() {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (!response.ok) {
                // Not throwing here to allow fallback
                console.warn(`Failed to list models: ${response.statusText}. Using default.`);
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                return;
            }
            const data = await response.json();
            const models = (data as any).models || [];

            const flashModels = models
                .filter((m: any) => m.name.includes('flash') && m.supportedGenerationMethods?.includes('generateContent'))
                .sort((a: any, b: any) => b.name.localeCompare(a.name));

            if (flashModels.length > 0) {
                const bestModelName = flashModels[0].name.replace('models/', '');
                console.log(`Using Gemini Mode: ${bestModelName}`);
                this.model = this.genAI.getGenerativeModel({ model: bestModelName });
            } else {
                console.warn('No Flash models found. Defaulting to gemini-1.5-flash');
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            }
        } catch (error) {
            console.error('Error selecting model:', error);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    async analyzePerformance(matches: CompactedMatch[]): Promise<string> {
        const prompt = `
      You are an expert League of Legends coach. I will provide you with data from the last ${matches.length} matches of a player.
      
      Here is the match data:
      ${JSON.stringify(matches, null, 2)}

      Based on this data, please provide the following:
      1. **Playstyle Profile**: Analyze the player's mechanical performance and playstyle patterns (e.g., "Aggressive Lane Bully", "Passive Scaler", "Roamer").
      2. **Champion Recommendations**: Suggest 2 champions they should learn next that fit their proven skill level and playstyle. Explain why.
      3. **Improvement Tip**: Give one specific, actionable "educational" tip to improve their consistency based on the provided stats (e.g. low CS, high deaths, low vision score).

      Format your response clearly with headings.
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error querying Gemini:', error);
            throw new Error('Failed to generate coaching advice.');
        }
    }
}
