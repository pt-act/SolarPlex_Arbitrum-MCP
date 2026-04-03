# SolarPlex Arbitrum MCP — Release v1.2.0

**Signed artifact checksums** — verify your installation matches the published build.

## SHA256 Checksums

```
01ad7c3348804422b233b3c12a523ca8541166b18be163516ebfba301127ebaf  dist/tools/arbitrum.js
14f7a23c95f0d42f3c9a5edf2e060cd4abb44502bb94b5078b4d9fdc8223c3c5  dist/tools/reputation.js
30dd547a5e0dea31bb86b648066356b33b33b7edda7dc27409e4bcd1cd58af42  dist/tools/solana.js
79d5f182750ec4e1c2f56573a767bc16043320f49e313c1afb4cae9172daced8  dist/http.js
92d229360353dc248fe0a94ef448cb938e2ab502a440066c0a535aa255340ac9  dist/tools/gmx.js
9680519216c400ee2e4a4325c0582ea1b0a33b5f1553b97254268bc00998dbeb  dist/tools/analytics.js
b521586955b4fc2416b21f960e7974d90c8680cbfb0a74c00dc5450892546d2b  dist/security.js
c0eac32b17ce314c489c2277f5adfd108370fab8ffdd92541dc0414f818d8721  dist/index.js
c19ebffb1975f81df08d6d61137728c204730834944e54d77f3a705d6a5cab2e  dist/tools/delegate.js
d2229e91fb88737a3242aa150e71385970cc92f4abb5ef953fe96d6db6a6c9f1  dist/tools/governance.js
d5e8168287b394e6e48f3f849a45d89a4f7f7b75b7f767c5ed176261096dbaf8  dist/config/index.js
```

## Verify Your Build

```bash
# After npm install
cd node_modules/solarplex-arbitrum-mcp
shasum -a 256 dist/**/*.js

# Compare against published checksums above
# All hashes must match exactly
```

## Git Tag

```bash
git tag -s v1.2.0 -m "SolarPlex Arbitrum MCP v1.2.0"
git push origin v1.2.0
```

## Reproducible Build

```bash
git clone https://github.com/pt-act/SolarPlex_Arbitrum-MCP.git
cd SolarPlex_Arbitrum-MCP
git checkout v1.2.0
npm install
npm run build
shasum -a 256 dist/**/*.js
# Compare output against checksums above
```
