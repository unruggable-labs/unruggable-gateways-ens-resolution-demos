import { OPFaultRollup, Gateway } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import { runExample } from './example-base';
import type { VerifierArgsType, VerifierLibsType } from './utils';

const config = OPFaultRollup.baseMainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await new OPFaultRollup(
  createProviderPair(config),
  config,
  1 // minAgeSec
);

const gateway = new Gateway(rollup);

const commit = await gateway.getLatestCommit();

const hooksPath = `@unruggable/contracts/eth/EthVerifierHooks.sol`;
const verifierPath = `@unruggable/contracts/op/OPFaultVerifier.sol`;
const gameFinderPath = `@unruggable/test/gateway/FixedOPFaultGameFinder.sol`;

const GATEWAY_URL = 'https://base.gateway.unruggable.com';
const EXAMPLE_CONTRACT_ADDRESS = '0x0C49361E151BC79899A9DD31B8B0CCdE4F6fd2f6'; //Base

const verifierArgs: VerifierArgsType = async (smith) => {

  const gameFinderArgs: any[] = [commit.index];

  const gameFinder = await smith.deploy({
    import: gameFinderPath,
    args: gameFinderArgs,
  });

  const ethHooksArgs: any[] = [];

  const hooks = await smith.deploy({
    import: hooksPath,
    args: ethHooksArgs,
  });

  return [
      [GATEWAY_URL],
      rollup.defaultWindow,
      hooks.target,
      [
          rollup.OptimismPortal.target,
          gameFinder.target,
          rollup.gameTypeBitMask,
          rollup.minAgeSec,
      ]
  ];

}

const verifierLibs: VerifierLibsType = async (smith) => {
  return {};
}

runExample(
  provider, 
  verifierPath, 
  verifierArgs, 
  verifierLibs,
  EXAMPLE_CONTRACT_ADDRESS
);