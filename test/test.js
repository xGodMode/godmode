const GMIT = require("../gm.js");
const Dai = artifacts.require("Dai");
// SETUP GMIT
let GODMODE = new GMIT("mainnet", "ws://localhost:8545");

contract("HasOwnerShip GodMode Demo", function(accounts) {
    const Alice = accounts[1];
    const Bob = accounts[2];
    let hasOwnerShipContract;
  
    before(async function() {
        await GODMODE.open();
      
    });
  
    describe("MAINNET FORK ONLY", function(){
      // MAINNET fork only!
      it("GODMODE: mint Dai ", async function(){
        await GODMODE.mintDai(Bob, 10000);
      });    

      it("GODMODE: UnswapV2 Factory enable Fee", async function(){
        await GODMODE.uniswapV2Factory_setFeeTo(Bob);
      });    


      it("GODMODE: UnswapV2 Pair setKLast", async function(){
        //Paxos USDC pair (https://etherscan.io/address/0x3139Ffc91B99aa94DA8A2dc13f1fC36F9BDc98eE#readContract) 
        await GODMODE.uniswapV2Pair_setKLast("0x3139Ffc91B99aa94DA8A2dc13f1fC36F9BDc98eE",100);
      });    


      it("GODMODE: Compound Give an address CToken", async function(){
          // cBAT
          await GODMODE.CToken_giveAddrTokens("0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e", Bob, 100);
      })
    });

    after(async function(){
        await GODMODE.close();
    });
});