import { BigNumberish } from '@ethersproject/bignumber';

import { Contract, TransactionReceipt } from '../common/interfaces';
import { extractContract } from '../common/utils';
import { GM } from '../gm';

import { Addresses, Protocol } from './interfaces';

export const CompoundAddresses: Addresses = {};

export class Compound extends Protocol {
    public readonly name = 'Compound';
    public readonly addresses: Addresses = CompoundAddresses;

    private gmCErc20: Contract;

    constructor(config: { gm: GM; compiledContracts: any } | null) {
        super(config);

        if (this.available) {
            this.gmCErc20 = extractContract(
                config.compiledContracts,
                'GMCErc20'
            );
        }
    }

    public async mintCErc20(
        cErc20Address: string,
        recipient: string,
        amount: BigNumberish
    ): Promise<TransactionReceipt> {
        this.throwIfNotAvailable();
        return (await this.gm.execute(
            cErc20Address,
            this.gmCErc20.abi,
            this.gmCErc20.runtimeBytecode,
            'giveAddrTokens',
            { args: [recipient, amount] }
        )) as TransactionReceipt;
    }
}
