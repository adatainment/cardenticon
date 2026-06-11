/**
 * Minimal bech32 encoder, used only to build test vectors.
 * Mirrors the decoder in src/bech32.ts so tests can round-trip and construct
 * CIP-105 / CIP-129 DRep IDs from a known credential hash.
 */

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values: number[]): number {
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const out: number[] = [];
  for (const c of hrp) out.push(c.charCodeAt(0) >> 5);
  out.push(0);
  for (const c of hrp) out.push(c.charCodeAt(0) & 31);
  return out;
}

function checksum(hrp: string, data: number[]): number[] {
  const values = hrpExpand(hrp).concat(data, [0, 0, 0, 0, 0, 0]);
  const mod = polymod(values) ^ 1;
  const out: number[] = [];
  for (let i = 0; i < 6; i++) out.push((mod >> (5 * (5 - i))) & 31);
  return out;
}

/** Convert 8-bit bytes to 5-bit groups (raw to bech32). */
function convert8to5(bytes: Uint8Array): number[] {
  let acc = 0;
  let bits = 0;
  const out: number[] = [];
  for (const b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) out.push((acc << (5 - bits)) & 31);
  return out;
}

/** Encode a human-readable prefix and raw bytes into a bech32 string. */
export function encodeBech32(hrp: string, bytes: Uint8Array): string {
  const data = convert8to5(bytes);
  const combined = data.concat(checksum(hrp, data));
  return hrp + '1' + combined.map((i) => CHARSET[i]).join('');
}

/** Build a deterministic 28-byte blake2b-224-shaped credential hash for tests. */
export function credentialHash(seed = 7): Uint8Array {
  return Uint8Array.from(Array.from({ length: 28 }, (_, i) => (i * seed + 3) & 0xff));
}
