import requireDirectory from 'require-directory';
export default requireDirectory(module, '../../build/contracts');

export interface Contract {
    abi: Array<any>;
    runtimeBytecode: string;
}

export function extractContract(
    protocolJson: any,
    gmContractName: string
): Contract {
    const solName = `${gmContractName}.sol`;
    const contract = protocolJson.contracts[solName][gmContractName];
    return {
        abi: contract.abi,
        runtimeBytecode: contract.evm.deployedBytecode.object,
    };
}
