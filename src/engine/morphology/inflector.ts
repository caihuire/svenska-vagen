import type { LexiconEntry } from '../../types/index.ts';

const VOWEL_RE = /[aeiouyåäöé]$/i;
const POLY_EL_EN_ER_RE = /[aeiouyåäö][^aeiouyåäö]+e([lnr])$/i;
const POLY_EL_ER_RE = /[aeiouyåäö][^aeiouyåäö]+e([lr])$/i;
const POLY_EN_RE = /[aeiouyåäö][^aeiouyåäö]+en$/i;

function dropUnstressedElEnEr(stem: string): string {
  if (!POLY_EL_EN_ER_RE.test(stem)) {
    return stem;
  }
  const dropped = stem.replace(/e([lnr])$/i, '$1');
  return dropped.replace(/mm([lnr])$/i, 'm$1');
}

function dropUnstressedElEr(stem: string): string {
  if (!POLY_EL_ER_RE.test(stem)) {
    return stem;
  }
  const dropped = stem.replace(/e([lr])$/i, '$1');
  return dropped.replace(/mm([lr])$/i, 'm$1');
}

function deriveDefSg(indefSg: string, gender: 'en' | 'ett'): string {
  if (!indefSg) return '';
  if (gender === 'en') {
    if (VOWEL_RE.test(indefSg)) {
      return `${indefSg}n`;
    }
    if (POLY_EL_ER_RE.test(indefSg)) {
      return `${indefSg}n`;
    }
    if (POLY_EN_RE.test(indefSg)) {
      return `${dropUnstressedElEnEr(indefSg)}en`;
    }
    return `${indefSg}en`;
  }

  // ett-noun
  if (/[iée]$/i.test(indefSg) && !/e$/i.test(indefSg)) {
    return `${indefSg}et`;
  }
  if (VOWEL_RE.test(indefSg)) {
    const hasEarlierVowel = /[aeiouyåäö][^aeiouyåäö]+[aeou]$/i.test(indefSg);
    return hasEarlierVowel ? `${indefSg}t` : `${indefSg}et`;
  }
  if (POLY_EL_EN_ER_RE.test(indefSg)) {
    return `${dropUnstressedElEnEr(indefSg)}et`;
  }
  return `${indefSg}et`;
}

function deriveDefPlFromIndefPl(indefPl: string, gender: 'en' | 'ett'): string {
  if (!indefPl) return '';
  if (/(?:or|ar|er|r)$/i.test(indefPl)) {
    return `${indefPl}na`;
  }
  if (gender === 'ett' && /n$/i.test(indefPl) && /[aeiouyåäö]n$/i.test(indefPl)) {
    return `${indefPl}a`;
  }
  return `${indefPl}en`;
}

export function inflectNoun(entry: LexiconEntry): {
  indefSg: string;
  defSg: string;
  indefPl: string;
  defPl: string;
} {
  if (entry.morph?.pos !== 'noun') {
    throw new Error(`Expected noun morph for lexicon entry "${entry.id}"`);
  }

  const { gender, declension, forms = {} } = entry.morph;

  if (declension === 'pl') {
    const indefPl = forms.indefPl ?? entry.lemma;
    const defPl = forms.defPl ?? deriveDefPlFromIndefPl(indefPl, gender);
    return {
      indefSg: forms.indefSg ?? '',
      defSg: forms.defSg ?? '',
      indefPl,
      defPl,
    };
  }

  const indefSg = forms.indefSg ?? entry.lemma;
  const defSg = forms.defSg ?? deriveDefSg(indefSg, gender);

  if (declension === 'uncount') {
    return {
      indefSg,
      defSg,
      indefPl: forms.indefPl ?? '',
      defPl: forms.defPl ?? '',
    };
  }

  let indefPl = forms.indefPl;
  if (indefPl === undefined) {
    switch (declension) {
      case 1:
        indefPl = indefSg.replace(/a$/i, '') + 'or';
        break;
      case 2:
        if (/e$/i.test(indefSg)) {
          indefPl = indefSg.slice(0, -1) + 'ar';
        } else if (/a$/i.test(indefSg)) {
          indefPl = indefSg.slice(0, -1) + 'ar';
        } else if (POLY_EL_EN_ER_RE.test(indefSg)) {
          indefPl = dropUnstressedElEnEr(indefSg) + 'ar';
        } else {
          indefPl = `${indefSg}ar`;
        }
        break;
      case 3:
        if (/e$/i.test(indefSg)) {
          indefPl = `${indefSg}r`;
        } else if (POLY_EL_ER_RE.test(indefSg)) {
          indefPl = dropUnstressedElEr(indefSg) + 'er';
        } else {
          indefPl = `${indefSg}er`;
        }
        break;
      case 4:
        indefPl = `${indefSg}r`;
        break;
      case 5:
        indefPl = `${indefSg}n`;
        break;
      case 6:
        indefPl = indefSg;
        break;
      case 7:
        indefPl = /s$/i.test(indefSg) ? indefSg : `${indefSg}s`;
        break;
      case 'irreg':
        indefPl = indefSg;
        break;
    }
  }

  let defPl = forms.defPl;
  if (defPl === undefined) {
    switch (declension) {
      case 1:
      case 2:
      case 3:
      case 4:
        defPl = `${indefPl}na`;
        break;
      case 5:
        defPl = `${indefPl}a`;
        break;
      case 6:
        if (gender === 'en') {
          if (/are$/i.test(indefPl)) {
            defPl = `${indefPl.slice(0, -1)}na`;
          } else {
            defPl = `${indefPl}na`;
          }
        } else if (POLY_EL_EN_ER_RE.test(indefPl)) {
          defPl = `${dropUnstressedElEnEr(indefPl)}en`;
        } else {
          defPl = `${indefPl}en`;
        }
        break;
      case 7:
        defPl = `${indefPl}en`;
        break;
      case 'irreg':
        defPl = deriveDefPlFromIndefPl(indefPl, gender);
        break;
    }
  }

  return { indefSg, defSg, indefPl, defPl };
}

function stripVerbParticleAndReflexive(
  lemma: string,
  particle?: string,
  reflexive?: boolean
): { baseInf: string; suffix: string } {
  let working = lemma.trim();
  const suffixes: string[] = [];

  if (particle) {
    const pToken = ` ${particle}`;
    if (working.endsWith(pToken)) {
      working = working.slice(0, -pToken.length);
    }
    suffixes.push(pToken);
  }

  if (reflexive) {
    if (working.endsWith(' sig')) {
      working = working.slice(0, -4);
    }
    suffixes.unshift(' sig');
  }

  return { baseInf: working, suffix: suffixes.join('') };
}

function simplifyStem2a(stem: string): string {
  if (/mm$/i.test(stem)) {
    return stem.slice(0, -1);
  }
  return stem;
}

export function inflectVerb(entry: LexiconEntry): {
  inf: string;
  imp: string;
  pres: string;
  past: string;
  supine: string;
  pastPart?: string;
} {
  if (entry.morph?.pos !== 'verb') {
    throw new Error(`Expected verb morph for lexicon entry "${entry.id}"`);
  }

  const { group, particle, deponent, reflexive, forms = {} } = entry.morph;
  const { baseInf, suffix } = stripVerbParticleAndReflexive(
    entry.lemma,
    particle,
    reflexive
  );

  const rawInf = deponent ? baseInf.replace(/s$/i, '') : baseInf;
  const stem = rawInf.replace(/a$/i, '');

  let derivedInf = `${baseInf}${suffix}`;
  let derivedImp = '';
  let derivedPres = '';
  let derivedPast = '';
  let derivedSupine = '';
  let derivedPastPart: string | undefined;

  if (deponent) {
    switch (group) {
      case '1':
        derivedImp = `${rawInf}s${suffix}`;
        derivedPres = `${rawInf}s${suffix}`;
        derivedPast = `${rawInf}des${suffix}`;
        derivedSupine = `${rawInf}ts${suffix}`;
        break;
      case '2a': {
        const s = simplifyStem2a(stem);
        const cluster = /nn$/i.test(stem) ? stem.slice(0, -1) : s;
        derivedImp = `${s}s${suffix}`;
        derivedPres = `${s}s${suffix}`;
        derivedPast = /[^aeiouyåäö]d$/i.test(cluster)
          ? `${cluster}es${suffix}`
          : /[aeiouyåäö]d$/i.test(cluster)
            ? `${cluster}des${suffix}`
            : `${cluster}des${suffix}`;
        derivedSupine = /[^aeiouyåäö]d$/i.test(cluster)
          ? `${cluster.slice(0, -1)}ts${suffix}`
          : /[aeiouyåäö]d$/i.test(cluster)
            ? `${cluster.slice(0, -1)}tts${suffix}`
            : `${cluster}ts${suffix}`;
        break;
      }
      case '2b':
        derivedImp = `${stem}s${suffix}`;
        derivedPres = `${stem}s${suffix}`;
        derivedPast = /[^aeiouyåäö]t$/i.test(stem)
          ? `${stem}es${suffix}`
          : `${stem}tes${suffix}`;
        derivedSupine = /[^aeiouyåäö]t$/i.test(stem)
          ? `${stem}s${suffix}`
          : `${stem}ts${suffix}`;
        break;
      case '3':
        derivedImp = `${rawInf}s${suffix}`;
        derivedPres = `${rawInf}s${suffix}`;
        derivedPast = `${rawInf}ddes${suffix}`;
        derivedSupine = `${rawInf}tts${suffix}`;
        break;
      case '4':
      case 'irreg':
        derivedImp = `${stem}s${suffix}`;
        derivedPres = `${stem}s${suffix}`;
        derivedPast = `${stem}s${suffix}`;
        derivedSupine = `${stem}its${suffix}`;
        break;
    }
  } else {
    switch (group) {
      case '1':
        derivedImp = `${baseInf}${suffix}`;
        derivedPres = `${baseInf}r${suffix}`;
        derivedPast = `${baseInf}de${suffix}`;
        derivedSupine = `${baseInf}t${suffix}`;
        derivedPastPart = `${baseInf}d${suffix}`;
        break;
      case '2a': {
        const impStem = simplifyStem2a(stem);
        const clusterStem = /nn$/i.test(stem) ? stem.slice(0, -1) : impStem;
        derivedImp = `${impStem}${suffix}`;
        derivedPres = /r$/i.test(stem) ? `${stem}${suffix}` : `${stem}er${suffix}`;
        if (/[^aeiouyåäö]d$/i.test(clusterStem)) {
          derivedPast = `${clusterStem}e${suffix}`;
          derivedSupine = `${clusterStem.slice(0, -1)}t${suffix}`;
          derivedPastPart = `${clusterStem}${suffix}`;
        } else if (/[aeiouyåäö]d$/i.test(clusterStem)) {
          derivedPast = `${clusterStem}de${suffix}`;
          derivedSupine = `${clusterStem.slice(0, -1)}tt${suffix}`;
          derivedPastPart = `${clusterStem}d${suffix}`;
        } else {
          derivedPast = `${clusterStem}de${suffix}`;
          derivedSupine = `${clusterStem}t${suffix}`;
          derivedPastPart = `${clusterStem}d${suffix}`;
        }
        break;
      }
      case '2b': {
        derivedImp = `${stem}${suffix}`;
        derivedPres = `${stem}er${suffix}`;
        if (/[^aeiouyåäö]t$/i.test(stem)) {
          derivedPast = `${stem}e${suffix}`;
          derivedSupine = `${stem}${suffix}`;
          derivedPastPart = `${stem}${suffix}`;
        } else {
          derivedPast = `${stem}te${suffix}`;
          derivedSupine = `${stem}t${suffix}`;
          derivedPastPart = `${stem}t${suffix}`;
        }
        break;
      }
      case '3':
        derivedImp = `${baseInf}${suffix}`;
        derivedPres = `${baseInf}r${suffix}`;
        derivedPast = `${baseInf}dde${suffix}`;
        derivedSupine = `${baseInf}tt${suffix}`;
        derivedPastPart = `${baseInf}dd${suffix}`;
        break;
      case '4':
      case 'irreg':
        derivedImp = `${stem}${suffix}`;
        derivedPres = `${stem}er${suffix}`;
        derivedPast = `${baseInf}${suffix}`;
        derivedSupine = `${stem}it${suffix}`;
        break;
    }
  }

  const pastPart = forms.pastPart ?? derivedPastPart;

  return {
    inf: forms.inf ?? derivedInf,
    imp: forms.imp ?? derivedImp,
    pres: forms.pres ?? derivedPres,
    past: forms.past ?? derivedPast,
    supine: forms.supine ?? derivedSupine,
    ...(pastPart !== undefined ? { pastPart } : {}),
  };
}

export function inflectAdj(entry: LexiconEntry): {
  common: string;
  neuter: string;
  plDef: string;
  comp?: string;
  sup?: string;
} {
  if (entry.morph?.pos !== 'adj') {
    throw new Error(`Expected adj morph for lexicon entry "${entry.id}"`);
  }

  const { indeclinable, forms = {} } = entry.morph;
  const common = forms.common ?? entry.lemma;

  if (indeclinable) {
    return {
      common,
      neuter: forms.neuter ?? common,
      plDef: forms.plDef ?? common,
      ...(forms.comp !== undefined ? { comp: forms.comp } : {}),
      ...(forms.sup !== undefined ? { sup: forms.sup } : {}),
    };
  }

  let neuter = forms.neuter;
  if (neuter === undefined) {
    if (VOWEL_RE.test(common)) {
      neuter = `${common}tt`;
    } else if (/dd$/i.test(common)) {
      neuter = `${common.slice(0, -2)}tt`;
    } else if (/[aeiouyåäö]d$/i.test(common)) {
      neuter = `${common.slice(0, -1)}tt`;
    } else if (/[^aeiouyåäö]d$/i.test(common)) {
      neuter = `${common.slice(0, -1)}t`;
    } else if (/[^aeiouyåäö]t$/i.test(common) || /tt$/i.test(common)) {
      neuter = common;
    } else if (/^[^aeiouyåäö]*[aeiouyåäö]t$/i.test(common)) {
      neuter = `${common}t`;
    } else if (/[aeiouyåäö]t$/i.test(common)) {
      neuter = common;
    } else if (POLY_EN_RE.test(common)) {
      neuter = `${common.slice(0, -2)}et`;
    } else if (/nn$/i.test(common)) {
      neuter = `${common.slice(0, -1)}t`;
    } else {
      neuter = `${common}t`;
    }
  }

  let plDef = forms.plDef;
  if (plDef === undefined) {
    if (POLY_EL_EN_ER_RE.test(common)) {
      plDef = `${dropUnstressedElEnEr(common)}a`;
    } else if (/a$/i.test(common)) {
      plDef = common;
    } else {
      plDef = `${common}a`;
    }
  }

  return {
    common,
    neuter,
    plDef,
    ...(forms.comp !== undefined ? { comp: forms.comp } : {}),
    ...(forms.sup !== undefined ? { sup: forms.sup } : {}),
  };
}
