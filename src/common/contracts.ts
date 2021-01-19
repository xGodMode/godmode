import requireDirectory from 'require-directory';
export default requireDirectory(module, '../../build/contracts');

export interface Contract {
    abi: Array<any>;
    runtimeBytecode: string;
}

export function jsonToContract(gmName: string, contractJson: any): Contract {
    const solName = `${gmName}.sol`;
    const contract = contractJson.contracts[solName][gmName];
    return {
        abi: contract.abi,
        runtimeBytecode: contract.evm.deployedBytecode.object,
    };
}
