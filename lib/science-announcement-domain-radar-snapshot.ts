import {
  labFromModelName,
  modelLabColor,
  MODEL_STROKE_PATTERNS,
} from '@/components/charts/model-colors';

export type AnnouncementDomainRadarDatum = {
  id: string;
  label: {
    model: string;
    agent: string;
    full: string;
  };
  scores: Record<string, number>;
  color: string;
  strokeDasharray?: string;
};

/**
 * Domain resolution rates for the announcement radar (Opus 5 vs Sol).
 *
 * Exported from Harbor Hub on August 26, 2026.
 */
export const SCIENCE_ANNOUNCEMENT_DOMAIN_RADAR_SNAPSHOT: AnnouncementDomainRadarDatum[] =
  [
    {
      id: 'opus-5-claude-code',
      label: {
        model: 'Opus 5',
        agent: 'Claude Code',
        full: 'Opus 5 (Claude Code)',
      },
      scores: {
        life: 29.8,
        physical: 27.5,
        earth: 45.8,
        mathematical: 25.5,
        engineering: 29.6,
      },
      color: modelLabColor(labFromModelName('Opus 5')),
      strokeDasharray: MODEL_STROKE_PATTERNS[0],
    },
    {
      id: 'gpt-5.6-sol-codex',
      label: {
        model: 'GPT-5.6 Sol',
        agent: 'Codex',
        full: 'GPT-5.6 Sol (Codex)',
      },
      scores: {
        life: 17.5,
        physical: 23.5,
        earth: 20.8,
        mathematical: 31.4,
        engineering: 14.8,
      },
      color: modelLabColor(labFromModelName('GPT-5.6 Sol')),
      strokeDasharray: MODEL_STROKE_PATTERNS[0],
    },
  ];
