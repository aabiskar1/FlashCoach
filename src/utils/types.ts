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
    gameDuration: z.number(), // in minutes
});

export type CompactedMatch = z.infer<typeof CompactedMatchSchema>;

export const PlayerInfoSchema = z.object({
    gameName: z.string(),
    tagLine: z.string(),
    puuid: z.string(),
});

export type PlayerInfo = z.infer<typeof PlayerInfoSchema>;
