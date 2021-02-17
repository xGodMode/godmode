import { ProtocolError } from '@xgm/error-codes';

import { GM } from '../gm';

import { throwProtocolNotAvailable } from './utils';

export interface Addresses {
    [contract: string]: { [network: string]: string };
}

export abstract class Protocol {
    public readonly available: boolean = true;

    public abstract readonly name: string;
    public abstract readonly addresses: Addresses;

    protected gm: GM;

    constructor(config: { gm: GM; compiledContracts: any } | null) {
        if (!config) {
            this.available = false;
            return;
        }

        this.gm = config.gm;
    }

    getAddress(contractName: string): string {
        this.throwIfNotAvailable();
        const network = this.gm.network.toString();
        try {
            return this.addresses[contractName][network];
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

    protected throwIfNotAvailable(): void {
        if (!this.available) throwProtocolNotAvailable(this.name);
    }
}
