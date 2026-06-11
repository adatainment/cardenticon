import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardenticon, cardenticonDataURL } from '../dist/index.js';

// CIP-19 test vectors (mainnet base and stake address)
const VALID_ADDR =
  'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x';
const VALID_STAKE = 'stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gpssrtvn';

function assertValidSVG(svg: string, label: string) {
  assert.ok(svg.startsWith('<svg'), `${label}: returns SVG markup`);
  assert.ok(!svg.includes('NaN'), `${label}: contains no NaN values`);
  assert.ok(!svg.includes('undefined'), `${label}: contains no undefined values`);
}

test('valid base address renders a deterministic SVG', () => {
  const svg = cardenticon(VALID_ADDR);
  assertValidSVG(svg, 'valid addr1');
  assert.equal(svg, cardenticon(VALID_ADDR));
});

test('valid stake address renders a deterministic SVG', () => {
  const svg = cardenticon(VALID_STAKE);
  assertValidSVG(svg, 'valid stake1');
  assert.equal(svg, cardenticon(VALID_STAKE));
});

test('malformed stake1-prefixed string falls back to the string hash', () => {
  // 'b', 'i' and 'o' are not in the bech32 charset, so decoding throws
  const input = 'stake1bio-definitely-not-bech32';
  const svg = cardenticon(input);
  assertValidSVG(svg, 'malformed stake1');
  assert.equal(svg, cardenticon(input), 'is deterministic');
});

test('truncated stake1q input falls back to the string hash', () => {
  // Decodes to an empty payload, so slicing off the header byte yields nothing
  const input = 'stake1q';
  const svg = cardenticon(input);
  assertValidSVG(svg, 'truncated stake1q');
  assert.equal(svg, cardenticon(input), 'is deterministic');
});

test('different malformed inputs produce different icons', () => {
  assert.notEqual(cardenticon('stake1q'), cardenticon('stake1bio-definitely-not-bech32'));
});

test('arbitrary string input renders a deterministic SVG', () => {
  const svg = cardenticon('hello world');
  assertValidSVG(svg, 'arbitrary string');
  assert.equal(svg, cardenticon('hello world'));
});

test('hex string input renders a deterministic SVG', () => {
  const input = 'deadbeefcafe0123456789abcdef';
  const svg = cardenticon(input);
  assertValidSVG(svg, 'hex string');
  assert.equal(svg, cardenticon(input));
});

test('data URL variant wraps the SVG in base64', () => {
  const url = cardenticonDataURL('stake1q');
  assert.ok(url.startsWith('data:image/svg+xml;base64,'));
});
