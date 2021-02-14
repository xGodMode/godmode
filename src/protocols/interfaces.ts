import { ProtocolError } from '@xgm/error-codes';

export interface Addresses {
    [contract: string]: { [network: string]: string };
}

export interface Protocol {
    name: string;
    addresses: Addresses;

    getAddress: (contractName: string) => string;

    [method: string]: any;
}

export interface ProtocolNotAvailable {
    [method: string]: any;
}

export function getAddressDefault(
    protocol: Protocol,
    contractName: string,
    network: string
): string {
    try {
        return protocol.addresses[contractName][network];
    } catch (error) {
        if (error instanceof TypeError) {
            throw ProtocolError({
                subCode: this.name,
                message: `No address available for contract ${contractName} on network ${network}`,
            });
        }
        throw error;
    }
}
