//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');

/**
 * @type { import('webpack').Configuration }
 * */
const config = {
    target: 'node', // Node.js-context
    entry: './src/gm.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'gm.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    optimization: {
        minimize: false,
    },
    devtool: 'source-map',
    externals: {
        // Prevent bundling of certain imported packages and instead retrieve these external dependencies at runtime.
        // excluding dependencies from the output bundles.
        // Instead, the created bundle relies on that dependency to be present in the consumer's environment
        web3: 'commonjs2 web3',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.webpack.json',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /^(?:electron)$/ }),
        new webpack.IgnorePlugin({ resourceRegExp: /^(?:swarm-js)$/ }),
    ],
};

module.exports = config;
