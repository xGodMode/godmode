import { ProtocolError } from '@xgm/error-codes';

export function throwProtocolNotAvailable(protocolName: string): void {
    throw ProtocolError({
        subCode: 'NA',
        message: `${protocolName} protocol is unavailable. Did you install it?`,
    });
}
