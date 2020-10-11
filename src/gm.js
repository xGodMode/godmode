const WebSocketAsPromised = require('websocket-as-promised');
const WebSocket = require('ws');
const Promise = require('promise');
const Web3 = require('web3');

const { GMError } = require('./common/errors');

const CompoundCERC20 = require('../build/contracts/CErc20.json');
const GMDai = require('../gmContractsInfo/gmDai.js');
const GMUniswapV2Factory = require('../build/contracts/UniswapV2Factory.json');
const GMUniswapV2Pair = require('../build/contracts/UniswapV2Pair.json');

const web3 = new Web3();

function GM(network, provider) {
    switch (network) {
        case 'mainnet':
        case 'ropsten':
        case 'rinkeby':
        case 'kovan':
        case 'development':
            break;
        default:
            throw 'Error: invalid network';
    }

    this.provider = provider;
    web3.setProvider(provider);
    this.curRequestId = 1;
    this.network = network;

    // this.uniswapV2Addr = GMIT.uniswapV2AddrMapping[this.network];
    // this.uniswapV2.factory.address = this.uniswapV2Addr['Factory'];

    if (network != 'development') {
        this.makerDao.dai.address = GM.MakerDaoAddrMapping[this.network]['DAI'];
        this.uniswapV2.Factory.address =
            GM.uniswapV2AddrMapping[this.network]['Factory'];
    }
}

GM.prototype.open = async function () {
    try {
        this.wsp = new WebSocketAsPromised(this.provider, {
            createWebSocket: (url) => new WebSocket(url),
            extractMessageData: (event) => event,
            packMessage: (data) => JSON.stringify(data),
            unpackMessage: (data) => JSON.parse(data),
            // attach requestId to message as `id` field
            attachRequestId: (data, requestId) =>
                Object.assign({ id: requestId }, data),
            // read requestId from message `id` field
            extractRequestId: (data) => data && data.id,
        });

        let accounts = await web3.eth.personal.getAccounts();
        this.txSender = accounts[0];

        return this.wsp.open();
    } catch (error) {
        throw new GMError(error, 'Failed to open');
    }
};

GM.prototype.close = async function () {
    this.wsp.close();
};

GM.prototype.unlockAccount = async function (account) {
    var thisRequestId = this.curRequestId;
    this.curRequestId++;
    return this.wsp.sendRequest(
        {
            jsonrpc: '2.0',
            method: 'unlockAccount',
            params: [account],
        },
        { requestId: thisRequestId },
    );
};

// pretty much the same as executeAs

// This function does not expect truffle artifacts, suitable for non-truffle environment
GM.prototype.executeAsRaw = async function (
    targetAddr0x,
    deployedBytecode,
    functionToCall /*, args*/,
) {
    let targetAddr = targetAddr0x.substring(2); // remove 0x
    let replacementCode = deployedBytecode.substring(2); // remove 0x

    //let balance = await GMDaiContract.methods.balanceOf(targetAddr0x).call({from: accounts[0]});
    //console.log(balance);

    // get current code
    let originalCode = await this.getContractCode(targetAddr);

    // change contract code
    await this.putContractCode(targetAddr, replacementCode);

    // execute the functionToCall
    // ref: https://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
    let replacedContract = await replacementContractArtifact.at(targetAddr0x);

    var args = Array.prototype.slice.call(arguments, 3);
    await replacedContract[functionToCall](...args);
    // restore contract code
    await this.putContractCode(targetAddr, originalCode);
};

// This function is expected to work under truffle environment
GM.prototype.executeAs = async function (
    deployedContract,
    replacementContractArtifact,
    functionToCall /*, args*/,
) {
    let targetAddr0x = deployedContract.address;
    let targetAddr = targetAddr0x.substring(2); // remove 0x
    let replacementCode = replacementContractArtifact.deployedBytecode.substring(
        2,
    ); // remove 0x

    //let balance = await GMDaiContract.methods.balanceOf(targetAddr0x).call({from: accounts[0]});
    //console.log(balance);

    // get current code
    let originalCode = await this.getContractCode(targetAddr);

    // change contract code
    await this.putContractCode(targetAddr, replacementCode);

    // execute the functionToCall
    // ref: https://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
    let replacedContract = await replacementContractArtifact.at(targetAddr0x);

    var args = Array.prototype.slice.call(arguments, 3);
    await replacedContract[functionToCall](...args);
    // restore contract code
    await this.putContractCode(targetAddr, originalCode);
};

// for debugging

// check if "Godmode ganache" is present

// this doesnt get response back yet, but in the future we can get one
// from gm ganache and then use this to make sure things are properly connected
GM.prototype.pingGodModeGanache = async function () {
    var thisRequestId = this.curRequestId;
    this.curRequestId++;

    return this.wsp.sendRequest(
        {
            jsonrpc: '2.0',
            method: 'helloWorld',
            params: ['GODMODE_PING'],
        },
        { requestId: thisRequestId },
    );
};

// internal

GM.prototype.putContractCode = async function (contractAddr, value) {
    //ws.send('{"jsonrpc":"2.0","id":1,"method":"putContractCode","params":["'+contractAddr+'", "'+value+'"]}');
    var thisRequestId = this.curRequestId;
    this.curRequestId++;
    return this.wsp.sendRequest(
        {
            jsonrpc: '2.0',
            method: 'putContractCode',
            params: [contractAddr, value],
        },
        { requestId: thisRequestId },
    );
    // .then( response => {
    //   console.log(response);
    // });
};

GM.prototype.getContractCode = async function (contractAddr) {
    var thisRequestId = this.curRequestId;
    this.curRequestId++;

    let response = await this.wsp.sendRequest(
        {
            jsonrpc: '2.0',
            method: 'getContractCode',
            params: [contractAddr],
        },
        { requestId: thisRequestId },
    );

    const processedData = response.result.data.map((x) => parseInt(x));

    processedData[0] = processedData[0].toString(16);

    const reducer = (accumulator, currentValue) => {
        let convert = currentValue.toString(16);
        if (convert.length == 1) convert = '0' + convert;
        return accumulator + convert;
    };

    let code = processedData.reduce(reducer);
    return code;
};

// protocol specific, can put these in separate modules?
// can only be run on mainnet

// MAKERDAO ecosystem
GM.prototype.makerDao = {};
GM.prototype.makerDao.dai = {};

GM.MakerDaoAddrMapping = {
    mainnet: {
        DAI: '6B175474E89094C44Da98b954EedeAC495271d0F',
    },
};
// DAI
GM.prototype.makerDao.dai = async function (targetAddr, amount) {
    var targetContractAddr = '6B175474E89094C44Da98b954EedeAC495271d0F'; //this.makerDao.dai.address;
    var GMDaiContract = new web3.eth.Contract(
        GMDai.abi,
        '0x' + targetContractAddr,
    );

    // get current code
    let originalCode = await this.getContractCode(targetContractAddr);
    // change contract code
    await this.putContractCode(targetContractAddr, GMDai.code);
    // change dai amount (perhaps use mint?)
    await GMDaiContract.methods
        .mint(targetAddr, amount)
        .send({ from: this.txSender });
    // restore contract code
    await this.putContractCode(targetContractAddr, originalCode);
};

GM.prototype.mintDai = GM.prototype.makerDao.dai;

// UNISWAP V2
GM.uniswapV2AddrMapping = {
    mainnet: {
        Factory: '5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        Router: 'f164fC0Ec4E93095b804a4795bBe1e041497b92a',
    },
};

GM.prototype.uniswapV2 = {};
GM.prototype.uniswapV2.Factory = {};
GM.prototype.uniswapV2.Router = {};
GM.prototype.uniswapV2.Pair = {};

GM.prototype.uniswapV2Factory_setFeeTo = async function (_feeTo) {
    var targetContractAddr = '5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'; //this.uniswapV2.Factory.address;
    var targetContract = new web3.eth.Contract(
        GMUniswapV2Factory.abi,
        '0x' + targetContractAddr,
    );

    // get current code
    let originalCode = await this.getContractCode(targetContractAddr);
    // change contract code
    await this.putContractCode(
        targetContractAddr,
        GMUniswapV2Factory.deployedBytecode.substring(2),
    );
    // setFeeTo
    await targetContract.methods.setFeeTo(_feeTo).send({ from: this.txSender });
    // restore contract code
    await this.putContractCode(targetContractAddr, originalCode);
};

// GM.prototype.uniswapV2.Factory.setFeeToSetter = async function(_feeToSetter){
//   var targetContractAddr = "5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";//this.uniswapV2.Factory.address;
//   var compiledContract = GMUniswapV2Factory;
//   var targetContract =  new web3.eth.Contract(compiledContract.abi, "0x"+targetContractAddr);

//   // get current code
//   let originalCode = await this.getContractCode(targetContractAddr);
//   // change contract code
//   await this.putContractCode(targetContractAddr, compiledContract.deployedBytecode.substring(2));
//   // setFeeTo
//   await targetContract.methods.setFeeToSetter(_feeToSetter).send({from: this.txSender});
//   // restore contract code
//   await this.putContractCode(targetContractAddr, originalCode);
// };

GM.prototype.uniswapV2Pair_setKLast = async function (pairAddr, newKLast) {
    var targetContractAddr = pairAddr.substring(2);
    var compiledContract = GMUniswapV2Pair;
    var targetContract = new web3.eth.Contract(
        compiledContract.abi,
        '0x' + targetContractAddr,
    );

    // get current code
    let originalCode = await this.getContractCode(targetContractAddr);
    // change contract code
    await this.putContractCode(
        targetContractAddr,
        compiledContract.deployedBytecode.substring(2),
    );
    // setFeeTo
    await targetContract.methods
        .setKLast(newKLast)
        .send({ from: this.txSender });
    // restore contract code
    await this.putContractCode(targetContractAddr, originalCode);
};

// COMPOUND
GM.compoundAddrMapping = {
    mainnet: {
        Factory: '5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        Router: 'f164fC0Ec4E93095b804a4795bBe1e041497b92a',
    },
};

GM.prototype.compound = {};
GM.prototype.compound.Factory = {};
GM.prototype.compound.CToken = {};

GM.prototype.CToken_giveAddrTokens = async function (
    cTokenAddr,
    targetAddr,
    amount,
) {
    var targetContractAddr = cTokenAddr.substring(2);
    var compiledContract = CompoundCERC20;
    var targetContract = new web3.eth.Contract(
        compiledContract.abi,
        '0x' + targetContractAddr,
    );

    // get current code
    let originalCode = await this.getContractCode(targetContractAddr);
    // change contract code
    await this.putContractCode(
        targetContractAddr,
        compiledContract.deployedBytecode.substring(2),
    );
    // setFeeTo
    await targetContract.methods
        .giveAddrTokens(targetAddr, amount)
        .send({ from: this.txSender });
    // restore contract code
    await this.putContractCode(targetContractAddr, originalCode);
};

module.exports = GM;
