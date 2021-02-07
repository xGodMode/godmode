export { TransactionReceipt } from 'web3-core';

export interface Contract {
    abi: Array<any>;
    runtimeBytecode: string;
}

export type GodModeWsUrl = string;

export type TransactionResult = string | TransactionResultObject;

export interface TransactionResultObject {
    [prop: string]: string;
}
