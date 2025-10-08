<p align="center">
    <img src="https://raw.githubusercontent.com/unruggable-labs/unruggable-gateways-ens-resolution-demos/main/unruggable-logo-black.png" style = "width:300px;" alt = "Unruggable Gateways" />
</p>

# ENS Resolution Demos

![Resolution Demo](https://github.com/unruggable-labs/unruggable-gateways-ens-resolution-demos/actions/workflows/resolution-demo.yml/badge.svg)

This demo demonstrates a full end to end implementations of the [Unruggable Gateways](https://github.com/unruggable-labs/unruggable-gateways) codebase for resolving an ENS name using data stored on [Arbitrum](https://arbiscan.io/address/0xCC344B12fcc8512cc5639CeD6556064a8907c8a1#code), [Base](https://basescan.org/address/0x0C49361E151BC79899A9DD31B8B0CCdE4F6fd2f6#code), and [Optimism](https://optimistic.etherscan.io/address/0xf9d79d8c09d24e0C47E32778c830C545e78512CF#code). 

It utilises [Foundry](https://github.com/foundry-rs) (through [blocksmith.js](https://github.com/adraffy/blocksmith.js)) to fork **Ethereum mainnet** and deploy an instance of the respective chain specific verifier. This verifier is used to verify proofs returned by Unruggable's gateways running at:

- [https://arbitrum.gateway.unruggable.com](https://arbitrum.gateway.unruggable.com)
- [https://base.gateway.unruggable.com](https://base.gateway.unruggable.com)
- [https://optimism.gateway.unruggable.com](https://optimism.gateway.unruggable.com)

The gateway is fetching data proofs from the **real** chains. 

To install dependencies:

```bash
bun install
forge install
```

Configure:

Copy `.env.example` to `.env` and input API keys for your node provider (Alchemy/Infura/Ankr).

To run:

```bash
bun run arbitrum.ts
bun run base.ts
bun run optimism.ts
```