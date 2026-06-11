import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardenticon, cardenticonDataURL } from '../dist/index.js';
import { encodeBech32, credentialHash } from './helpers/bech32.ts';

// Real-world inputs, one per supported type.
const MAINNET_ADDR =
  'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp';
const STAKE_ADDR = 'stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw';
const DREP_CIP129 = 'drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j';

const isValidSvg = (s: string): boolean =>
  s.startsWith('<svg') && s.trimEnd().endsWith('</svg>');

test('produces valid SVG for every supported input type', () => {
  const inputs = [MAINNET_ADDR, STAKE_ADDR, DREP_CIP129, 'deadbeefdeadbeef', 'arbitrary-string'];
  for (const input of inputs) {
    assert.ok(isValidSvg(cardenticon(input)), input);
  }
});

test('is deterministic for the same input', () => {
  assert.equal(cardenticon(DREP_CIP129), cardenticon(DREP_CIP129));
});

test('different inputs yield different icons', () => {
  assert.notEqual(cardenticon('alice'), cardenticon('bob'));
});

test('malformed stake1-prefixed string falls back to the string hash', () => {
  // 'b', 'i' and 'o' are not in the bech32 charset, so decoding throws.
  // Identicons render untrusted inputs, so this must not propagate.
  const input = 'stake1bio-definitely-not-bech32';
  const svg = cardenticon(input);
  assert.ok(isValidSvg(svg), svg.slice(0, 40));
  assert.ok(!svg.includes('NaN'), 'contains no NaN values');
  assert.equal(svg, cardenticon(input), 'is deterministic');
});

test('truncated address-prefixed inputs fall back to the string hash', () => {
  // 'stake1q' and 'drep1q' decode to an empty payload; 'stake1qqqqqqqq'
  // decodes to a single header byte with nothing after it.
  for (const input of ['stake1q', 'drep1q', 'stake1qqqqqqqq']) {
    const svg = cardenticon(input);
    assert.ok(isValidSvg(svg), input);
    assert.ok(!svg.includes('NaN'), input);
    assert.equal(svg, cardenticon(input), input);
  }
});

test('different malformed inputs yield different icons', () => {
  assert.notEqual(cardenticon('stake1q'), cardenticon('drep1q'));
});

test('CIP-105 and CIP-129 encodings of one DRep render identically', () => {
  const hash = credentialHash(13);

  // Key-hash DRep: CIP-105 bare hash vs CIP-129 with 0x22 header.
  const cip105key = encodeBech32('drep', hash);
  const cip129key = encodeBech32('drep', Uint8Array.from([0x22, ...hash]));
  assert.equal(cardenticon(cip105key), cardenticon(cip129key));

  // Script-hash DRep: CIP-105 drep_script vs CIP-129 with 0x23 header.
  const cip105script = encodeBech32('drep_script', hash);
  const cip129script = encodeBech32('drep', Uint8Array.from([0x23, ...hash]));
  assert.equal(cardenticon(cip105script), cardenticon(cip129script));
});

test('size option is reflected in the SVG dimensions', () => {
  const svg = cardenticon('cardano', { size: 48 });
  assert.match(svg, /width="48"/);
  assert.match(svg, /viewBox="0 0 48 48"/);
});

test('cardenticonDataURL encodes the SVG as a base64 data URL', () => {
  const prefix = 'data:image/svg+xml;base64,';
  const url = cardenticonDataURL('cardano');
  assert.ok(url.startsWith(prefix), url.slice(0, 32));
  const decoded = Buffer.from(url.slice(prefix.length), 'base64').toString('utf8');
  assert.equal(decoded, cardenticon('cardano'));
});
