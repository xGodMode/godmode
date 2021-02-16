import loadJsonFile from 'load-json-file';
import path from 'path';

import { GM } from '../gm';

import { Compound } from './Compound';
import { Maker } from './Maker';
import { UniswapV2 } from './UniswapV2';

export async function addPresetProtocols(gm: GM): Promise<void> {
    console.log('Adding preset protocols...');
    const protocolsPath = path.join(process.cwd(), 'build/protocols/');

    // Compound
    try {
        const file = path.join(protocolsPath, 'Compound.json');
        const { contracts } = await loadJsonFile<any>(file);
        GM.prototype.Compound = new Compound({
            gm,
            compiledContracts: contracts,
        });
    } catch (error) {
        GM.prototype.Compound = new Compound(null);
    }

    // Maker
    try {
        const file = path.join(protocolsPath, 'Maker.json');
        const { contracts } = await loadJsonFile<any>(file);
        GM.prototype.Maker = new Maker({ gm, compiledContracts: contracts });
    } catch (error) {
        GM.prototype.Maker = new Maker(null);
    }

    // UniswapV2
    try {
        const file = path.join(protocolsPath, 'UniswapV2.json');
        const { contracts } = await loadJsonFile<any>(file);
        GM.prototype.UniswapV2 = new UniswapV2({
            gm,
            compiledContracts: contracts,
        });
    } catch (error) {
        GM.prototype.UniswapV2 = new UniswapV2(null);
    }

    console.log('Done adding preset protocols.');
}
