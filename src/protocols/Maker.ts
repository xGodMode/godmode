import { BigNumberish } from '@ethersproject/bignumber';

import { EIP155_KOVAN, EIP155_MAINNET } from '../common/networks';
import { Contract, TransactionReceipt } from '../common/interfaces';
import { extractContract } from '../common/utils';
import { GM } from '../gm';

import { Addresses, Protocol } from './interfaces';

export const MakerAddresses: Addresses = {
    Dai: {
        [EIP155_MAINNET.toString()]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        [EIP155_KOVAN.toString()]: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    },
};

export class Maker extends Protocol {
    public readonly name = 'Maker';
    public readonly addresses: Addresses = MakerAddresses;

    private gmDai: Contract;

    constructor(config: { gm: GM; compiledContracts: any } | null) {
        super(config);

        if (this.available) {
            this.gmDai = extractContract(config.compiledContracts, 'GMDai');
        }
    }

    public async mintDai(
        recipient: string,
        amount: BigNumberish
    ): Promise<TransactionReceipt> {
        this.throwIfNotAvailable();
        const address = this.getAddress('Dai');
        return (await this.gm.execute(
            address,
            this.gmDai.abi,
            this.gmDai.runtimeBytecode,
            'mint',
            { args: [recipient, amount] }
        )) as TransactionReceipt;
    }
}
