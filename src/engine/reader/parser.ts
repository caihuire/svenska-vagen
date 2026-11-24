import type { TextToken } from '../../types/index.ts';

const BRACKET_RE = /\[([^\]|]+)\|([^\]]+)\]/g;
const LEADING_PUNCT_RE = /^([.,!?:;"'()[\]«»–—…]+)/;
const TRAILING_PUNCT_RE = /([.,!?:;"'()[\]«»–—…]+)$/;

function tokenizePlainSegment(segment: string): TextToken[] {
  const tokens: TextToken[] = [];
  const words = segment.split(/\s+/).filter(Boolean);

  for (const raw of words) {
    let remaining = raw;
    const leading: string[] = [];
    const trailing: string[] = [];

    let leadMatch = remaining.match(LEADING_PUNCT_RE);
    while (leadMatch) {
      for (const ch of leadMatch[1]) {
        leading.push(ch);
      }
      remaining = remaining.slice(leadMatch[1].length);
      leadMatch = remaining.match(LEADING_PUNCT_RE);
    }

    let trailMatch = remaining.match(TRAILING_PUNCT_RE);
    while (trailMatch && remaining.length > 0) {
      const chars = trailMatch[1].split('');
      trailing.unshift(...chars);
      remaining = remaining.slice(0, -trailMatch[1].length);
      trailMatch = remaining.match(TRAILING_PUNCT_RE);
    }

    for (const ch of leading) {
      tokens.push({ surface: ch, isPunct: true });
    }
    if (remaining) {
      tokens.push({ surface: remaining });
    }
    for (const ch of trailing) {
      tokens.push({ surface: ch, isPunct: true });
    }
  }

  return tokens;
}

function parseTagMeta(meta: string): {
  lexId?: string;
  gloss?: string;
  spanGroup?: string;
} {
  const trimmed = meta.trim();
  if (trimmed.startsWith('gloss:')) {
    return { gloss: trimmed.slice('gloss:'.length).trim() };
  }

  const groupMatch = trimmed.match(/^(g\d+)(?::(.+))?$/);
  if (groupMatch) {
    const spanGroup = groupMatch[1];
    const rest = groupMatch[2]?.trim();
    if (!rest) {
      return { spanGroup };
    }
    if (rest.startsWith('gloss:')) {
      return { spanGroup, gloss: rest.slice('gloss:'.length).trim() };
    }
    return { spanGroup, lexId: rest };
  }

  return { lexId: trimmed };
}

export function parseCulturalMarkup(markup: string): TextToken[][] {
  const rawParagraphs = markup
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const groupMeta = new Map<string, { lexId?: string; gloss?: string }>();
  const paragraphs: TextToken[][] = [];

  for (const para of rawParagraphs) {
    const tokens: TextToken[] = [];
    let lastIndex = 0;
    BRACKET_RE.lastIndex = 0;

    let match = BRACKET_RE.exec(para);
    while (match !== null) {
      if (match.index > lastIndex) {
        tokens.push(...tokenizePlainSegment(para.slice(lastIndex, match.index)));
      }

      const surface = match[1].trim();
      const meta = parseTagMeta(match[2]);
      const token: TextToken = { surface };
      if (meta.spanGroup) token.spanGroup = meta.spanGroup;
      if (meta.lexId) token.lexId = meta.lexId;
      if (meta.gloss) token.gloss = meta.gloss;

      if (meta.spanGroup) {
        const existing = groupMeta.get(meta.spanGroup) ?? {};
        groupMeta.set(meta.spanGroup, {
          lexId: existing.lexId ?? meta.lexId,
          gloss: existing.gloss ?? meta.gloss,
        });
      }

      tokens.push(token);
      lastIndex = match.index + match[0].length;
      match = BRACKET_RE.exec(para);
    }

    if (lastIndex < para.length) {
      tokens.push(...tokenizePlainSegment(para.slice(lastIndex)));
    }

    paragraphs.push(tokens);
  }

  // Resolve shared lexId/gloss across split spanGroup tokens
  for (const tokens of paragraphs) {
    for (const token of tokens) {
      if (!token.spanGroup) continue;
      const shared = groupMeta.get(token.spanGroup);
      if (!shared) continue;
      if (!token.lexId && shared.lexId) {
        token.lexId = shared.lexId;
      }
      if (!token.gloss && shared.gloss) {
        token.gloss = shared.gloss;
      }
    }
  }

  return paragraphs;
}

export function extractSentences(markup: string): string[] {
  const plain = markup
    .replace(BRACKET_RE, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plain) return [];

  const matches = plain.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g);
  if (!matches) return [];
  return matches.map((s) => s.trim()).filter(Boolean);
}
