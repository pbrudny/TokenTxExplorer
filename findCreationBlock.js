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

//earliest so far 17046105
async function findCreationBlock() {
  try {
    const code = await web3.eth.getCode(tokenAddress);
    if (code === '0x') {
      console.log('The contract does not exist.');
      return;
    }

    let creationBlock = null;
    let fromBlock = 17046105;
    let toBlock = await web3.eth.getBlockNumber();
    let found = false;

    while (!found && fromBlock <= toBlock) {
      const blockRange = 100;
      const endBlock = fromBlock + blockRange > toBlock ? toBlock : fromBlock + blockRange;

      console.log(`Searching for contract transaction between blocks ${fromBlock} and ${endBlock}...`);
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

    // if (creationBlock) {
    //   console.log(`The ERC-20 token was created in block number: ${creationBlock}`);
    // } else {
    //   console.log('Unable to find the contract creation transaction.');
    // }
  } catch (error) {
    console.error('Error fetching contract creation block:', error);
  }
}

findCreationBlock();

