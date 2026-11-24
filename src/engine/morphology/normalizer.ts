export interface TypedAnswerResult {
  status: 'exact' | 'diacritic-retry' | 'wrong';
  matched?: string;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?…,:;]+$/g, '')
    .trim();
}

function foldSwedishDiacritics(value: string): string {
  return value
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e');
}

export function evaluateTypedAnswer(
  input: string,
  accepted: string[]
): TypedAnswerResult {
  const normInput = normalizeText(input);
  if (!normInput) {
    const emptyAccepted = accepted.find((candidate) => normalizeText(candidate) === '');
    if (emptyAccepted !== undefined) {
      return { status: 'exact', matched: emptyAccepted };
    }
    return { status: 'wrong' };
  }

  for (const candidate of accepted) {
    if (normInput === normalizeText(candidate)) {
      return { status: 'exact', matched: candidate };
    }
  }

  const foldedInput = foldSwedishDiacritics(normInput);
  for (const candidate of accepted) {
    const normCandidate = normalizeText(candidate);
    if (normCandidate && foldedInput === foldSwedishDiacritics(normCandidate)) {
      return { status: 'diacritic-retry', matched: candidate };
    }
  }

  return { status: 'wrong' };
}
