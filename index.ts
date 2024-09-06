import { Foundry } from '@adraffy/blocksmith';
import { OPFaultRollup, Gateway, solidityFollowSlot, type Chain, type ChainPair, type ProviderPair, type Provider, CHAINS } from '@unruggable/gateways';
import { ethers, FetchRequest, JsonRpcProvider } from 'ethers';

export type ChainInfo = {
    readonly name: string;
    readonly chain: Chain;
    readonly rpc: string;
    readonly ankr?: string;
    readonly infura?: string;
    readonly alchemy?: string;
  };

export const CHAIN_MAP = new Map<Chain, ChainInfo>(
    (
      [
        {
          chain: CHAINS.MAINNET,
          name: 'mainnet',
          rpc: 'https://rpc.ankr.com/eth/',
          ankr: 'eth',
          infura: 'mainnet',
          alchemy: 'eth-mainnet',
        },
        {
          chain: CHAINS.SEPOLIA,
          name: 'sepolia',
          rpc: 'https://rpc.ankr.com/eth_sepolia/',
          ankr: 'eth_sepolia',
          infura: 'sepolia',
          alchemy: 'eth-sepolia',
        },
        {
          // https://docs.optimism.io/chain/networks#op-mainnet
          chain: CHAINS.OP,
          name: 'op',
          rpc: 'https://mainnet.optimism.io',
          ankr: 'optimism',
          infura: 'optimism-mainnet',
          alchemy: 'opt-mainnet',
        },
        {
          // https://docs.optimism.io/chain/networks#op-sepolia
          chain: CHAINS.OP_SEPOLIA,
          name: 'op-sepolia',
          rpc: 'https://sepolia.optimism.io',
          ankr: 'optimism_sepolia',
          infura: 'optimism-sepolia',
          alchemy: 'opt-sepolia',
        },
        {
          // https://docs.base.org/docs/network-information#base-mainnet
          chain: CHAINS.BASE,
          name: 'base',
          rpc: 'https://mainnet.base.org',
          ankr: 'base',
          infura: 'base-mainnet',
          alchemy: 'base-mainnet',
        },
        {
          // https://docs.base.org/docs/network-information#base-testnet-sepolia
          chain: CHAINS.BASE_SEPOLIA,
          name: 'base-sepolia',
          rpc: 'https://sepolia.base.org',
          ankr: 'base_sepolia',
          infura: 'base-sepolia',
          alchemy: 'base-sepolia',
        },
        {
          // https://docs.arbitrum.io/build-decentralized-apps/reference/node-providers#arbitrum-public-rpc-endpoints
          chain: CHAINS.ARB1,
          name: 'arb1',
          rpc: 'https://arb1.arbitrum.io/rpc',
          ankr: 'arbitrum',
          infura: 'arbitrum-mainnet',
          alchemy: 'arb-mainnet',
        },
        {
          chain: CHAINS.ARB_NOVA,
          name: 'arb-nova',
          rpc: 'https://nova.arbitrum.io/rpc',
          ankr: 'arbitrumnova',
          alchemy: 'arbnova-mainnet',
        },
        {
          chain: CHAINS.ARB_SEPOLIA,
          name: 'arb-sepolia',
          rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
          ankr: 'arbitrum_sepolia',
          infura: 'arbitrum-sepolia',
          alchemy: 'arb-sepolia',
        },
        {
          // https://docs.scroll.io/en/developers/developer-quickstart/#scroll-mainnet
          chain: CHAINS.SCROLL,
          name: 'scroll',
          rpc: 'https://rpc.scroll.io',
          ankr: 'scroll',
        },
        {
          chain: CHAINS.SCROLL_SEPOLIA,
          name: 'scroll-sepolia',
          rpc: 'https://sepolia-rpc.scroll.io',
          ankr: 'scroll_sepolia_testnet',
        },
        {
          // https://docs.taiko.xyz/network-reference/rpc-configuration#taiko-mainnet
          chain: CHAINS.TAIKO,
          name: 'taiko',
          rpc: 'https://rpc.mainnet.taiko.xyz',
          ankr: 'taiko',
        },
        {
          chain: CHAINS.TAIKO_HEKLA,
          name: 'taiko',
          rpc: 'https://rpc.hekla.taiko.xyz',
          ankr: 'taiko_hekla',
        },
        {
          // https://docs.zksync.io/build/connect-to-zksync#mainnet-network-details
          chain: CHAINS.ZKSYNC,
          name: 'zksync',
          rpc: 'https://mainnet.era.zksync.io',
          ankr: 'zksync_era',
          infura: 'zksync-mainnet',
          alchemy: 'zksync-mainnet',
        },
        {
          chain: CHAINS.ZKSYNC_SEPOLIA,
          name: 'zksync-sepolia',
          rpc: 'https://sepolia.era.zksync.dev',
          ankr: 'zksync_era_sepolia',
          infura: 'zksync-sepolia',
          alchemy: 'zksync-sepolia',
        },
        {
          // https://docs.polygon.technology/pos/reference/rpc-endpoints/#mainnet
          chain: CHAINS.POLYGON_POS,
          name: 'polygon',
          rpc: 'https://polygon-rpc.com/',
          ankr: 'polygon',
          infura: 'polygon-mainnet',
          alchemy: 'polygon-mainnet',
        },
        {
          chain: CHAINS.POLYGON_AMOY,
          name: 'polygon-amoy',
          rpc: 'https://rpc-amoy.polygon.technology/',
          ankr: 'polygon_amoy',
          infura: 'polygon-amoy',
          alchemy: 'polygon-amoy',
        },
        {
          // https://docs.polygon.technology/zkEVM/get-started/quick-start/#manually-add-network-to-wallet
          chain: CHAINS.POLYGON_ZKEVM,
          name: 'zkevm',
          rpc: 'https://zkevm-rpc.com',
          ankr: 'polygon_zkevm',
          alchemy: 'polygonzkevm-mainnet',
        },
        {
          chain: CHAINS.POLYGON_ZKEVM_CARDONA,
          name: 'zkevm-cardona',
          rpc: 'https://rpc.cardona.zkevm-rpc.com',
          ankr: 'polygon_zkevm_cardona',
          alchemy: 'polygonzkevm-cardona',
        },
        {
          // https://docs.linea.build/developers/quickstart/info-contracts
          chain: CHAINS.LINEA,
          name: 'linea',
          rpc: 'https://rpc.linea.build',
          infura: 'linea-mainnet',
          //alchemy: 'linea-mainnet', // 20240901: eth_getProof doesn't work
        },
        {
          chain: CHAINS.LINEA_SEPOLIA,
          name: 'linea-sepolia',
          rpc: 'https://rpc.sepolia.linea.build',
          infura: 'linea-sepolia',
          alchemy: 'linea-sepolia',
        },
        {
          // https://docs.frax.com/fraxtal/network/network-information#fraxtal-mainnet
          chain: CHAINS.FRAXTAL,
          name: 'fraxtal',
          rpc: 'https://rpc.frax.com',
          //alchemy: 'frax-mainnet', // 20240901: eth_getProof doesn't work
        },
        {
          // https://docs.zora.co/zora-network/network#zora-network-mainnet
          chain: CHAINS.ZORA,
          name: 'zora',
          rpc: 'https://rpc.zora.energy',
          alchemy: 'zora-mainnet',
        },
        {
          // https://docs.blast.io/building/network-information#blast-mainnet
          chain: CHAINS.BLAST,
          name: 'blast',
          rpc: 'https://rpc.blast.io',
          ankr: 'blast',
          infura: 'blast-mainnet',
          alchemy: 'blast-mainnet',
        },
      ] satisfies ChainInfo[]
    )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((x) => [x.chain, x])
  );
  
  export function chainName(chain: Chain): string {
    const info = CHAIN_MAP.get(chain);
    if (!info) return 'unknown';
    return `${info.name}<${chain}>`;
  }
  
  export function providerURL(chain: Chain): string {
    const info = CHAIN_MAP.get(chain);
    if (!info) throw new Error(`unknown provider: ${chain}`);
    // 20240830: so far, alchemy has the best support
    let apiKey = process.env.ALCHEMY_KEY;
    if (apiKey && info.alchemy) {
      return `https://${info.alchemy}.g.alchemy.com/v2/${apiKey}`;
    }
    apiKey = process.env.ANKR_KEY;
    if (apiKey && info.ankr) {
      return `https://rpc.ankr.com/${info.ankr}/${apiKey}`;
    }
    apiKey = process.env.INFURA_KEY;
    if (apiKey && info.infura) {
      return `https://${info.infura}.infura.io/v3/${apiKey}`;
    }
    return info.rpc;
  }

export function createProvider(chain: Chain): Provider {

    const fr = new FetchRequest(providerURL(chain));
    fr.timeout = 15000; // 5 minutes is too long
    //fr.setThrottleParams({ maxAttempts: 20 });
    return new JsonRpcProvider(fr, chain, {
      staticNetwork: true,
    });
  }
  
  export function createProviderPair(
    a: Chain | ChainPair,
    b?: Chain
  ): ProviderPair {
    if (typeof a !== 'bigint') {
      b = a.chain2;
      a = a.chain1;
    } else if (!b) {
      // if only 1 chain is provided => (mainnet, chain)
      b = a;
      a = CHAINS.MAINNET;
    }
    return {
      provider1: createProvider(a),
      provider2: createProvider(b),
    };
  }

  

const config = OPFaultRollup.mainnetConfig;
const rollup = await OPFaultRollup.create(
    createProviderPair(config),
    config
);
const gateway = new Gateway(rollup);
const commit = await gateway.getLatestCommit();

//const gateway = new Gateway(rollup);
//const ccip = await serve(gateway, { protocol: 'raw' });

const GATEWAY_URL = 'https://op-gateway.unruggable.com/';
const foundry = await Foundry.launch({
  fork: providerURL(config.chain1),
  procLog  : true,
  infoLog  : true,
});


const deployerWallet = foundry.wallets.admin;

const gameFinderName = 'FixedOPFaultGameFinder';
let gameFinderArgs = [Number(commit.index)];


/*const gameFinder = await foundry.deploy({
    import: `@unruggable/gateways/contracts/op/OPFaultGameFinder.sol`,
    args: [],
});
*/


const verifier = await foundry.deploy({
    file: `OPFaultVerifier`,
    args: ["0x00"],
});

/*
const proxy = await foundry.deploy({
    import: `@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol`,
    args: [verifier.target, deployerWallet.address, '0x'],
});

await foundry.confirm(
    proxy.setGatewayURLs(['https://op-gateway.unruggable.com/'])
);
console.log(await proxy.gatewayURLs());
  
await foundry.confirm(proxy.setWindow(rollup.defaultWindow));


//[GATEWAY_URL], rollup.defaultWindow, rollup.L2OutputOracle

const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const NODE = ethers.namehash('opdemo.eth');
const SLOT = solidityFollowSlot(0, NODE) + 1n;

const opL1Resolver = await foundry.deploy({
  file: 'OPResolver',
  args: [ENS, verifier],
});

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
  if (!resolver) throw new Error('bug');
  const [address, texts] = await Promise.all([
    resolver.getAddress(coinType),
    Promise.all(keys.map((x) => resolver.getText(x))),
  ]);
  console.log({
    name,
    address,
    texts: Object.fromEntries(keys.map((x, i) => [x, texts[i]])),
  });
}

await resolve('opdemo.eth');*/
await foundry.shutdown();