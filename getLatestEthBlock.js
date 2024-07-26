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

async function getLatestBlock() {
  try {
    // Fetch the latest block number
    const latestBlockNumber = await web3.eth.getBlockNumber();
    console.log('Latest Block Number:', latestBlockNumber);

    // Fetch the latest block details
    const latestBlock = await web3.eth.getBlock(latestBlockNumber);
    console.log('Latest Block Details:', latestBlock);

  } catch (error) {
    console.error('Error fetching the latest block:', error);
  }
}

getLatestBlock();

