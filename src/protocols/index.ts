import { ProtocolError } from '@xgm/error-codes';

import { GM } from '../gm';

import { Compound } from './Compound';
import { Maker } from './Maker';
import { UniswapV2 } from './UniswapV2';

export async function addPresetProtocols(gm: GM): Promise<void> {
    console.log('Adding preset protocols...');

    // Compound
    try {
        const { contracts } = await import(
            '../../build/protocols/Compound.json'
        );
        GM.prototype.Compound = new Compound(gm, contracts);
    } catch (error) {
        GM.prototype.Compound = () => throwProtocolNotAvailable('Compound');
    }

    // Maker
    try {
        const { contracts } = await import('../../build/protocols/Maker.json');
        GM.prototype.Maker = new Maker(gm, contracts);
    } catch (error) {
        GM.prototype.Maker = () => throwProtocolNotAvailable('Maker');
    }

    // UniswapV2
    try {
        const { contracts } = await import(
            '../../build/protocols/UniswapV2.json'
        );
        GM.prototype.UniswapV2 = new UniswapV2(gm, contracts);
    } catch (error) {
        GM.prototype.UniswapV2 = () => throwProtocolNotAvailable('UniswapV2');
    }

    console.log('Done adding preset protocols.');
}

export function throwProtocolNotAvailable(protocolName: string): void {
    throw ProtocolError({
        subCode: 'NA',
        message: `${protocolName} protocol is unavailable. Did you install it?`,
    });
}
