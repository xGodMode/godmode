import { BigNumberish } from '@ethersproject/bignumber';

import { EIP155_KOVAN, EIP155_MAINNET } from '../common/networks';
import { Contract, TransactionReceipt } from '../common/interfaces';
import { extractContract } from '../common/utils';
import { GM } from '../gm';

import { Addresses, Protocol } from './interfaces';

export const UniswapV2Addresses: Addresses = {
    UniswapV2Factory: {
        [EIP155_MAINNET.toString()]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [EIP155_KOVAN.toString()]: '',
    },
};

// TODO: Add method to get pair address from two token addresses
export class UniswapV2 extends Protocol {
    public readonly name = 'UniswapV2';
    public readonly addresses: Addresses = UniswapV2Addresses;

    private gmUniswapV2Factory: Contract;
    private gmUniswapV2Pair: Contract;

    constructor(config: { gm: GM; compiledContracts: any } | null) {
        super(config);

        if (this.available) {
            this.gmUniswapV2Factory = extractContract(
                config.compiledContracts,
                'GMUniswapV2Factory'
            );
            this.gmUniswapV2Pair = extractContract(
                config.compiledContracts,
                'GMUniswapV2Pair'
            );
        }
    }

    public async Factory_setFeeTo(
        feeRecipient: string
    ): Promise<TransactionReceipt> {
        this.throwIfNotAvailable();
        const address = this.getAddress('UniswapV2Factory');
        return (await this.gm.execute(
            address,
            this.gmUniswapV2Factory.abi,
            this.gmUniswapV2Factory.runtimeBytecode,
            'setFeeTo',
            { args: [feeRecipient] }
        )) as TransactionReceipt;
    }

    public async Pair_setKLast(
        pairAddress: string,
        kLast: BigNumberish
    ): Promise<TransactionReceipt> {
        this.throwIfNotAvailable();
        return (await this.gm.execute(
            pairAddress,
            this.gmUniswapV2Pair.abi,
            this.gmUniswapV2Pair.runtimeBytecode,
            'setKLast',
            { args: [kLast] }
        )) as TransactionReceipt;
    }
}
