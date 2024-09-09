import { Foundry } from '@adraffy/blocksmith';
import { OPFaultRollup, Gateway, solidityFollowSlot } from '@unruggable/gateways';
import { ethers } from 'ethers';
import { createProviderPair, providerURL } from './providers';

const config = OPFaultRollup.mainnetConfig;

// Make sure you've created a .env and added node provider API keys
// console.log(providerURL(config.chain1));

const rollup = await OPFaultRollup.create(
    createProviderPair(config),
    config
);
const gateway = new Gateway(rollup);
const commit = await gateway.getLatestCommit();

//const gateway = new Gateway(rollup);
//const ccip = await serve(gateway, { protocol: 'raw' });

const GATEWAY_URL = 'https://op-gateway.unruggable.com';

const foundry = await Foundry.launch({
  fork: providerURL(config.chain1),
  procLog  : true,
  infoLog  : true,
});

const deployerWallet = foundry.wallets.admin;

//const gameFinderName = 'FixedOPFaultGameFinder';
//let gameFinderArgs = [Number(commit.index)];

//Deploy gamefinder
const gameFinder = await foundry.deploy({
    file: `OPFaultGameFinder`,
    args: [],
});

//Deploy verifier
const verifier = await foundry.deploy({
    file: `OPFaultVerifier`,
    args: [gameFinder.target],
});

//Deploy proxy
const proxy = await foundry.deploy({
    file: `TransparentUpgradeableProxy`,
    args: [verifier.target, deployerWallet.address, '0x'],
});

// Instantiate the proxy using the undelrlying verifier interface
const proxyUsingInterface = new ethers.Contract(
    proxy.target,
    verifier.interface,
    deployerWallet
);

// Configure the verifier
await foundry.confirm(
    proxyUsingInterface.setGatewayURLs([GATEWAY_URL])
);  
await foundry.confirm(proxyUsingInterface.setWindow(rollup.defaultWindow));
await foundry.confirm(proxyUsingInterface.setPortal(rollup.OptimismPortal.target));
await foundry.confirm(proxyUsingInterface.setGameTypes(rollup.gameTypeBitMask));

const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const NODE = ethers.namehash('opdemo.eth');
const SLOT = solidityFollowSlot(0, NODE) + 1n;

//This is the address of the SlotDataContract deployed on the L2 (that we fork)
const EXAMPLE_CONTRACT_ADDRESS = '0xf9d79d8c09d24e0C47E32778c830C545e78512CF';

// Test with the ExampleResolver that reads a value from our live deployed SlotDataContract
// Uncomment this block, and comment the block below to test with the ExampleResolver
// const opL1Resolver = await foundry.deploy({
//     file: 'ExampleResolver',
//     args: [proxy.target, EXAMPLE_CONTRACT_ADDRESS],
// });

// Test with the OPResolver that reads does a complex v2-spec like resolution
const opL1Resolver = await foundry.deploy({
    file: 'OPResolver',
    args: [proxy.target],
});
  

console.log('Resolver depl:', opL1Resolver.target);

// replace real teamnick resolver with fake
await foundry.provider.send('anvil_setStorageAt', [
  ENS,
  ethers.toBeHex(SLOT, 32),
  ethers.toBeHex(opL1Resolver.target, 32),
]);
const ens = new ethers.Contract(
  ENS,
  ['function resolver(bytes32 node) view returns (address)'],
  foundry.provider
);
console.log('Hijacked:', await ens.resolver(NODE));

async function resolve(name: string, keys = ['avatar'], coinType = 60) {
  const resolver = await foundry.provider.getResolver(name);

  //console.log("Resolver", resolver);

  if (!resolver) throw new Error('bug');
  const [address] = await Promise.all([
    resolver.getAddress(coinType)
  ]);
  console.log({
    name,
    address,
  });
}

await resolve('opdemo.eth');

await foundry.shutdown();