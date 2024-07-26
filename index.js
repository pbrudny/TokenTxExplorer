const { Web3 } = require('web3');
const axios = require('axios');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// ERC-20 Token Transfer Event Signature
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

async function getFirstThreeLogs() {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: 17044249,
      toBlock: 17057807,
      address: tokenAddress,
      topics: [transferEventSignature]
    });
    const first20Logs = logs.slice(0, 20);

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

async function findCreationBlock() {
  try {
    const code = await web3.eth.getCode(tokenAddress);
    if (code === '0x') {
      console.log('The contract does not exist.');
      return;
    }

    let creationBlock = null;
    let fromBlock = 0;
    let toBlock = await web3.eth.getBlockNumber();
    let found = false;

    while (!found && fromBlock <= toBlock) {
      const blockRange = 1000;
      const endBlock = fromBlock + blockRange > toBlock ? toBlock : fromBlock + blockRange;

      const logs = await web3.eth.getPastLogs({
        fromBlock,
        toBlock: endBlock,
        address: tokenAddress
      });

      if (logs.length > 0) {
        for (const log of logs) {
          const txReceipt = await web3.eth.getTransactionReceipt(log.transactionHash);
          if (txReceipt.contractAddress && txReceipt.contractAddress.toLowerCase() === tokenAddress.toLowerCase()) {
            creationBlock = txReceipt.blockNumber;
            found = true;
            break;
          }
        }
      }

      fromBlock = endBlock + 1;
    }

    if (creationBlock) {
      console.log(`The ERC-20 token was created in block number: ${creationBlock}`);
    } else {
      console.log('Unable to find the contract creation transaction.');
    }
  } catch (error) {
    console.error('Error fetching contract creation block:', error);
  }
}

findCreationBlock();

