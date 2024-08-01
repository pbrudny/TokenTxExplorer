const { Web3 } = require('web3');
require('dotenv').config();

// Load environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;

// Connect to the Ethereum network via Infura
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// Dino - November 2022
// Function to get block number at a specific date
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

async function calculateBlockAtAugust2020() {
  try {
    const blockNumber = await getBlockNumberAtDate("2020-08-01T00:00:00Z");
    console.log(`The block number at August 1, 2020, 00:00:00 UTC is: ${blockNumber}`);
  } catch (error) {
    console.error('Error fetching block number:', error);
  }
}

// calculateBlockAtAugust2020();

async function calculateBlockAtNovember2022() {
  try {
    const blockNumber = await getBlockNumberAtDate("2022-11-01T00:00:00Z");
    console.log(`The block number at November 1, 2022, 00:00:00 UTC is: ${blockNumber}`);
  } catch (error) {
    console.error('Error fetching block number:', error);
  }
}

calculateBlockAtNovember2022();
