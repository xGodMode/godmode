import { ChainID } from 'caip';

export const DEV = new ChainID('000:0');
export const EIP155_MAINNET = new ChainID('eip155:1');
export const EIP155_ROPSTEN = new ChainID('eip155:3');
export const EIP155_RINKEBY = new ChainID('eip155:4');
export const EIP155_KOVAN = new ChainID('eip155:42');

export const SupportedNetworks = {
    dev: DEV,
    'ethereum:mainnet': EIP155_MAINNET,
    'ethereum:ropsten': EIP155_ROPSTEN,
    'ethereum:rinkeby': EIP155_RINKEBY,
    'ethereum:kovan': EIP155_KOVAN,
};
