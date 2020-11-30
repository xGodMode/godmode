# GodMode for Test

This library provides a truffle framework friendly api that allows developers to use the "GodMode Ganache" within the javascript testing environment provided in the truffle framework. The library also pre-compiles GodMode contracts for popular defi projects such as MakerDao, Uniswap, and Compound. It provides an easy way to modify the state of the projects through a set of API.

[Join our Discord](https://discord.gg/UPpgH2w) to learn more.

## Installation

`npm install --save-dev @xgm/godmode`

You will also need to [install truffle](https://www.npmjs.com/package/truffle) so godmode can compile its contracts:

`npm install -g truffle`

## Usage

### Getting started

When using this library, you need to run GodMode ganache as well.

- [GODMODE Ganache-cli](https://github.com/xGodMode/godmode-ganache-cli)
- [GODMODE Ganache-core](https://github.com/xGodMode/ganache-core)

To see a sample project that uses this library, see this repo:

- [GODMODE Sample Project](https://github.com/xGodMode/godmode-sample-project)

### Setting it up in the test environment

In your javascript test file, import the library

```js
const GM = require('@xgm/godmode');
```

Initialize it with the provider, which should be the **GodMode Ganache** (referenced above). The first argument indicates the network name -- use `mainnet` if you want to use pre-compiled contracts.

```js
let GODMODE = new GM('development', 'ws://localhost:8545');
```

### General interactions

```javascript
await GODMODE.executeAs(
  targetContract,
  replacementContractArtifact,
  'function_In_RC',
  /* some arguments for the function */
  { from: Bob } // Transaction meta info
);
```

Variable explanation:

- `targetContract` is the deployed contract, for example:
  - the `hasOwnerShipContract` in `hasOwnerShipContract = await HasOwnerShip.new({ from: Alice });`.
- `replacementContractArtifact` is the contract artifact produced by truffle, for example:
  - the `HasOwnerShipInstrumented` in `const HasOwnerShipInstrumented = artifacts.require("HasOwnerShipInstrumented");`
- `function_In_RC` is the function that was defined in the replacementContractArtifact.

### With pre-compiled contracts

**IMPORTANT: this only works on mainnet fork**

#### MakerDao

- Mint DAI to an address: `await GODMODE.mintDai(Bob, 10000);`

#### Uniswap

- Enable Fee collection in UniswapV2: `await GODMODE.uniswapV2Factory_setFeeTo(Bob);`

#### Compound

- Give the address cTokens: `await GODMODE.CToken_giveAddrTokens("0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e", Bob, 100); `

## Testing

Tests are written in [mocha](https://mochajs.org/).

Test the core GM class with `npm run test-core`.
Test GM contract interactions with `npm run test-contracts`.

## Contributing

Fork this repo and create a descriptive PR.

## Releases

GodMode is in **alpha** so releases may be frequent.
Core devs should create releases after merging in new features by running

`npm run release`

This will ask you for the release version, then automatically create a release and publish it to npm.
