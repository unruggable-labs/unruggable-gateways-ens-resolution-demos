import { OPRollup, Gateway } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import { runExample } from './example-base';
import type { VerifierArgsType } from './utils';

const config = OPRollup.baseMainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await new OPRollup(createProviderPair(config),
    config);
const gateway = new Gateway(rollup);
const commit = await gateway.getLatestCommit();

const hooksPath = `@unruggable/contracts/eth/EthVerifierHooks.sol`;
const verifierPath = `@unruggable/contracts/op/OPVerifier.sol`;

const GATEWAY_URL = 'https://base.gateway.unruggable.com';
const EXAMPLE_CONTRACT_ADDRESS = '0x0C49361E151BC79899A9DD31B8B0CCdE4F6fd2f6'; //Base

const verifierArgs: VerifierArgsType = async (smith, deployerWallet) => {

  const ethHooksLibs = {};
  const ethHooksArgs: any[] = [];

  const hooks = await smith.deploy({
    import: hooksPath,
    args: ethHooksArgs,
  });

  const verifierArgs: any[] = [
    [GATEWAY_URL],
    rollup.defaultWindow,
    hooks.target,
    rollup.L2OutputOracle.target,
    1
  ];

  return verifierArgs;
}

runExample(provider, verifierPath, verifierArgs, EXAMPLE_CONTRACT_ADDRESS);