import { BigNumberish } from '@ethersproject/bignumber';

import { EIP155_KOVAN, EIP155_MAINNET } from '../common/networks';
import { Contract, extractContract } from '../common/contracts';
import { GM } from '../gm';
import { Addresses, Protocol, getAddressDefault } from './interfaces';

export const UniswapV2Addresses: Addresses = {
    UniswapV2Factory: {
        [EIP155_MAINNET.toString()]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [EIP155_KOVAN.toString()]: '',
    },
};

export class UniswapV2 implements Protocol {
    public name = 'UniswapV2';
    public addresses: Addresses = UniswapV2Addresses;

    private gm: GM;
    private gmUniswapV2Factory: Contract;
    private gmUniswapV2Pair: Contract;

    constructor(gm: GM, compiledContracts: any) {
        this.gm = gm;

        this.gmUniswapV2Factory = extractContract(
            compiledContracts,
            'GMUniswapV2Factory'
        );
        this.gmUniswapV2Pair = extractContract(
            compiledContracts,
            'GMUniswapV2Pair'
        );
    }

    public getAddress(contractName: string): string {
        const network = this.gm.network.toString();
        return getAddressDefault(this, contractName, network);
    }

    public async Factory_setFeeTo(feeRecipient: string): Promise<boolean> {
        const address = this.getAddress('UniswapV2Factory');
        return await this.gm.execute(
            address,
            this.gmUniswapV2Factory.abi,
            this.gmUniswapV2Factory.runtimeBytecode,
            'setFeeTo',
            { args: [feeRecipient] }
        );
    }

    public async Pair_setKLast(pairAddress: string, kLast: BigNumberish) {
        return await this.gm.execute(
            pairAddress,
            this.gmUniswapV2Pair.abi,
            this.gmUniswapV2Pair.runtimeBytecode,
            'setKLast',
            { args: [kLast] }
        );
    }
}
