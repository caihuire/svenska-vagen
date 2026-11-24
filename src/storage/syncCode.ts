import { deflateSync, inflateSync } from 'fflate';
import type { UserProgress } from '../types/index.ts';
import { migrateProgress } from './migrations.ts';

const SYNC_PREFIX = 'SV1:';
const CODEC_MAGIC = 0x53; // 'S'
const CODEC_VERSION = 1;
const BASE64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const BASE64URL_LOOKUP = (() => {
  const table = new Int16Array(256).fill(-1);
  for (let i = 0; i < BASE64URL_ALPHABET.length; i++) {
    table[BASE64URL_ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();

function toBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;

    out += BASE64URL_ALPHABET[b0 >> 2];
    out += BASE64URL_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    if (hasB1) {
      out += BASE64URL_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)];
    }
    if (hasB2) {
      out += BASE64URL_ALPHABET[b2 & 0x3f];
    }
  }
  return out;
}

function fromBase64Url(encoded: string): Uint8Array {
  if (encoded.length === 0 || encoded.length % 4 === 1) {
    throw new Error('Malformed Base64URL sync payload');
  }
  const outLen = Math.floor((encoded.length * 3) / 4);
  const out = new Uint8Array(outLen);
  let outIdx = 0;

  for (let i = 0; i < encoded.length; i += 4) {
    const c0 = BASE64URL_LOOKUP[encoded.charCodeAt(i)];
    const c1 = BASE64URL_LOOKUP[encoded.charCodeAt(i + 1)];
    const c2 = i + 2 < encoded.length ? BASE64URL_LOOKUP[encoded.charCodeAt(i + 2)] : 0;
    const c3 = i + 3 < encoded.length ? BASE64URL_LOOKUP[encoded.charCodeAt(i + 3)] : 0;

    if (
      c0 < 0 ||
      c1 < 0 ||
      (i + 2 < encoded.length && c2 < 0) ||
      (i + 3 < encoded.length && c3 < 0)
    ) {
      throw new Error('Invalid character in Base64URL sync payload');
    }

    out[outIdx++] = (c0 << 2) | (c1 >> 4);
    if (i + 2 < encoded.length) {
      out[outIdx++] = ((c1 & 0x0f) << 4) | (c2 >> 2);
    }
    if (i + 3 < encoded.length) {
      out[outIdx++] = ((c2 & 0x03) << 6) | c3;
    }
  }

  return out;
}

function fnv1a32Hex(ascii: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < ascii.length; i++) {
    hash ^= ascii.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

class ByteWriter {
  private buf: number[] = [];

  writeByte(b: number): void {
    this.buf.push(b & 0xff);
  }

  writeBytes(bytes: Uint8Array): void {
    for (let i = 0; i < bytes.length; i++) {
      this.buf.push(bytes[i]);
    }
  }

  writeVarBigUint(value: bigint): void {
    let v = value;
    while (v >= 0x80n) {
      this.buf.push(Number((v & 0x7fn) | 0x80n));
      v >>= 7n;
    }
    this.buf.push(Number(v));
  }

  writeVarUint(value: number): void {
    this.writeVarBigUint(BigInt(Math.max(0, Math.trunc(value))));
  }

  writeVarBigInt(value: bigint): void {
    const zigzag = value >= 0n ? value << 1n : (-value << 1n) - 1n;
    this.writeVarBigUint(zigzag);
  }

  writeString(str: string): void {
    const bytes = textEncoder.encode(str);
    this.writeVarUint(bytes.length);
    this.writeBytes(bytes);
  }

  writeFloat64(value: number): void {
    const ab = new ArrayBuffer(8);
    new DataView(ab).setFloat64(0, value, false);
    this.writeBytes(new Uint8Array(ab));
  }

  writeEase(ease: number): void {
    const scaled = Math.round(ease * 100);
    if (Math.abs(scaled / 100 - ease) < 1e-12 && scaled >= 0 && scaled < 10000) {
      this.writeByte(0);
      this.writeVarUint(scaled);
    } else {
      this.writeByte(1);
      this.writeFloat64(ease);
    }
  }

  writeOptTsDelta(ts: number, prevTs: number): number {
    if (ts === 0) {
      this.writeVarBigUint(0n);
      return prevTs;
    }
    const delta = BigInt(Math.trunc(ts)) - BigInt(Math.trunc(prevTs));
    const zigzag = delta >= 0n ? delta << 1n : (-delta << 1n) - 1n;
    this.writeVarBigUint(zigzag + 1n);
    return ts;
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buf);
  }
}

class ByteReader {
  private offset = 0;

  constructor(private readonly data: Uint8Array) {}

  readByte(): number {
    if (this.offset >= this.data.length) {
      throw new Error('Unexpected end of sync payload');
    }
    return this.data[this.offset++];
  }

  readBytes(len: number): Uint8Array {
    if (this.offset + len > this.data.length) {
      throw new Error('Unexpected end of sync payload');
    }
    const slice = this.data.subarray(this.offset, this.offset + len);
    this.offset += len;
    return slice;
  }

  readVarBigUint(): bigint {
    let result = 0n;
    let shift = 0n;
    while (true) {
      const b = this.readByte();
      result |= BigInt(b & 0x7f) << shift;
      if ((b & 0x80) === 0) {
        return result;
      }
      shift += 7n;
      if (shift > 70n) {
        throw new Error('Malformed varint in sync payload');
      }
    }
  }

  readVarUint(): number {
    return Number(this.readVarBigUint());
  }

  readVarBigInt(): bigint {
    const zigzag = this.readVarBigUint();
    return (zigzag & 1n) === 0n ? zigzag >> 1n : -((zigzag + 1n) >> 1n);
  }

  readString(): string {
    const len = this.readVarUint();
    return textDecoder.decode(this.readBytes(len));
  }

  readFloat64(): number {
    const bytes = this.readBytes(8);
    const copy = new Uint8Array(bytes);
    return new DataView(copy.buffer).getFloat64(0, false);
  }

  readEase(): number {
    const mode = this.readByte();
    if (mode === 0) {
      return this.readVarUint() / 100;
    }
    if (mode === 1) {
      return this.readFloat64();
    }
    throw new Error('Invalid ease encoding in sync payload');
  }

  readOptTsDelta(prevTs: number): { ts: number; nextPrev: number } {
    const encoded = this.readVarBigUint();
    if (encoded === 0n) {
      return { ts: 0, nextPrev: prevTs };
    }
    const zigzag = encoded - 1n;
    const delta = (zigzag & 1n) === 0n ? zigzag >> 1n : -((zigzag + 1n) >> 1n);
    const ts = prevTs + Number(delta);
    return { ts, nextPrev: ts };
  }
}

function serializeProgress(progress: UserProgress): Uint8Array {
  const w = new ByteWriter();
  w.writeByte(CODEC_MAGIC);
  w.writeByte(CODEC_VERSION);

  w.writeVarUint(progress.xp);
  w.writeVarUint(progress.streak);
  w.writeVarUint(progress.freezes);
  w.writeVarBigUint(BigInt(Math.trunc(progress.updatedAt)));

  w.writeString(progress.lastStreakCheckDate ?? '');
  w.writeVarUint(progress.activeDates.length);
  for (const dateStr of progress.activeDates) {
    w.writeString(dateStr);
  }

  const s = progress.settings;
  w.writeVarUint(s.dailyXpGoal);
  w.writeVarUint(s.srsNewCap);
  w.writeVarUint(s.srsReviewCap);
  const flags =
    (s.autoAdvance ? 1 : 0) |
    (s.darkMode ? 2 : 0) |
    (s.freeBrowse ? 4 : 0) |
    (s.iosInstallDismissed ? 8 : 0);
  w.writeByte(flags);

  const unitEntries = Object.entries(progress.unitProgress);
  w.writeVarUint(unitEntries.length);
  let prevUnitTs = progress.updatedAt;
  for (const [unitId, u] of unitEntries) {
    w.writeString(unitId);
    w.writeVarUint(u.practiceBestScore);
    w.writeVarUint(u.practiceAttempts);
    w.writeByte(u.readerPassed ? 1 : 0);
    prevUnitTs = w.writeOptTsDelta(u.lastStudiedAt, prevUnitTs);
  }

  const cardEntries = Object.values(progress.srsCards);
  w.writeVarUint(cardEntries.length);
  let prevDueTs = progress.updatedAt;
  let prevRevTs = progress.updatedAt;
  let prevEnrTs = progress.updatedAt;
  for (const c of cardEntries) {
    w.writeString(c.lexId);
    w.writeVarUint(c.intervalDays);
    w.writeEase(c.ease);
    w.writeVarUint(c.reps);
    w.writeVarUint(c.lapses);
    prevDueTs = w.writeOptTsDelta(c.dueAt, prevDueTs);
    prevRevTs = w.writeOptTsDelta(c.lastReviewedAt, prevRevTs);
    prevEnrTs = w.writeOptTsDelta(c.enrolledAt, prevEnrTs);
  }

  const weakEntries = Object.values(progress.weakSkills);
  w.writeVarUint(weakEntries.length);
  let prevWeakTs = progress.updatedAt;
  for (const wk of weakEntries) {
    w.writeString(wk.tag);
    w.writeVarUint(wk.recentResults.length);
    let mask = 0;
    for (let i = 0; i < wk.recentResults.length; i++) {
      if (wk.recentResults[i]) {
        mask |= 1 << i;
      }
    }
    w.writeVarUint(mask);
    prevWeakTs = w.writeOptTsDelta(wk.updatedAt, prevWeakTs);
  }

  return w.toUint8Array();
}

function deserializeProgress(bytes: Uint8Array): UserProgress {
  const r = new ByteReader(bytes);
  const magic = r.readByte();
  const version = r.readByte();
  if (magic !== CODEC_MAGIC || version !== CODEC_VERSION) {
    throw new Error('Unsupported sync payload header');
  }

  const xp = r.readVarUint();
  const streak = r.readVarUint();
  const freezes = r.readVarUint();
  const updatedAt = Number(r.readVarBigUint());

  const lastStreakCheckDate = r.readString();
  const activeCount = r.readVarUint();
  const activeDates: string[] = [];
  for (let i = 0; i < activeCount; i++) {
    activeDates.push(r.readString());
  }

  const dailyXpGoal = r.readVarUint();
  const srsNewCap = r.readVarUint();
  const srsReviewCap = r.readVarUint();
  const flags = r.readByte();

  const unitCount = r.readVarUint();
  const unitProgress: UserProgress['unitProgress'] = {};
  let prevUnitTs = updatedAt;
  for (let i = 0; i < unitCount; i++) {
    const unitId = r.readString();
    const practiceBestScore = r.readVarUint();
    const practiceAttempts = r.readVarUint();
    const readerPassed = r.readByte() === 1;
    const studied = r.readOptTsDelta(prevUnitTs);
    prevUnitTs = studied.nextPrev;
    unitProgress[unitId] = {
      practiceBestScore,
      practiceAttempts,
      readerPassed,
      lastStudiedAt: studied.ts,
    };
  }

  const cardCount = r.readVarUint();
  const srsCards: UserProgress['srsCards'] = {};
  let prevDueTs = updatedAt;
  let prevRevTs = updatedAt;
  let prevEnrTs = updatedAt;
  for (let i = 0; i < cardCount; i++) {
    const lexId = r.readString();
    const intervalDays = r.readVarUint();
    const ease = r.readEase();
    const reps = r.readVarUint();
    const lapses = r.readVarUint();
    const due = r.readOptTsDelta(prevDueTs);
    prevDueTs = due.nextPrev;
    const rev = r.readOptTsDelta(prevRevTs);
    prevRevTs = rev.nextPrev;
    const enr = r.readOptTsDelta(prevEnrTs);
    prevEnrTs = enr.nextPrev;
    srsCards[lexId] = {
      lexId,
      intervalDays,
      ease,
      reps,
      lapses,
      dueAt: due.ts,
      lastReviewedAt: rev.ts,
      enrolledAt: enr.ts,
    };
  }

  const weakCount = r.readVarUint();
  const weakSkills: UserProgress['weakSkills'] = {};
  let prevWeakTs = updatedAt;
  for (let i = 0; i < weakCount; i++) {
    const tag = r.readString();
    const len = r.readVarUint();
    const mask = r.readVarUint();
    const recentResults: boolean[] = [];
    for (let j = 0; j < len; j++) {
      recentResults.push((mask & (1 << j)) !== 0);
    }
    const wkTs = r.readOptTsDelta(prevWeakTs);
    prevWeakTs = wkTs.nextPrev;
    weakSkills[tag] = {
      tag,
      recentResults,
      updatedAt: wkTs.ts,
    };
  }

  return migrateProgress({
    schemaVersion: 1,
    xp,
    streak,
    freezes,
    activeDates,
    ...(lastStreakCheckDate ? { lastStreakCheckDate } : {}),
    unitProgress,
    srsCards,
    weakSkills,
    settings: {
      dailyXpGoal,
      srsNewCap,
      srsReviewCap,
      autoAdvance: (flags & 1) !== 0,
      darkMode: (flags & 2) !== 0,
      freeBrowse: (flags & 4) !== 0,
      iosInstallDismissed: (flags & 8) !== 0,
    },
    updatedAt,
  });
}

export function encodeSyncCode(progress: UserProgress): string {
  const rawBytes = serializeProgress(progress);
  const compressed = deflateSync(rawBytes, { level: 9 });
  const payload = toBase64Url(compressed);
  const checksum = fnv1a32Hex(payload);
  return `${SYNC_PREFIX}${checksum}.${payload}`;
}

export function decodeSyncCode(code: string): UserProgress {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SYNC_PREFIX)) {
    throw new Error('Invalid sync code prefix (expected SV1:)');
  }

  const body = trimmed.slice(SYNC_PREFIX.length);
  const dotIdx = body.indexOf('.');
  if (dotIdx <= 0 || dotIdx === body.length - 1) {
    throw new Error('Invalid sync code format (expected SV1:<checksum>.<payload>)');
  }

  const checksum = body.slice(0, dotIdx);
  const payload = body.slice(dotIdx + 1);
  if (!/^[0-9a-f]{8}$/i.test(checksum)) {
    throw new Error('Invalid sync code checksum format');
  }

  const expectedChecksum = fnv1a32Hex(payload);
  if (checksum.toLowerCase() !== expectedChecksum) {
    throw new Error('Sync code checksum mismatch (code may be truncated or corrupted)');
  }

  try {
    const compressed = fromBase64Url(payload);
    const rawBytes = inflateSync(compressed);
    return deserializeProgress(rawBytes);
  } catch (err) {
    throw new Error(
      `Failed to decode sync code payload: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
