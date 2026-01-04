import { z } from 'zod';

export const CompactedMatchSchema = z.object({
    championName: z.string(),
    win: z.boolean(),
    kda: z.string(), // "K/D/A"
    goldPerMinute: z.number(),
    csPerMinute: z.number(),
    visionScore: z.number(),
    skillshotsHit: z.number(),
    itemBuild: z.array(z.number()),
    lane: z.string(),
    role: z.string(),
    gameDuration: z.number(),
    // Enriched Data
    combat: z.object({
        damageDealt: z.number(),
        damageTaken: z.number(),
        soloKills: z.number(),
        multiKills: z.number(), // max multikill
    }),
    laning: z.object({
        firstBlood: z.boolean(),
        csAt10: z.number(),
    }),
    objectives: z.object({
        damageToTurrets: z.number(),
        turretKills: z.number(),
        dragonTakedowns: z.number(),
    }),
    vision: z.object({
        wardsPlaced: z.number(),
        wardsKilled: z.number(),
        controlWardsBought: z.number(),
    }),
});

export type CompactedMatch = z.infer<typeof CompactedMatchSchema>;

export const PlayerInfoSchema = z.object({
    gameName: z.string(),
    tagLine: z.string(),
    puuid: z.string(),
});

export type PlayerInfo = z.infer<typeof PlayerInfoSchema>;
