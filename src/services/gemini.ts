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
      
      The matches are provided in chronological order (Index 0 = Most Recent, Index ${matches.length - 1} = Oldest).

      Based on this data, please provide the following:

      1. **Playstyle Ecosystem**:
         *   Analyze the player's core identity (e.g., "Roamer", "Duelist").

      2. **Role & Champion Pool Recommendations**:
         *   Suggest **2 Best Roles** for this player based on their stats.
         *   For *each* role, suggest **3 Champions** (1 Main, 1 Alternative, 1 Autofill/Safe Pick).
         *   Explain why these champions fit their identified playstyle.

      3. **Strategic Strengths & Weaknesses**:
         *   **Strengths**: Highlight 2 major assets (e.g. high vision control, great teamfighting).
         *   **Weaknesses**: Highlight 2 major flaws (e.g. low CS@10, poor objective setups).

      4. **Trend Analysis (5-Match Chunks)**:
         *   Analyze the player's performance in chunks of 5 games (e.g., Matches 1-5, 6-10, etc.).
         *   Identify if they are **Improving**, **Regressing**, or **Stagnating**.
         *   Highlight specific stats that changed between chunks (e.g., "CS/min dropped in the last 5 games").

      5. **Improvement Plan (3-Step Guide)**:
         *   **Laning Phase**: Specific tip for early game (based on 'laning' stats).
         *   **Macro Decision**: Specific tip for mid/late game (based on 'objectives' & 'combat').
         *   **Consistency**: Specific tip to reduce variance (based on trend analysis).

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
