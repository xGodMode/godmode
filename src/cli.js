var GM = require('./gm');

async function main() {
  const GODMODE = new GM('development', 'ws://localhost:8545');
  await GODMODE.open();
}

main()
  .then(function () {})
  .catch(function (err) {
    console.error(err);
  });
