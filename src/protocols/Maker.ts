import { ChainID } from 'caip';
import { BigNumberish } from '@ethersproject/bignumber';
import { ProtocolError } from '@xgm/error-codes';

import { Addresses, Protocol } from './protocol';
import { EIP155_KOVAN, EIP155_MAINNET } from '../common/networks';
import { GM } from '../gm';
import { Contract } from '../common/contracts';

export const MakerAddresses: Addresses = {
    Dai: {
        [EIP155_MAINNET.toString()]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        [EIP155_KOVAN.toString()]: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    },
};

export class Maker implements Protocol {
    public methods = {
        mintDai: Maker.mintDai,
    };

    public static async mintDai(
        gm: GM,
        gmDai: Contract,
        recipient: string,
        amount: BigNumberish
    ): Promise<boolean> {
        const DaiAddress = Maker.getAddress(gm.network, 'Dai');
        return await gm.execute(
            DaiAddress,
            'mint',
            gmDai.abi,
            gmDai.runtimeBytecode,
            { args: [recipient, amount] }
        );
    }

    private static getAddress(network: ChainID, contractName: string): string {
        try {
            return MakerAddresses[network.toString()][contractName];
        } catch (error) {
            if (error instanceof TypeError) {
                throw ProtocolError(
                    this.name,
                    `Failed to retrieve locate for contract (${contractName}) on network (${network})`
                );
            }
        }
    }
}
