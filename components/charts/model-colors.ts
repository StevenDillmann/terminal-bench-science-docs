/**
 * Shared per-lab colors and per-model stroke patterns, so the domain radar and
 * the announcement slope chart paint the same model the same way.
 */

export const RADAR_COLORS = [
  '#038f99',
  '#6d5bd0',
  '#c45825',
  '#2e7d4f',
  '#b04a78',
  '#3c75b5',
  '#8a6b16',
  '#8b4f9e',
] as const;

/** Distinguishes models from the same lab; index is the model's order within its lab. */
export const MODEL_STROKE_PATTERNS = [
  undefined,
  '10 5',
  '2 4',
  '12 4 2 4',
] as const;

export function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/** Color for a lab, keyed by the lab's domain (e.g. "anthropic.com"). */
export function modelLabColor(lab: string): string {
  if (lab.includes('anthropic.com')) return '#9e997b';
  if (lab.includes('openai.com')) {
    return 'color-mix(in oklch, var(--foreground) 88%, var(--background))';
  }
  if (lab === 'x.ai' || lab.endsWith('.x.ai')) return '#895e4d';
  if (lab.includes('moonshot.ai')) return '#9e4589';
  if (lab === 'z.ai' || lab.endsWith('.z.ai')) return '#909a16';
  return RADAR_COLORS[hashString(lab) % RADAR_COLORS.length]!;
}

/**
 * Lab domain inferred from a model's display name, for charts whose data has no
 * `model_org` link (e.g. static announcement snapshots).
 */
export function labFromModelName(model: string): string {
  const name = model.toLowerCase();
  if (/\b(opus|sonnet|haiku|fable|claude)\b/.test(name)) return 'anthropic.com';
  if (/\bgpt\b|\bgpt-/.test(name) || name.startsWith('o1') || name.startsWith('o3'))
    return 'openai.com';
  if (name.includes('grok')) return 'x.ai';
  if (name.includes('kimi')) return 'moonshot.ai';
  if (name.includes('glm')) return 'z.ai';
  if (name.includes('gemini')) return 'google.com';
  return name;
}
