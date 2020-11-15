import Web3 from 'web3';

export async function accountIsLocked(
    web3: Web3,
    account: string
): Promise<boolean> {
    try {
        await web3.eth.sendTransaction({
            from: account,
            to: account,
            value: 0,
        });
        return false;
    } catch (error) {
        return String(error).includes('signer account is locked');
    }
}
