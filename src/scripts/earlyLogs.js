const { Web3 } = require('web3');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// ERC-20 Token Transfer Event Signature
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

//burn
// emit Transfer(account, address(0), amount);
// mint
// emit Transfer(address(0), account, amount);

// time calculation 17,108,941

// earliest without transfer event signature 17046105 - for Pepe
// Creation block for Shina Inu 10569013
// Creation block for Dino 15948828
const startBlock = 15948828;

const csvWriter = createCsvWriter({
  path: 'exported_files/'+tokenAddress+'.csv',
  header: [
    { id: 'transactionHash', title: 'Transaction Hash' },
    { id: 'from', title: 'From' },
    { id: 'to', title: 'To' },
    { id: 'value', title: 'Value (tokens)' },
    { id: 'blockNumber', title: 'Block Number' }
  ]
});

async function getEarlyLogs() {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: startBlock + 2000,
      address: tokenAddress,
      topics: [transferEventSignature]
    });
    const first100Logs = logs.slice(0, 200);

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
        from: "https://etherscan.io/address/"+ decodedLog.from,
        to: "https://etherscan.io/address/" + decodedLog.to,
        value: web3.utils.fromWei(decodedLog.value, 'ether'),
        blockNumber: log.blockNumber
      };
    });

    await csvWriter.writeRecords(logData);
    console.log('csv logs file has been created in exported_files');

  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

getEarlyLogs();
