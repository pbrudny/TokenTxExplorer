import { Web3 } from 'web3';
import dotenv from 'dotenv';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

const infuraProjectId = process.env.INFURA_PROJECT_ID;
const tokenAddress = process.env.TOKEN_ADDRESS;

if (!infuraProjectId || !tokenAddress) {
  console.error(chalk.red("INFURA_PROJECT_ID and TOKEN_ADDRESS must be set in the environment variables."));
  process.exit(1);
}

const exportDir = path.join(process.cwd(), 'exported_files');
createExportDirectory(exportDir);

const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);
const transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');

const csvWriter = createCsvWriter({
  path: `${exportDir}/${tokenAddress}.csv`,
  header: [
    { id: 'transactionHash', title: 'Transaction Hash' },
    { id: 'from', title: 'From' },
    { id: 'to', title: 'To' },
    { id: 'value', title: 'Value (tokens)' },
    { id: 'blockNumber', title: 'Block Number' }
  ]
});

/**
 * Creates the export directory if it doesn't exist.
 * @param {string} dir - The directory path to create.
 */
function createExportDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dir}`));
  }
}

/**
 * Gets the block number at a specific date.
 * @param {string} dateString - The date string in YYYY-MM-DD format.
 * @returns {Promise<number>} - The block number.
 */
async function getBlockNumberAtDate(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const timestamp = BigInt(Math.floor(date.getTime() / 1000)); // Convert to BigInt

  let lowerBlock = BigInt(0);
  let upperBlock = BigInt(await web3.eth.getBlockNumber());

  while (lowerBlock <= upperBlock) {
    const middleBlock = (lowerBlock + upperBlock) / BigInt(2);
    const block = await web3.eth.getBlock(Number(middleBlock));

    if (BigInt(block.timestamp) < timestamp) {
      lowerBlock = middleBlock + BigInt(1);
    } else {
      upperBlock = middleBlock - BigInt(1);
    }
  }

  const block = await web3.eth.getBlock(Number(lowerBlock));
  return BigInt(block.timestamp) < timestamp ? Number(lowerBlock) : Number(lowerBlock - BigInt(1));
}

/**
 * Finds the creation block of the ERC-20 token.
 * @param {number} fromBlock - The starting block number.
 * @returns {Promise<number>} - The creation block number.
 */
async function findCreationBlock(fromBlock) {
  const code = await web3.eth.getCode(tokenAddress);
  if (code === '0x') {
    throw new Error('The contract does not exist.');
  }

  let creationBlock = null;
  let found = false;
  let emptyBlocksCount = 0;
  const maxEmptyBlocks = 20;

  while (!found && fromBlock >= 0) {
    const blockRange = 500;
    const startBlock = fromBlock - blockRange < 0 ? 0 : fromBlock - blockRange;

    console.log(chalk.bold(`Searching blocks from ${startBlock} to ${fromBlock}`));
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: fromBlock,
      address: tokenAddress
    });

    if (logs.length > 0) {
      console.log(chalk.green(`-> ${logs.length} token logs found`));
      process.stdout.write(chalk.black('-> Checking logs for contract creation transaction: '));
      for (const log of logs) {
        const txReceipt = await web3.eth.getTransactionReceipt(log.transactionHash);
        if (txReceipt.contractAddress && txReceipt.contractAddress.toLowerCase() === tokenAddress.toLowerCase()) {
          creationBlock = txReceipt.blockNumber;
          found = true;
          process.stdout.write(chalk.green('✔\n')); // Success symbol
          break;
        }
        process.stdout.write(chalk.black('*')); // Failure symbol
      }
      console.log(' ');
    } else {
      console.log(chalk.yellow('No token logs found.'));
      if (++emptyBlocksCount > maxEmptyBlocks) {
        throw new Error('Too many blocks without a token transaction. Probably token was not created at that time. Try with a later date.');
      }
    }

    fromBlock = startBlock - 1;
  }

  if (!creationBlock) {
    throw new Error('Unable to find the contract creation transaction.');
  }

  console.log(chalk.green(`The ERC-20 token was created in block number: ${creationBlock}`));
  return creationBlock;
}

/**
 * Fetches early transfer logs of the token and writes them to a CSV file.
 * @param {number} creationBlock - The block number where the token was created.
 * @param {number} logsCount - The number of logs to fetch.
 */
async function getEarlyLogs(creationBlock, logsCount = 100) {
  const logs = await web3.eth.getPastLogs({
    fromBlock: creationBlock,
    toBlock: creationBlock + 300,
    address: tokenAddress,
    topics: [transferEventSignature]
  });

  const logData = logs.slice(0, logsCount).map(log => {
    const decodedLog = web3.eth.abi.decodeLog([
      { type: 'address', name: 'from', indexed: true },
      { type: 'address', name: 'to', indexed: true },
      { type: 'uint256', name: 'value' }
    ], log.data, [log.topics[1], log.topics[2]]);

    return {
      transactionHash: "https://etherscan.io/tx/" + log.transactionHash,
      from: decodedLog.from,
      to: "https://etherscan.io/address/" + decodedLog.to,
      value: web3.utils.fromWei(decodedLog.value, 'ether'),
      blockNumber: log.blockNumber
    };
  });

  await csvWriter.writeRecords(logData);
  console.log(chalk.green(`CSV logs file has been created at /exported_files/${tokenAddress}.csv`));
}

/**
 * Main function to execute the script.
 * @param {string} startDate - The start date in YYYY-MM-DD format.
 */
async function main(startDate) {
  try {
    console.log(chalk.bold(`Token address: ${tokenAddress}`));
    console.log(chalk.bold(`Fetching ETH block number for date: ${startDate}`));
    const blockNumber = await getBlockNumberAtDate(startDate);
    console.log(chalk.green(`Found block number: ${blockNumber}`));
    console.log(chalk.bold(`Searching for ${tokenAddress} token creation block`));
    const creationBlock = await findCreationBlock(blockNumber);
    await getEarlyLogs(creationBlock);
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}

// Read start date from command-line arguments
const startDate = process.argv[2] || "2022-11-12";

main(startDate);
