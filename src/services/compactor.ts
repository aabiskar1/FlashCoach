import { RiotAPITypes } from '@fightmegg/riot-api';
import { CompactedMatch } from '../utils/types.js';

export class CompactorService {
    compactMatch(match: RiotAPITypes.MatchV5.MatchDTO, puuid: string): CompactedMatch | null {
        const participant = match.info.participants.find((p) => p.puuid === puuid);

        if (!participant) {
            console.warn(`Player with PUUID ${puuid} not found in match ${match.metadata.matchId}`);
            return null;
        }

        const durationMinutes = match.info.gameDuration / 60;

        // Safety check for challenges, as it might be missing in older matches or some game modes
        const challenges = participant.challenges || {};

        return {
            championName: participant.championName,
            win: participant.win,
            kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
            goldPerMinute: parseFloat((participant.goldEarned / durationMinutes).toFixed(2)),
            csPerMinute: parseFloat(((participant.totalMinionsKilled + participant.neutralMinionsKilled) / durationMinutes).toFixed(2)),
            visionScore: participant.visionScore,
            skillshotsHit: challenges.skillshotsHit || 0,
            itemBuild: [
                participant.item0,
                participant.item1,
                participant.item2,
                participant.item3,
                participant.item4,
                participant.item5,
                participant.item6,
            ],
            lane: participant.lane,
            role: participant.role,
            gameDuration: parseFloat(durationMinutes.toFixed(2)),
        };
    }
}
