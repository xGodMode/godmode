require('dotenv').config();
import ganache from 'godmode-ganache-core';

export const ganacheServer = (fork?: string) =>
    ganache.server({
        mnemonic:
            'note flavor live ripple hold salute future drum robot book captain acoustic',
        total_accounts: 10,
        debug: true,
        fork: process.env.INFURA_MAINNET_URL
    });
