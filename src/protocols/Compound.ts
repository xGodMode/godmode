import { BigNumberish } from '@ethersproject/bignumber';

import { Contract, TransactionReceipt } from '../common/interfaces';
import { extractContract } from '../common/utils';
import { GM } from '../gm';

import { Addresses, Protocol, getAddressDefault } from './interfaces';

export const CompoundAddresses: Addresses = {};

export class Compound implements Protocol {
    public name = 'Compound';
    public addresses: Addresses = CompoundAddresses;

    private gm: GM;

    private gmCompoundCErc20: Contract;

    constructor(gm: GM, compiledContracts: any) {
        this.gm = gm;

        this.gmCompoundCErc20 = extractContract(compiledContracts, 'GMCErc20');
    }

    public getAddress(contractName: string): string {
        const network = this.gm.network.toString();
        return getAddressDefault(this, contractName, network);
    }

    public async CErc20_giveAddrTokens(
        cErc20Address: string,
        recipient: string,
        amount: BigNumberish
    ): Promise<TransactionReceipt> {
        return (await this.gm.execute(
            cErc20Address,
            this.gmCompoundCErc20.abi,
            this.gmCompoundCErc20.runtimeBytecode,
            'giveAddrTokens',
            { args: [recipient, amount] }
        )) as TransactionReceipt;
    }
}
