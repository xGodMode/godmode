# Godmode for Test

This library provides a truffle framework friendly api that allows developers to use the "Godmode Ganache" within the javascript testing environment provided in the truffle framework. The library also precompiles Godmode contracts for popular defi projects such as MakerDao, Uniswap, and Compound. It provides an easy way to modify the state of the projects through a set of API. 

When using this library, you would need to run the Godmode ganache as well. 
* [GODMODE Ganache-cli](https://github.com/martinetlee/godmode-ganache-cli)
* [GODMODE Ganache-core](https://github.com/martinetlee/godmode-ganache-core)

To see a sample project that uses this library, see this repo:
* [GODMODE Sample Project](https://github.com/martinetlee/godmode-sample-project)

## Repositories of the Hackathon Project
* [GODMODE Ganache-cli](https://github.com/martinetlee/godmode-ganache-cli)
* [GODMODE Ganache-core](https://github.com/martinetlee/godmode-ganache-core)
* [GODMODE NodeJSLibrary (This repo)](https://github.com/martinetlee/godmode-for-test/)
* [GODMODE Sample Project](https://github.com/martinetlee/godmode-sample-project)


## Installation

`npm install godmode-for-test`

## Setting it up in the test environment

In the javascript test file, import the library through: 

```javascript
const GM = require("godmode-for-test");
```

Initialize it with the provider, which should be the "Godmode Ganache". 
The first argument indicates the network name -- use `mainnet` if you want to use precompile contracts. 

```javascript
let GODMODE = new GMIT("development", "ws://localhost:8545");
```

## General Interaction

```javascript
await GODMODE.executeAs(
    targetContract, 
    replacementContractArtifact, 
    "function_In_RC", 
    /* some arguments for the function, */ 
    {from: Bob} // Transaction meta info
);
```

Variable explanation: 
* `targetContract` is the deployed contract, for example: 
    * the `hasOwnerShipContract` in `hasOwnerShipContract = await HasOwnerShip.new({ from: Alice });`. 
* `replacementContractArtifact` is the contract artifact produced by truffle, for example:
    * the `HasOwnerShipInstrumented` in `const HasOwnerShipInstrumented = artifacts.require("HasOwnerShipInstrumented");`
* `function_In_RC` is the function that was defined in the replacementContractArtifact.

## Precompiles 

**IMPORTANT: this only works on mainnet fork**


### MakerDao

#### Dai
* mintDai: `await GODMODE.mintDai(Bob, 10000);`
* transferDai
* burnDai

### Uniswap

