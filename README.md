<p align="center">
    <img src="https://raw.githubusercontent.com/unruggable-labs/unruggable-gateways-ens-resolution-demos/main/unruggable-logo-black.png" style = "width:300px;" alt = "Unruggable Gateways" />
</p>

# ENS Resolution Demos

![Resolution Demo](https://github.com/unruggable-labs/unruggable-gateways-ens-resolution-demos/actions/workflows/resolution-demo.yml/badge.svg)

This demo demonstrates a full end to end implementation of the [Unruggable Gateways](https://github.com/unruggable-labs/unruggable-gateways) codebase for resolving an ENS name using data stored on Optimism mainnnet. 

It utilises [Foundry](https://github.com/foundry-rs) (through [blocksmith.js](https://github.com/adraffy/blocksmith.js)) to fork **Ethereum mainnet** and deploy an instance of `OPFaultVerifier`. This verifier is used to verify proofs returned by Unruggable's Optimism gateway running at `https://op-gateway.unruggable.com`.

The gateway is fetching data proofs from the **real** Optimism Mainnet. This repo includes:

- `ExampleResolver.sol` which resolves against an address stored in our standard `SlotDataContract` (deployed [here](https://optimistic.etherscan.io/address/0xf9d79d8c09d24e0C47E32778c830C545e78512CF#code)).

- `OPResolver.sol` which resolves against a [storage contract](https://optimistic.etherscan.io/address/0xc695404735E0F1587A5398a06cAB34D7d7b009Da#code) that implements  a PoC of the complex resolution logic outlined in the ENS v2 specification.


To install dependencies:

```bash
bun install
forge install
```

Configure:

Copy `.env.example` to `.env` and input API keys for your node provider (Alchemy/Infura/Ankr).

To run:

```bash
bun run index.ts
```