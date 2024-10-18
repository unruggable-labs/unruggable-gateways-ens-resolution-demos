import { NitroRollup } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import { runExample, type VerifierArgsType } from './example-base';
import { type ConfigItem } from './utils';
import { Wallet } from 'ethers';

const config = NitroRollup.arb1MainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await new NitroRollup(
  createProviderPair(config), 
  config
);
const hooksPath = `@unruggable/contracts/eth/EthVerifierHooks.sol`;
const verifierPath = `@unruggable/contracts/nitro/NitroVerifier.sol`;
const GATEWAY_URL = 'https://arbitrum-one.gateway.unruggable.com';

const verifierArgs: VerifierArgsType = async (smith, deployerWallet) => {

  const ethHooksArgs: any[] = [];

  const hooks = await smith.deploy({
    import: hooksPath,
    args: ethHooksArgs,
  });

  const verifierArgs: any[] = [
    [GATEWAY_URL],
    rollup.defaultWindow,
    hooks.target,
    rollup.L2Rollup.target
  ];

  return verifierArgs;
}

//This is the address of the SlotDataContract deployed on the L2 (that we fork)
const EXAMPLE_CONTRACT_ADDRESS = '0xCC344B12fcc8512cc5639CeD6556064a8907c8a1'; //Arb

runExample(provider, verifierPath, verifierArgs, EXAMPLE_CONTRACT_ADDRESS);