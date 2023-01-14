const { ethers } = require('hardhat');

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();
  const Gov = await ethers.getContractFactory('Gov');
  const Token = await ethers.getContractFactory('Token');
  const TLC = await ethers.getContractFactory('TLC');

  const token = await Token.deploy(
    'Gov Token',
    'GT',
    '10000000000000000000000'
  );

  const minDelay = 1;
  const proposers = [otherAccount.address];
  const executors = [otherAccount.address];

  const tlc = await TLC.deploy(minDelay, proposers, executors);
  const TokenAddress = token.address;
  const TlcAddress = tlc.address;

  const gov = await Gov.deploy(TokenAddress, TlcAddress);
  await token.deployed();
  await gov.deployed();
  await tlc.deployed();

  console.log(`deployed to ${gov.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
