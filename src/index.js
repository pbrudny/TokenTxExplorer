"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = require("web3");
var dotenv_1 = require("dotenv");
var csv_writer_1 = require("csv-writer");
var fs_1 = require("fs");
var path_1 = require("path");
var chalk_1 = require("chalk");
// Load environment variables
dotenv_1.default.config();
var infuraProjectId = process.env.INFURA_PROJECT_ID;
var tokenAddress = process.env.TOKEN_ADDRESS;
if (!infuraProjectId || !tokenAddress) {
    console.error(chalk_1.default.red("INFURA_PROJECT_ID and TOKEN_ADDRESS must be set in the environment variables."));
    process.exit(1);
}
var exportDir = path_1.default.join(process.cwd(), 'exported_files');
createExportDirectory(exportDir);
var web3 = new web3_1.Web3("https://mainnet.infura.io/v3/".concat(infuraProjectId));
var transferEventSignature = web3.utils.sha3('Transfer(address,address,uint256)');
var csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
    path: "".concat(exportDir, "/").concat(tokenAddress, ".csv"),
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
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        console.log(chalk_1.default.green("Created directory: ".concat(dir)));
    }
}
/**
 * Gets the block number at a specific date.
 * @param {string} dateString - The date string in YYYY-MM-DD format.
 * @returns {Promise<number>} - The block number.
 */
function getBlockNumberAtDate(dateString) {
    return __awaiter(this, void 0, void 0, function () {
        var date, timestamp, lowerBlock, upperBlock, _a, middleBlock, block_1, block;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    date = new Date("".concat(dateString, "T00:00:00Z"));
                    timestamp = BigInt(Math.floor(date.getTime() / 1000));
                    lowerBlock = BigInt(0);
                    _a = BigInt;
                    return [4 /*yield*/, web3.eth.getBlockNumber()];
                case 1:
                    upperBlock = _a.apply(void 0, [_b.sent()]);
                    _b.label = 2;
                case 2:
                    if (!(lowerBlock <= upperBlock)) return [3 /*break*/, 4];
                    middleBlock = (lowerBlock + upperBlock) / BigInt(2);
                    return [4 /*yield*/, web3.eth.getBlock(Number(middleBlock))];
                case 3:
                    block_1 = _b.sent();
                    if (BigInt(block_1.timestamp) < timestamp) {
                        lowerBlock = middleBlock + BigInt(1);
                    }
                    else {
                        upperBlock = middleBlock - BigInt(1);
                    }
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, web3.eth.getBlock(Number(lowerBlock))];
                case 5:
                    block = _b.sent();
                    return [2 /*return*/, BigInt(block.timestamp) < timestamp ? Number(lowerBlock) : Number(lowerBlock - BigInt(1))];
            }
        });
    });
}
/**
 * Finds the creation block of the ERC-20 token.
 * @param {number} fromBlock - The starting block number.
 * @returns {Promise<number>} - The creation block number.
 */
function findCreationBlock(fromBlock) {
    return __awaiter(this, void 0, void 0, function () {
        var code, creationBlock, found, emptyBlocksCount, maxEmptyBlocks, blockRange, startBlock, logs, _i, logs_1, log, txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3.eth.getCode(tokenAddress)];
                case 1:
                    code = _a.sent();
                    if (code === '0x') {
                        throw new Error('The contract does not exist.');
                    }
                    creationBlock = null;
                    found = false;
                    emptyBlocksCount = 0;
                    maxEmptyBlocks = 20;
                    _a.label = 2;
                case 2:
                    if (!(!found && fromBlock >= 0)) return [3 /*break*/, 10];
                    blockRange = 500;
                    startBlock = fromBlock - blockRange < 0 ? 0 : fromBlock - blockRange;
                    console.log(chalk_1.default.bold("Searching blocks from ".concat(startBlock, " to ").concat(fromBlock)));
                    return [4 /*yield*/, web3.eth.getPastLogs({
                            fromBlock: startBlock,
                            toBlock: fromBlock,
                            address: tokenAddress
                        })];
                case 3:
                    logs = _a.sent();
                    if (!(logs.length > 0)) return [3 /*break*/, 8];
                    console.log(chalk_1.default.green("-> ".concat(logs.length, " token logs found")));
                    process.stdout.write(chalk_1.default.black('-> Checking logs for contract creation transaction: '));
                    _i = 0, logs_1 = logs;
                    _a.label = 4;
                case 4:
                    if (!(_i < logs_1.length)) return [3 /*break*/, 7];
                    log = logs_1[_i];
                    return [4 /*yield*/, web3.eth.getTransactionReceipt(log.transactionHash)];
                case 5:
                    txReceipt = _a.sent();
                    if (txReceipt.contractAddress && txReceipt.contractAddress.toLowerCase() === tokenAddress.toLowerCase()) {
                        creationBlock = txReceipt.blockNumber;
                        found = true;
                        process.stdout.write(chalk_1.default.green('✔\n')); // Success symbol
                        return [3 /*break*/, 7];
                    }
                    process.stdout.write(chalk_1.default.black('*')); // Failure symbol
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log(' ');
                    return [3 /*break*/, 9];
                case 8:
                    console.log(chalk_1.default.yellow('No token logs found.'));
                    if (++emptyBlocksCount > maxEmptyBlocks) {
                        throw new Error('Too many blocks without a token transaction. Probably token was not created at that time. Try with a later date.');
                    }
                    _a.label = 9;
                case 9:
                    fromBlock = startBlock - 1;
                    return [3 /*break*/, 2];
                case 10:
                    if (creationBlock === null) {
                        throw new Error('Unable to find the contract creation transaction.');
                    }
                    console.log(chalk_1.default.green("The ERC-20 token was created in block number: ".concat(creationBlock)));
                    return [2 /*return*/, creationBlock];
            }
        });
    });
}
/**
 * Fetches early transfer logs of the token and writes them to a CSV file.
 * @param {number} creationBlock - The block number where the token was created.
 * @param {number} logsCount - The number of logs to fetch.
 */
function getEarlyLogs(creationBlock_1) {
    return __awaiter(this, arguments, void 0, function (creationBlock, logsCount) {
        var logs, logData;
        if (logsCount === void 0) { logsCount = 100; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3.eth.getPastLogs({
                        fromBlock: creationBlock,
                        toBlock: creationBlock + 300,
                        address: tokenAddress,
                        topics: [transferEventSignature]
                    })];
                case 1:
                    logs = _a.sent();
                    logData = logs.slice(0, logsCount).map(function (log) {
                        var decodedLog = web3.eth.abi.decodeLog([
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
                    return [4 /*yield*/, csvWriter.writeRecords(logData)];
                case 2:
                    _a.sent();
                    console.log(chalk_1.default.green("CSV logs file has been created at /exported_files/".concat(tokenAddress, ".csv")));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Main function to execute the script.
 * @param {string} startDate - The start date in YYYY-MM-DD format.
 */
function main(startDate) {
    return __awaiter(this, void 0, void 0, function () {
        var blockNumber, creationBlock, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log(chalk_1.default.bold("Token address: ".concat(tokenAddress)));
                    console.log(chalk_1.default.bold("Fetching ETH block number for date: ".concat(startDate)));
                    return [4 /*yield*/, getBlockNumberAtDate(startDate)];
                case 1:
                    blockNumber = _a.sent();
                    console.log(chalk_1.default.green("Found block number: ".concat(blockNumber)));
                    console.log(chalk_1.default.bold("Searching for ".concat(tokenAddress, " token creation block")));
                    return [4 /*yield*/, findCreationBlock(blockNumber)];
                case 2:
                    creationBlock = _a.sent();
                    return [4 /*yield*/, getEarlyLogs(creationBlock)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error(chalk_1.default.red(error_1.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Read start date from command-line arguments
var startDate = process.argv[2] || "2022-11-12";
main(startDate);
