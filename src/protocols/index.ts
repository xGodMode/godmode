import { ProtocolError } from '@xgm/error-codes';

import { GM } from '../gm';
import { Compound, Maker, UniswapV2 } from './protocols';

export async function setupProtocols() {
    console.log('Setting up convenience protocol methods...');

    // Compound
    try {
        const { contracts } = await import(
            '../../build/protocols/Compound.json'
        );
        GM.prototype.Compound = new Compound(this, contracts);
    } catch (error) {
        GM.prototype.Compound = () => throwProtocolNotAvailable('Compound');
    }

    // Maker
    try {
        const { contracts } = await import('../../build/protocols/Maker.json');
        GM.prototype.Maker = new Maker(this, contracts);
    } catch (error) {
        GM.prototype.Maker = () => throwProtocolNotAvailable('Maker');
    }

    // UniswapV2
    try {
        const { contracts } = await import(
            '../../build/protocols/UniswapV2.json'
        );
        GM.prototype.UniswapV2 = new UniswapV2(this, contracts);
    } catch (error) {
        GM.prototype.UniswapV2 = () => throwProtocolNotAvailable('UniswapV2');
    }

    console.log('Done setting up convenience protocol methods.');
}

export function throwProtocolNotAvailable(protocolName: string) {
    throw ProtocolError({
        subCode: 'NA',
        message: `${protocolName} protocol is unavailable. Did you install it?`,
    });
}
