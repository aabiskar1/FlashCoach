import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api';
import { PlayerInfo } from '../utils/types.js';

export class RiotService {
    private api: RiotAPI;

    constructor(apiKey: string) {
        this.api = new RiotAPI(apiKey);
    }

    async getPlayerPuuid(gameName: string, tagLine: string, region: PlatformId): Promise<PlayerInfo> {
        try {
            const account = await this.api.account.getByRiotId({
                region: region as any,
                gameName,
                tagLine,
            });
            return {
                gameName: account.gameName || '',
                tagLine: account.tagLine || '',
                puuid: account.puuid,
            };
        } catch (error) {
            console.error('Error fetching player account:', error);
            throw new Error('Failed to resolve player. Check GameName and TagLine.');
        }
    }

    async getLastMatches(puuid: string, region: PlatformId, count: number = 10): Promise<string[]> {
        try {
            const matches = await this.api.matchV5.getIdsByPuuid({
                cluster: region as any, // matchV5 uses 'cluster' but accepts PlatformId like AMERICAS/EUROPE
                puuid,
                params: {
                    start: 0,
                    count,
                },
            });
            return matches;
        } catch (error) {
            console.error('Error fetching match IDs:', error);
            throw new Error('Failed to fetch match history.');
        }
    }

    async getMatchDetails(matchId: string, region: PlatformId): Promise<RiotAPITypes.MatchV5.MatchDTO> {
        try {
            const match = await this.api.matchV5.getMatchById({
                cluster: region as any,
                matchId,
            });
            return match;
        } catch (error) {
            console.error(`Error fetching match details for ${matchId}:`, error);
            throw error;
        }
    }
}
