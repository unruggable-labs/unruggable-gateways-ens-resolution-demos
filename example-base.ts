import { Foundry } from '@adraffy/blocksmith';
import { namehash, toBeHex, Contract, Wallet } from 'ethers';
import { type VerifierArgsType, type VerifierLibsType } from './utils';
import { solidityFollowSlot } from '@unruggable/gateways';

const NAME_TO_TEST = "unruggable.eth";

export const runExample = async (
    chainLink: string, 
    verifierPath: string, 
    verifierArgs: VerifierArgsType, 
    verifierLibs: VerifierLibsType,
    exampleContractAddress: string,
) => {

    const foundry = await Foundry.launch({
        fork: chainLink,
        procLog  : true,
        infoLog  : true,
    });
            
    const verifierArgsToUse = typeof verifierArgs === 'function' ? await verifierArgs(foundry) : verifierArgs;
    let verifierLibsToUse: any = typeof verifierLibs === 'function' ? await verifierLibs(foundry) : verifierLibs;

    const vmPath = `@unruggable/contracts/GatewayVM.sol`;

    const GatewayVM = await foundry.deploy({
        import: vmPath,
        args: [],
      });

    verifierLibsToUse = {...verifierLibsToUse, GatewayVM};

    const verifier = await foundry.deploy({
        import: verifierPath,
        args: verifierArgsToUse,
        libs: verifierLibsToUse,
    });
  
    const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const NODE = namehash(NAME_TO_TEST);
    const SLOT = solidityFollowSlot(0, NODE) + 1n;
      
    const resolver = await foundry.deploy({
        file: 'ExampleResolver',
        args: [
            verifier.target, 
            exampleContractAddress
        ],
    });
      
    console.log('Resolver deployment:', resolver.target);
      
    await foundry.provider.send('anvil_setStorageAt', [
        ENS,
        toBeHex(SLOT, 32),
        toBeHex(resolver.target, 32),
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
