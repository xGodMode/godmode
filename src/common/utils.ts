import { Contract } from './interfaces';

export function byteLength(message: string): number {
    return Buffer.byteLength(message, 'utf8');
}

export function extractContract(
    contracts: { [key: string]: any },
    gmContractName: string
): Contract {
    const solName = `${gmContractName}.sol`;
    const contract = contracts[solName][gmContractName];
    return {
        abi: contract.abi,
        runtimeBytecode: contract.evm.deployedBytecode.object,
    };
}
