const { Web3 } = require('web3');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// ERC-20 Token Transfer Event Signature
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

// Earliest block known so far
async function findCreationBlock() {
  try {
    const code = await web3.eth.getCode(tokenAddress);
    if (code === '0x') {
      console.log('The contract does not exist.');
      return;
    }

    let creationBlock = null;
    let fromBlock = 15958848; // Starting block 15948828
    let toBlock = fromBlock;
    let found = false;

    let emptyBlocks = 0;

    while (!found && fromBlock >= 0) {
      const blockRange = 500;
      const startBlock = fromBlock - blockRange < 0 ? 0 : fromBlock - blockRange;

      console.log(`Searching for contract transaction between blocks ${startBlock} and ${fromBlock}...`);
      const logs = await web3.eth.getPastLogs({
        fromBlock: startBlock,
        toBlock: fromBlock,
        address: tokenAddress
      });

      if (logs.length > 0) {
        console.log(logs.length + 'token logs found');
        for (const log of logs) {
          const txReceipt = await web3.eth.getTransactionReceipt(log.transactionHash);
          if (txReceipt.contractAddress && txReceipt.contractAddress.toLowerCase() === tokenAddress.toLowerCase()) {
            creationBlock = txReceipt.blockNumber;
            found = true;
            break;
          }
        }
      }
      else {
        console.log('Empty blocks:', emptyBlocks);
        emptyBlocks++;
      }

      fromBlock = startBlock - 1;
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
