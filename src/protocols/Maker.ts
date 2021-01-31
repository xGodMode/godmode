import { BigNumberish } from '@ethersproject/bignumber';

import { EIP155_KOVAN, EIP155_MAINNET } from '../common/networks';
import { Contract, TransactionReceipt } from '../common/interfaces';
import { extractContract } from '../common/utils';
import { GM } from '../gm';

import { Addresses, Protocol, getAddressDefault } from './interfaces';

export const MakerAddresses: Addresses = {
    Dai: {
        [EIP155_MAINNET.toString()]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        [EIP155_KOVAN.toString()]: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    },
};

export class Maker implements Protocol {
    public name = 'Maker';
    public addresses: Addresses = MakerAddresses;

    private gm: GM;
    private gmDai: Contract;

    constructor(gm: GM, compiledContracts: any) {
        this.gm = gm;

        this.gmDai = extractContract(compiledContracts, 'GMDai');
    }

    public getAddress(contractName: string): string {
        const network = this.gm.network.toString();
        return getAddressDefault(this, contractName, network);
    }

    public async mintDai(
        recipient: string,
        amount: BigNumberish
    ): Promise<boolean> {
        const daiAddress = this.getAddress('Dai');
        return await this.gm.execute(
            daiAddress,
            this.gmDai.abi,
            this.gmDai.runtimeBytecode,
            'mint',
            { args: [recipient, amount] }
        );
    }
}
