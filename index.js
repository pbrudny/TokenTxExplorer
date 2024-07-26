const { Web3 } = require('web3');
const axios = require('axios');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;
const apiKey = process.env.ETHERSCAN_API_KEY;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// ERC-20 Token Transfer Event Signature
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

async function getTransactions() {
  try {
    console.log(await web3.currentProvider);
    // Fetch the latest block number
    const latestBlock = await web3.eth.getDefaultBlock;
    console.log('Latest Block:', latestBlock);
    const txNumber = await web3.eth.getTransactionCount();
    console.log('Transaction Number:', txNumber);

    // const response = await axios.get(url);
    // const transactions = response.data.result;
    // const transactions = await web3.eth.getPastLogs({
    //   fromBlock: latestBlock - 1000,
    //   toBlock: 'latest',
    //   address: tokenAddress,
    //   topics: [transferEventSignature]
    // });


    // // Check if transactions are found
    // if (!transactions || transactions.length === 0) {
    //   console.log('No transactions found for this token.');
    //   return;
    // }

    // Get the first 20 transactions
    // const first20Transactions = transactions.slice(0, 20);
    //
    // first20Transactions.forEach(tx => {
    //   console.log(`Transaction Hash: ${tx.hash}`);
    //   console.log(`From: ${tx.from}`);
    //   console.log(`To: ${tx.to}`);
    //   console.log(`Value: ${web3.utils.fromWei(tx.value, 'ether')} tokens`);
    //   console.log(`Block Number: ${tx.blockNumber}`);
    //   console.log('-----------------------------------');
    // });

  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

getTransactions();
