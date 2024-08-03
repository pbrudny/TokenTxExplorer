const { Web3 } = require('web3');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

async function getBlockNumberAtDate(dateString) {
  const date = new Date(dateString);
  const timestamp = BigInt(Math.floor(date.getTime() / 1000)); // Convert to BigInt

  // Initial block range for binary search
  let lowerBlock = BigInt(0);
  let upperBlock = BigInt(await web3.eth.getBlockNumber());

  while (lowerBlock <= upperBlock) {
    const middleBlock = (lowerBlock + upperBlock) / BigInt(2); // Use BigInt division
    const block = await web3.eth.getBlock(Number(middleBlock)); // Convert BigInt to Number

    if (BigInt(block.timestamp) < timestamp) {
      lowerBlock = middleBlock + BigInt(1);
    } else {
      upperBlock = middleBlock - BigInt(1);
    }
  }

  // Adjusting to find the exact block just before the date
  const block = await web3.eth.getBlock(Number(lowerBlock));
  return BigInt(block.timestamp) < timestamp ? Number(lowerBlock) : Number(lowerBlock - BigInt(1));
}

// Earliest block known so far
async function findCreationBlock(fromBlock) {
  try {
    const code = await web3.eth.getCode(tokenAddress);
    if (code === '0x') {
      console.log('The contract does not exist.');
      return;
    }

    let creationBlock = null;
    let found = false;

    let emptyBlocksCount = 0;

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
        console.log(logs.length + ' token logs found');
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
        console.log('Empty blocks:', emptyBlocksCount);
        emptyBlocksCount++;
      }

      if (emptyBlocksCount > 20) {
        console.log('Too many empty blocks. Try with a later date. Exiting...');
        break;
      }

      fromBlock = startBlock - 1;
    }

    if (creationBlock) {
      console.log(`The ERC-20 token was created in block number: ${creationBlock}`);
      return creationBlock;
    } else {
      console.log('Unable to find the contract creation transaction.');
    }
  } catch (error) {
    console.error('Error fetching contract creation block:', error);
  }
}

async function getEarlyLogs(creationBlock, logsCount = 100) {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: creationBlock,
      toBlock: creationBlock + 300,
      address: tokenAddress,
      topics: [transferEventSignature]
    });

    const logData =
      logs.slice(0, logsCount).map(log => {
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
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

//"2020-08-01T00:00:00Z"
async function main(startDate) {
  try {
    console.log('Token address:', tokenAddress);
    console.log('* Fetching ETH block number for date ', startDate);
    const blockNumber = await getBlockNumberAtDate(startDate);
    console.log(`${startDate} block number: ${blockNumber}`);
    console.log('* Searching for contract creation block...', tokenAddress);
    const creationBlock = await findCreationBlock(blockNumber);
    await getEarlyLogs(creationBlock);
  } catch (error) {
    console.error('Error fetching block number:', error);
  }
}

// Read start date from command-line arguments
const startDate = process.argv[2] || "2023-08-01T00:00:00Z";
main(startDate);
