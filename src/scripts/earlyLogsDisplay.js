const { Web3 } = require('web3');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// ERC-20 Token Transfer Event Signature
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

// Time calculation 17,108,941
// Earliest without transfer event signature 10569013n
//. Shiba Inu - created Aug 2020 - block number 10570484
// Creation block 10569013n

// Dino - 15649594 month before official creation
// official creation: 15871479
const startBlock = 15948828; // First log block for transfer 15948892n

async function getEarlyLogs() {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: startBlock + 300,
      address: tokenAddress,
      topics: [transferEventSignature]
    });

    const first100Logs = logs.slice(0, 100);

    const logData = first100Logs.map(log => {
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

      return {
        transactionHash: "https://etherscan.io/tx/" + log.transactionHash,
        from: decodedLog.from,
        to: "https://etherscan.io/address/" + decodedLog.to,
        value: web3.utils.fromWei(decodedLog.value, 'ether'),
        blockNumber: log.blockNumber
      };
    });

    // Log the data to the console
    logData.forEach(data => {
      console.log('From:', data.from, 'Block', data.blockNumber, data.transactionHash);
      // console.log('To:', data.to);
      // console.log('Value (tokens):', data.value);
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

getEarlyLogs();
