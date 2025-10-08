import { BoLDRollup } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import { runExample } from './example-base';
import type { VerifierArgsType, VerifierLibsType } from './utils';

const config = BoLDRollup.arb1MainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await new BoLDRollup(
  createProviderPair(config), 
  config,
  1
);
const hooksPath = `@unruggable/contracts/eth/EthVerifierHooks.sol`;
const verifierPath = `@unruggable/contracts/arbitrum/ArbitrumVerifier.sol`;
const GATEWAY_URL = 'https://arbitrum.gateway.unruggable.com';

const verifierArgs: VerifierArgsType = async (smith) => {

  const ethHooksArgs: any[] = [];

  const hooks = await smith.deploy({
    import: hooksPath,
    args: ethHooksArgs,
  });
 
  const verifierArgs: any[] = [
    [GATEWAY_URL],
    rollup.defaultWindow,
    hooks.target,
    rollup.Rollup.target,
    1,
    rollup.isBoLD
  ];

  return verifierArgs;
}


const verifierLibs: VerifierLibsType = async (smith: any) => {

  const boldLib = await smith.deploy({
    import: "@unruggable/contracts/arbitrum/BoLDVerifierLib.sol",
    args: [],
  });

  const nitroLib = await smith.deploy({
    import: "@unruggable/contracts/arbitrum/NitroVerifierLib.sol",
    args: [],
  });
 
  return {
    BoLDVerifierLib: boldLib,
    NitroVerifierLib: nitroLib
  };
}


//This is the address of the SlotDataContract deployed on the L2 (that we fork)
const EXAMPLE_CONTRACT_ADDRESS = '0xCC344B12fcc8512cc5639CeD6556064a8907c8a1'; //Arb

runExample(
  provider, 
  verifierPath, 
  verifierArgs, 
  verifierLibs,
  EXAMPLE_CONTRACT_ADDRESS,
);