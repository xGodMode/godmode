const WebSocketAsPromised = require('websocket-as-promised');
const WebSocket = require('ws');
const Promise = require('promise');
var Web3 = require('web3');

// import godmode contract info for common defi projects
var GMDai = require('./gmContractsInfo/gmDai.js');


// Instantiate web3
var web3 = new Web3();

// Uniswap Factory address: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
// mainnetAddr, ropstenAddr, rinkebyAddr, privilidgeBytecode, privilidgeFunctions
// gm.setNetwork("mainnet");
// gm.uniswap.setFeeTo();

// e.g. ("mainnet", "ws://localhost:8545")
function GMIT(network, provider){

  switch(network){
    case 'mainnet':
    case 'ropsten':
    case 'rinkeby':
    case 'kovan':
    break;
    default:
      throw("Error: network not specified");
  }
  var self = this;
  this.provider = provider;
  web3.setProvider(provider);
  this.curRequestId = 1;
  this.network = network;

  // check if "Godmode ganache" is present
  this.pingGodModeGanache = async function(){
    var thisRequestId = this.curRequestId;
    this.curRequestId++;

    var wsp = new WebSocketAsPromised(this.provider, {
      createWebSocket: url => new WebSocket(url),
      extractMessageData: event => event, 
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),      
      attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
      extractRequestId: data => data && data.id,                                  // read requestId from message `id` field
    });
    await wsp.open();
    console.log("connected");
    await wsp.sendRequest({
          jsonrpc: "2.0",
          method: "helloWorld",
          params: ["GODMODE_PING"]
    }, {requestId: thisRequestId}).then(response => {
      console.log(response);
      wsp.close();
    });
  };

  this.putContractCode = async function(contractAddr, value){
    //ws.send('{"jsonrpc":"2.0","id":1,"method":"putContractCode","params":["'+contractAddr+'", "'+value+'"]}');
    var thisRequestId = this.curRequestId;
    this.curRequestId++;

    var wsp = new WebSocketAsPromised(this.provider, {
      createWebSocket: url => new WebSocket(url),
      extractMessageData: event => event, 
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),      
      attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
      extractRequestId: data => data && data.id,                                  // read requestId from message `id` field
    });
    await wsp.open();
    console.log("connected");
    await wsp.sendRequest({
          jsonrpc: "2.0",
          method: "putContractCode",
          params: [contractAddr, value]
    }, {requestId: thisRequestId}).then( response => {
      console.log(response);
      wsp.close();
    });
  };

  this.uniswapV2Addr = GMIT.uniswapV2AddrMapping[this.network];
  this.uniswapV2 = {};
  this.uniswapV2.factory = {};
  this.uniswapV2.factory.address = this.uniswapV2Addr['Factory'];

  this.uniswapV2.factory.setFeeTo = function(newFeeTo){
    self.pingGodModeGanache();

    // get current code

    // change contract code

    // execute setFeeTo

    // restore contract code


  };

  this.uniswapV2.factory.setFeeToSetter = function(newFeeToSetter){
    // get current code

    // change contract code

    // execute setFeeToSetter

    // restore contract code

  };

  this.makerDao = {};
  this.makerDao.dai = {};
  this.makerDao.dai.address = GMIT.MakerDaoAddrMapping[this.network]['DAI'];
  this.makerDao.dai.giveAddrDai = function(targetAddr, amount){
    // get current code

    // change contract code

    // change dai amount (perhaps use mint?)

    // restore contract code

  }
}

GMIT.uniswapV2AddrMapping = {
  'mainnet': {
    'Factory': '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    'Router': '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
  },
  'ropsten': {
    'Factory': '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    'Router': '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
  },
  'rinkeby': {
    'Factory': '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    'Router': '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
  },
  'kovan': {
    'Factory': '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    'Router': '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
  }
};

GMIT.MakerDaoAddrMapping = {
  'mainnet':{
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  }
};


// DAI contract
// 0x6B175474E89094C44Da98b954EedeAC495271d0F
// https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#code

async function main(){
  //module.exports = GMIT;
  let GODMODE = new GMIT("mainnet", "ws://localhost:8545");
  GODMODE.uniswapV2.factory.setFeeTo("0x12345");

  GODMODE.pingGodModeGanache();


  //console.log(GMDai.code);



}


main().then(() => {
      
    })
    .catch(err => {
      console.log(err);
        // Deal with the fact the chain failed
    });