import ganache from 'ganache-core';

// TODO: Move this to a fixture
export const ganacheServer = (fork?: string) =>
    ganache.server({
        mnemonic:
            'note flavor live ripple hold salute future drum robot book captain acoustic',
        total_accounts: 10,
        debug: true,
        fork, //: <infura_mainnet_url>
    });
