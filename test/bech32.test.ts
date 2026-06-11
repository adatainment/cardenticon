import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCardanoAddress, isDRepId, decodeBech32 } from '../src/bech32.ts';
import { encodeBech32, credentialHash } from './helpers/bech32.ts';

test('isCardanoAddress recognizes address prefixes only', () => {
  for (const p of ['addr1abc', 'addr_test1abc', 'stake1abc', 'stake_test1abc']) {
    assert.equal(isCardanoAddress(p), true, p);
  }
  for (const p of ['drep1abc', 'drep_script1abc', 'hello', '']) {
    assert.equal(isCardanoAddress(p), false, p);
  }
});

test('isDRepId recognizes drep prefixes only', () => {
  for (const p of ['drep1abc', 'drep_script1abc']) {
    assert.equal(isDRepId(p), true, p);
  }
  for (const p of ['addr1abc', 'stake1abc', 'hello', '']) {
    assert.equal(isDRepId(p), false, p);
  }
});

test('prefix checks are case-insensitive', () => {
  assert.equal(isCardanoAddress('ADDR1ABC'), true);
  assert.equal(isDRepId('DREP1ABC'), true);
});

test('decodeBech32 round-trips the payload bytes', () => {
  const hash = credentialHash();
  const decoded = decodeBech32(encodeBech32('drep', hash));
  assert.deepEqual([...decoded], [...hash]);
});

test('decodeBech32 keeps a CIP-129 header byte in the payload', () => {
  const payload = Uint8Array.from([0x22, ...credentialHash()]);
  const decoded = decodeBech32(encodeBech32('drep', payload));
  assert.equal(decoded.length, 29);
  assert.equal(decoded[0], 0x22);
});

test('decodeBech32 is case-insensitive', () => {
  const encoded = encodeBech32('drep', credentialHash());
  assert.deepEqual([...decodeBech32(encoded.toUpperCase())], [...decodeBech32(encoded)]);
});

test('decodeBech32 rejects invalid characters', () => {
  // 'b' is not part of the bech32 charset
  assert.throws(() => decodeBech32('drep1bbbbbb'));
});
