# cardenticon

[![CI](https://github.com/adatainment/cardenticon/actions/workflows/ci.yml/badge.svg)](https://github.com/adatainment/cardenticon/actions/workflows/ci.yml)

Deterministic hexagonal identicons for Cardano addresses. SVG output, zero dependencies, SSR-ready.

Derived from [hashicon](https://github.com/emeraldpay/hashicon) by EmeraldPay, rewritten for Cardano with SVG rendering and zero dependencies.
![cardenticon-demo](https://github.com/user-attachments/assets/152b4bce-b255-4754-b465-12641bfcf12c)

## Install

```bash
npm install cardenticon
```

## Usage

```typescript
import { cardenticon, cardenticonDataURL } from 'cardenticon';

// SVG string: use in innerHTML, SSR templates, etc.
const svg = cardenticon('addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp');

// Data URL: use in <img src="...">
const url = cardenticonDataURL('addr1q...');

// Custom size
const small = cardenticon('addr1q...', { size: 48 });
```

### Supported inputs

| Input | Handling |
|-------|----------|
| `addr1...` | Cardano mainnet address, bech32 decoded, credential hash used directly |
| `addr_test1...` | Cardano testnet address |
| `stake1...` | Stake address |
| `stake_test1...` | Testnet stake address |
| `drep1...` | DRep ID (CIP-129 or CIP-105), credential hash used directly |
| `drep_script1...` | Script-based DRep ID (CIP-105) |
| Hex string (14+ chars) | Used as raw bytes |
| Any other string | Hashed internally (cyrb128) |

A DRep ID in its CIP-129 and CIP-105 encoding resolves to the same credential hash, so both produce the identical icon.

### Options

```typescript
cardenticon(input, {
  size: 100,                              // icon size in px
  hue: { min: 0, max: 360 },             // hue range
  saturation: { min: 70, max: 100 },      // saturation %
  lightness: { min: 45, max: 65 },        // lightness %
  variation: { min: 5, max: 20, enabled: true },
  shift: { min: 60, max: 300 },           // figure overlay hue shift
  figureAlpha: { min: 0.7, max: 1.2 },   // figure overlay opacity
  light: { top: 10, right: -8, left: -4, enabled: true },
});
```

## Why not hashicon directly?

- **SVG output**: hashicon is Canvas-only and requires a DOM. Cardenticon outputs SVG strings that work everywhere: SSR, Cloudflare Workers, Node.js, browser.
- **Cardano-native**: decodes bech32 addresses and uses the credential hash directly instead of re-hashing through BLAKE2s.
- **Zero dependencies**: hashicon depends on `@stablelib/blake2s` and `js-sha3`. Cardenticon has none.
- **18 KB minified**: ESM + CJS dual package with TypeScript declarations.

## Performance

~28µs per icon (~35,000 icons/second) on Apple Silicon.

## Used by

- [dreptalk.com](https://dreptalk.com): DRep avatars on mainnet and [preprod](https://preprod.dreptalk.com)

## License

Apache-2.0, see [LICENSE](LICENSE) and [NOTICE](NOTICE) for attribution.
