import { Wallet } from 'ethers';

export type ConfigItem = {
    getter?: string;
    setter: string;
    value: any;
};

export type VerifierArgsType = any[] | ((smith: any) => Promise<any[]>);
