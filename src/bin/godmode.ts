import fs from 'fs';
import path from 'path';
import { installer } from '@xgm/contract-library';

import program from 'commander';

program
    .command('install')
    .option('-a, --all', 'Installs all GM contracts')
    .option('--contracts <array>', 'List of GM contract names')
    .description('Install GM smart contracts')
    .action(async ({ all, contracts }) => {
        if (all) {
            await installer();
        } else if (contracts) {
            await installer(contracts);
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
