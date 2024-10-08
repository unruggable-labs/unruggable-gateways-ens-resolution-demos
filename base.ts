import { OPRollup, Gateway } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import { runExample } from './example-base';
import type { ConfigItem } from './utils';

const config = OPRollup.baseMainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await new OPRollup(createProviderPair(config),
    config);
const gateway = new Gateway(rollup);
const commit = await gateway.getLatestCommit();

const verifierPath = `@unruggable/contracts/op/OPVerifier.sol`;
const verifierArgs: any[] = [];

const GATEWAY_URL = 'https://base.gateway.unruggable.com';
const EXAMPLE_CONTRACT_ADDRESS = '0x0C49361E151BC79899A9DD31B8B0CCdE4F6fd2f6'; //Base
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
    setter: 'setOracle',
    value: rollup.L2OutputOracle.target,
  },
];

runExample(provider, verifierPath, verifierArgs, configurationToSet, EXAMPLE_CONTRACT_ADDRESS);