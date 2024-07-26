const { Web3 } = require('web3');
const axios = require('axios');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// ERC-20 Token Transfer Event Signature
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

async function getBlockCount() {
  try {
    // Fetch the latest block number
    const latestBlock = await web3.eth.getBlockNumber();
    console.log('Latest Block:', latestBlock);

  } catch (error) {
    console.error('Error fetching block count:', error);
  }
}

getBlockCount();

async function getFirstThreeLogs() {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: '0x1041A59',
      toBlock: '0x1045ACF',
      address: tokenAddress,
      topics: [transferEventSignature]
    });
    const first20Logs = logs.slice(0, 3);

    first20Logs.forEach(log => {
      // Decode the log data
      const decodedLog = web3.eth.abi.decodeLog([
        {
          type: 'address',
          name: 'from',
          indexed: true
        },
        {
          type: 'address',
          name: 'to',
          indexed: true
        },
        {
          type: 'uint256',
          name: 'value'
        }
      ], log.data, [log.topics[1], log.topics[2]]);


      console.log(`Transaction Hash: ${log.transactionHash}`);
      console.log(`From: ${decodedLog.from}`);
      console.log(`To: ${decodedLog.to}`);
      console.log(`Value: ${web3.utils.fromWei(decodedLog.value, 'ether')} tokens`);
      console.log(`Block Number: ${log.blockNumber}`);
      console.log('-----------------------------------');
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

getFirstThreeLogs();
