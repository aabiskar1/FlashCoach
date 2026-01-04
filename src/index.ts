import dotenv from 'dotenv';
import fs from 'fs/promises';
import readline from 'readline';
import { RiotService } from './services/riot.js';
import { CompactorService } from './services/compactor.js';
import { GeminiService } from './services/gemini.js';
import { PlatformId } from '@fightmegg/riot-api';

dotenv.config();

const riotApiKey = process.env.RIOT_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!riotApiKey || !geminiApiKey) {
    console.error('Error: RIOT_API_KEY and GEMINI_API_KEY must be set in .env file');
    process.exit(1);
}

const riotService = new RiotService(riotApiKey);
const compactorService = new CompactorService();
const geminiService = new GeminiService(geminiApiKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log('--- Flash Coach (Powered by Gemini) ---');

    try {
        const gameName = await askQuestion('Enter your Riot Game Name (e.g. MyName): ');
        const tagLine = await askQuestion('Enter your Riot Tag Line (e.g. NA1): ');
        const regionInput = await askQuestion('Enter your Region (Americas, Europe, Asia): ');

        let region = PlatformId.AMERICAS;
        const r = regionInput.trim().toLowerCase();
        if (r === 'europe' || r === 'euw' || r === 'eun') region = PlatformId.EUROPE;
        else if (r === 'asia' || r === 'kr') region = PlatformId.ASIA;
        else if (r === 'sea') region = PlatformId.SEA;

        console.log(`\nFetching data for ${gameName}#${tagLine} in ${region}...`);
        const player = await riotService.getPlayerPuuid(gameName, tagLine, region);
        console.log(`Found PUUID: ${player.puuid}`);

        console.log('Fetching last 30 matches...');
        const matchIds = await riotService.getLastMatches(player.puuid, region, 30);

        console.log(`Found ${matchIds.length} matches. Processing details...`);

        const compactMatches = [];
        for (const matchId of matchIds) {
            // Add a small delay to avoid rate limits if necessary, though riot-api might handle it
            // console.log(`Fetching ${matchId}...`);
            const matchDetails = await riotService.getMatchDetails(matchId, region);
            const compacted = compactorService.compactMatch(matchDetails, player.puuid);
            if (compacted) {
                compactMatches.push(compacted);
            }
        }

        console.log(`Successfully processed ${compactMatches.length} matches.`);
        console.log('\nAnalyzing with Gemini AI... (This may take a moment)\n');

        await geminiService.init();

        const coachingAdvice = await geminiService.analyzePerformance(compactMatches);

        console.log('--- COACHING REPORT ---');
        console.log(coachingAdvice);
        console.log('-----------------------');

        // Export to Markdown
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `reports/${gameName}_${timestamp}.md`;

        const reportContent = `# Flash Coach Report: ${gameName}#${tagLine}\n\n**Date**: ${new Date().toLocaleString()}\n**Region**: ${region}\n\n${coachingAdvice}`;

        try {
            await fs.mkdir('reports', { recursive: true });
            await fs.writeFile(filename, reportContent);
            console.log(`\n✅ Report saved to: ${filename}`);
        } catch (err) {
            console.error('Failed to save report to file:', err);
        }

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close();
    }
}

main();
