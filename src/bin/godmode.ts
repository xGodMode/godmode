import fs from 'fs';
import path from 'path';
import { installer } from '@xgm/contract-library';

import program from 'commander';

interface InstallOptions {
    all: boolean;
    protocols: string;
}

program
    .command('install')
    .option('-a, --all', 'Installs all GM protocols')
    .option('--protocols <list>', 'Space-separated list of GM protocol names')
    .description('Install GM protocols')
    .action(async ({ all, protocols }: InstallOptions) => {
        if (all) {
            await installer();
        } else if (protocols) {
            await installer(protocols.split(' '));
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
                await installer(projectPackageJson.godmode.protocols);
            } catch (error) {
                console.error('Failed to install', error.message);
            }
        }
    });

program.parse(process.argv);
