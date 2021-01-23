import { GM } from '../gm';

export interface Addresses {
    [contract: string]: { [network: string]: string };
}

export interface Protocol {
    methods: {
        [name: string]: (
            gm: GM,
            contract: any,
            ...args: any[]
        ) => Promise<boolean>;
    };
}
