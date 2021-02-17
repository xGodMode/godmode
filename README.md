![GodMode Logo](https://godmode-public-assets.s3.amazonaws.com/godmode_logo.jpg)

# GodMode (Core)

GodMode is a testing tool that allows you to easily modify the state of the Ethereum Virtual Machine. With the power of GodMode you can test the robustness of Ethereum protocols/smart contracts and run simulations.

This library provides a truffle framework friendly API and lets you install pre-compiled GodMode contracts for popular protocols such as MakerDao, Uniswap, and Compound.

[Join our Discord](https://discord.gg/UPpgH2w) to learn more.

## Installation

```sh
npm install --save-dev @xgm/godmode
```

When using this library, you need to run GodMode Ganache CLI as well.

-   [GODMODE Ganache-cli](https://github.com/xGodMode/godmode-ganache-cli)
-   See also: [GODMODE Ganache-core](https://github.com/xGodMode/godmode-ganache-core)

## Usage

### Getting started

To see a sample project that uses this library, see this repo:

-   [GODMODE Sample Project](https://github.com/xGodMode/godmode-sample-project)

### Setting it up in the test environment

In your javascript test file, import the library

```js
const { GM } = require('@xgm/godmode');
```

Initialize it with the **GodMode Ganache** endpoint (referenced above). The first argument indicates the network name -- use `mainnet` if you want to use pre-compiled contracts.

```js
const provider = 'ws://localhost:8545'; // from godmode-ganache-cli
let GODMODE = new GM('dev', provider);
```

### General interactions

```js
await GODMODE.execute(
  targetContract.address, // Address of the deployed contract
  gmContract.abi, // ABI of the GM version of the contract
  gmContract.deployedBytecode, // Runtime bytecode of the GM contract
  "methodName", // Method to call in GM contract
  {
    args: [...], // List of method arguments. Order matters!
    from: txSender // Ethereum address of msg.sender
  }
);
```

### Install pre-compiled protocol contracts

**IMPORTANT: this only works on mainnet fork**

When you install a protocol, all of the contracts for that protocol will be stored in your `build/protocols` directory. This is where godmode will look for them.

-   Install all GM protocols

```sh
npx godmode install --all
```

-   Install protocols from command line

```sh
npx godmode install --protocols Maker Compound UniswapV2
```

-   Install protocols from package.json

```json
"godmode": {
  "protocols": [
    "Maker",
    "Compound",
    "UniswapV2"
  ]
}
```

```sh
npx godmode install
```

#### MakerDao

-   Mint DAI to an address: `await GODMODE.Maker.mintDai(Alex, 10000);`

#### Uniswap

-   Enable Fee collection in UniswapV2: `await GODMODE.UniswapV2.Factory_setFeeTo(Beth);`

#### Compound

-   Give the address cTokens: `await GODMODE.Compound.mintCErc20("0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e", Carl, 100); `

## Testing

Tests are written in [mocha](https://mochajs.org/).

```sh
npm run test
```

## Contributing

Fork this repo and create a descriptive PR.

## Releases

GodMode is in **alpha** so releases may be frequent.
Core devs should create releases after merging in new features by running

`npm run dist && npm run release`

This will ask you for the release version, then automatically create a release and publish it to npm.
