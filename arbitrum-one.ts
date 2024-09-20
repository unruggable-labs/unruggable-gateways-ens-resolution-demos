import { NitroRollup } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import { runExample } from './example-base';
import { type ConfigItem } from './utils';

const config = NitroRollup.arb1MainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await new NitroRollup(
  createProviderPair(config), 
  config
);
const verifierPath = `@unruggable/contracts/nitro/NitroVerifier.sol`;
const verifierArgs: any[] = [];
const GATEWAY_URL = 'https://arbitrum-one.gateway.unruggable.com';
//This is the address of the SlotDataContract deployed on the L2 (that we fork)
const EXAMPLE_CONTRACT_ADDRESS = '0xCC344B12fcc8512cc5639CeD6556064a8907c8a1'; //Arb
const configurationToSet: ConfigItem[] = [
  {
    getter: 'getWindow',
    setter: 'setWindow',
    value: rollup.defaultWindow,
  },
  {
    getter: 'gatewayURLs',
    setter: 'setGatewayURLs',
    value: [GATEWAY_URL],
  },
  {
    setter: 'setRollup',
    value: rollup.L2Rollup.target,
  },
];

runExample(provider, verifierPath, verifierArgs, configurationToSet, EXAMPLE_CONTRACT_ADDRESS);