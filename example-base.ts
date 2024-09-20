import { Foundry } from '@adraffy/blocksmith';
import { namehash, toBeHex, Contract } from 'ethers';
import { type ConfigItem, type VerifierArgsType } from './utils';
import { solidityFollowSlot } from '@unruggable/gateways';

const NAME_TO_TEST = "unruggable.eth";

export const runExample = async (
    chainLink: string, 
    verifierPath: string, 
    verifierArgs: VerifierArgsType, 
    configurationToSet: ConfigItem[],
    exampleContractAddress: string
) => {

    const foundry = await Foundry.launch({
        fork: chainLink,
        procLog  : true,
        infoLog  : true,
    });
      
    const deployerWallet = foundry.wallets.admin;
      
    const verifierArgsToUse = typeof verifierArgs === 'function' ? await verifierArgs(foundry) : verifierArgs;

    //Deploy verifier
    const verifier = await foundry.deploy({
        import: verifierPath,
        args: verifierArgsToUse,
    });
      
    //Deploy proxy
    const proxy = await foundry.deploy({
        import: `@unruggable/lib/openzeppelin-contracts/contracts/proxy/transparent/TransparentUpgradeableProxy.sol`,
        args: [verifier.target, deployerWallet.address, '0x'],
    });
      
    // Instantiate the proxy using the underlying verifier interface
    const proxyUsingInterface = new Contract(
        proxy.target,
        verifier.interface,
        deployerWallet
    );
      
    // Configure the verifier
    for (const config of configurationToSet) {
        await foundry.confirm(proxyUsingInterface[config.setter](config.value));
        console.log(`Set ${config.setter} to ${config.value}`);
    }
      
    const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const NODE = namehash(NAME_TO_TEST);
    const SLOT = solidityFollowSlot(0, NODE) + 1n;
      
    const arbitrumOneResolver = await foundry.deploy({
        file: 'ExampleResolver',
        args: [proxy.target, exampleContractAddress],
    });
      
    console.log('Arbitrum One Resolver deployment:', arbitrumOneResolver.target);
      
    await foundry.provider.send('anvil_setStorageAt', [
        ENS,
        toBeHex(SLOT, 32),
        toBeHex(arbitrumOneResolver.target, 32),
    ]);
    const ens = new Contract(
        ENS,
        ['function resolver(bytes32 node) view returns (address)'],
        foundry.provider
    );
    console.log('Hijacked:', await ens.resolver(NODE));
      
    async function resolve(name: string, keys = ['avatar'], coinType = 60) {
        const resolver = await foundry.provider.getResolver(name);
      
        console.log("Resolver", resolver);
      
        if (!resolver) throw new Error('bug');
        const [address] = await Promise.all([
            resolver.getAddress(coinType)
        ]);
        console.log({
            name,
            address,
        });
    }
      
    await resolve(NAME_TO_TEST);

    await foundry.shutdown();
}
