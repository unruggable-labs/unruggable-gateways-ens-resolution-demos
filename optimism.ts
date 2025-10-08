import { OPFaultRollup, Gateway } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import type { VerifierArgsType, VerifierLibsType } from './utils';
import { runExample } from './example-base';

const config = OPFaultRollup.mainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = new OPFaultRollup(
    createProviderPair(config),
    config,
    1 // minAgeSec
);

const gateway = new Gateway(rollup);
const commit = await gateway.getLatestCommit();

const hooksPath = `@unruggable/contracts/eth/EthVerifierHooks.sol`;
const gameFinderPath = `@unruggable/test/gateway/FixedOPFaultGameFinder.sol`;
const verifierPath = `@unruggable/contracts/op/OPFaultVerifier.sol`;

const GATEWAY_URL = 'https://optimism.gateway.unruggable.com';

//Deploy gamefinder
/*
// When working with the real gamefinder in the anvil context, iteration is slow.
// ~80s noting the latest fixes to OP fault proving (see https://gov.optimism.io/t/upgrade-proposal-10-granite-network-upgrade/8733)
// We use a fixed gamefinder for demonstration purposes.
// Swap in the below block to use the real gamefinder.
const gameFinder = await foundry.deploy({
    import: `@unruggable/contracts/op/OPFaultGameFinder.sol`,
    args: [],
});
*/

const EXAMPLE_CONTRACT_ADDRESS = '0xf9d79d8c09d24e0C47E32778c830C545e78512CF';

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