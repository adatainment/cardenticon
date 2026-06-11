import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHex, hexToBytes, hashString } from '../src/hash.ts';

test('isHex requires at least 14 hex characters', () => {
  assert.equal(isHex('deadbeefdeadbe'), true); // 14 chars
  assert.equal(isHex('deadbeef'), false); // too short
  assert.equal(isHex('nothexnothexnothex'), false); // non-hex letters
});

test('hexToBytes parses pairs of hex digits', () => {
  assert.deepEqual([...hexToBytes('00ff10')], [0, 255, 16]);
});

test('hashString is deterministic and produces 16 bytes', () => {
  const a = hashString('cardano');
  const b = hashString('cardano');
  assert.equal(a.length, 16);
  assert.deepEqual([...a], [...b]);
});

test('hashString separates similar inputs', () => {
  assert.notDeepEqual([...hashString('cardano')], [...hashString('cardana')]);
});
