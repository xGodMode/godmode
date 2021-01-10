import fs from 'fs';
import path from 'path';
import { installer } from '@xgm/contract-library';

import program from 'commander';

interface InstallOptions {
    all: boolean;
    contracts: string;
}

program
    .command('install')
    .option('-a, --all', 'Installs all GM contracts')
    .option('--contracts <list>', 'Space-separated list of GM contract names')
    .description('Install GM smart contracts')
    .action(async ({ all, contracts }: InstallOptions) => {
        if (all) {
            await installer();
        } else if (contracts) {
            await installer(contracts.split(' '));
        } else {
            const projectPackageJsonPath = path.join(
                process.cwd(),
                'package.json'
            );
            try {
                const projectPackageJson = JSON.parse(
                    (
                        await fs.promises.readFile(projectPackageJsonPath)
                    ).toString()
                );
                await installer(projectPackageJson.godmode.contracts);
            } catch (error) {
                console.error('Failed to install', error.message);
            }
        }
    });

program.parse(process.argv);
