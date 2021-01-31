export { TransactionReceipt } from 'web3-core';

export interface Contract {
    abi: Array<any>;
    runtimeBytecode: string;
}

export interface TransactionResult {
    [prop: string]: any;
}
