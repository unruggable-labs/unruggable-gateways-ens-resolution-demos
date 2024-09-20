import { Foundry } from '@adraffy/blocksmith';
import { OPFaultRollup, Gateway } from '@unruggable/gateways';
import { createProviderPair, providerURL } from './providers';
import type { ConfigItem, VerifierArgsType } from './utils';
import { runExample } from './example-base';

const config = OPFaultRollup.mainnetConfig;

// Make sure you've created a .env and added node provider API keys
console.log(providerURL(config.chain1));
console.log(providerURL(config.chain2));

const provider = providerURL(config.chain1);
const rollup = await OPFaultRollup.create(
    createProviderPair(config),
    config
);

const gateway = new Gateway(rollup);
const commit = await gateway.getLatestCommit();

const verifierPath = `@unruggable/contracts/op/OPFaultVerifier.sol`;

const GATEWAY_URL = 'https://optimism.gateway.unruggable.com';

const verifierArgs: VerifierArgsType = async (foundry) => {

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

  const gameFinder = await foundry.deploy({
    import: `@unruggable/test/gateway/FixedOPFaultGameFinder.sol`,
    args: [commit.index],
  });

  return [gameFinder.target];
}

const EXAMPLE_CONTRACT_ADDRESS = '0xf9d79d8c09d24e0C47E32778c830C545e78512CF';
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
      setter: 'setPortal',
      value: rollup.OptimismPortal.target,
  },
  {
      setter: 'setGameTypes',
      value: rollup.gameTypeBitMask,
  },
];

runExample(provider, verifierPath, verifierArgs, configurationToSet, EXAMPLE_CONTRACT_ADDRESS);