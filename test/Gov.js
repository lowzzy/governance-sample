const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const { network, ethers } = require('hardhat');

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

let description = 'description';

describe('Gov', function () {
  async function deployGovFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // ############################
    // ########## deploy ##########
    // ############################
    const Gov = await ethers.getContractFactory('Gov');
    const Token = await ethers.getContractFactory('Token');
    const TLC = await ethers.getContractFactory('TLC');
    const token = await Token.deploy(
      'GovToken',
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

    // #############################
    // ########## role ############
    // ############################
    const proposerRole = await tlc.PROPOSER_ROLE();
    const executorRole = await tlc.EXECUTOR_ROLE();
    const adminRole = await tlc.TIMELOCK_ADMIN_ROLE();

    await tlc.grantRole(proposerRole, gov.address);
    await tlc.grantRole(executorRole, ADDRESS_ZERO);
    await tlc.revokeRole(adminRole, owner.address);

    // ################################
    // ########### send eth ###########
    // ################################
    await owner.sendTransaction({
      to: gov.address,
      value: ethers.utils.parseEther('10.0'),
    });

    // ################################
    // ########## delegate ############
    // ################################

    await delegate(owner.address, token);

    return { token, gov, owner, otherAccount, tlc };
  }

  async function execute(token, toAddress, gov) {
    const value_ = 100;

    try {
      const des = await generateHash(description);
      const ret = await gov.execute([toAddress], [value_], ['0x'], des);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }
  async function generateHash(str) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
  }

  async function queue(token, toAddress, gov) {
    const value_ = 100;
    try {
      const des = await generateHash(description);
      let ret = await gov.queue([toAddress], [value_], ['0x'], des);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function propose(token, toAddress, gov) {
    const value_ = 100;
    try {
      const propose_ret = await gov.propose(
        [toAddress],
        [value_],
        ['0x'],
        description
      );
      const des = await generateHash(description);
      ret = await gov.hashProposal([toAddress], [value_], ['0x'], des);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function proposalVotes(proposalId, gov) {
    try {
      const ret = await gov.proposalVotes(proposalId);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function getVotes(account, blockNumber, gov) {
    try {
      const ret = await gov.getVotes(account, blockNumber);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function getDeadLine(proposalId, gov) {
    try {
      const ret = await gov.proposalDeadline(proposalId);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function getSnapshot(proposalId, gov) {
    try {
      const ret = await gov.proposalSnapshot(proposalId);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function hasVoted(proposalId, account, gov) {
    try {
      const ret = await gov.hasVoted(proposalId, account);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function getState(proposalId, gov) {
    try {
      const ret = await gov.state(proposalId);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function castVote(proposalId, support, gov) {
    try {
      const ret = await gov.castVote(proposalId, support);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  async function delegate(account, token) {
    try {
      const ret = await token.delegate(account);
      return ret;
    } catch (e) {
      console.log(e);
    }
  }

  describe('Gov', function () {
    it('deploy', async function () {
      const { token, gov, owner, otherAccount } = await loadFixture(
        deployGovFixture
      );

      // ###############################
      // ########### propose ###########
      // ###############################
      let proposalId = await propose(token, owner.address, gov);
      const id_ = proposalId.toString();

      ret = await network.provider.send('hardhat_mine', ['0x4']);

      // ##########################################
      // ############## ここを変える ################
      // ##########################################
      const support = 1; // 賛成
      // const support = 0; // 反対

      // ##############################
      // ########### castVote #########
      // ##############################
      await castVote(id_, support, gov);
      await network.provider.send('hardhat_mine', ['0x10000']);
      // ###########################
      // ########### Queue #########
      // ###########################
      await queue(token, owner.address, gov);

      // ##########################
      // ######## Execute #########
      // ##########################
      await execute(token, owner.address, gov);

      // ========== util methods ↓ ===========

      // console.log('################################');
      // console.log('########## hasVoted ############');
      // console.log('################################');
      // ret = await hasVoted(id_, owner.address, gov);
      // console.log(ret);

      // console.log('######################################');
      // console.log('########## proposal votes ############');
      // console.log('######################################');
      // ret = await proposalVotes(0, gov);
      // console.log(ret);

      // console.log('#############################');
      // console.log('########## state ############');
      // console.log('#############################');
      // ret = await getState(id_, gov);
      // console.log(ret);

      // console.log('###################################');
      // console.log('########## block number ###########');
      // console.log('###################################');
      // blockNumber = await ethers.provider.getBlockNumber();
      // console.log(blockNumber);
    });
  });
});
