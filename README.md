
# Token Tx Explorer

This project is a standalone application that interacts with the Ethereum blockchain. It fetches the block number for a given date, finds the creation block of a specified ERC-20 token, and retrieves early token transfer logs.

## Features

- Fetch Ethereum block number for a specific date.
- Determine the creation block of an ERC-20 token.
- Retrieve and display early transfer logs of the token.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/pbrudny/TokenTxExplorer.git
   cd TokenTxExplorer
   ```

2. **Install dependencies:**

   Make sure you have Node.js and npm installed. Then, run:

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following content:

   ```env
   INFURA_PROJECT_ID=your_infura_project_id
   TOKEN_ADDRESS=your_erc20_token_address
   ```

## Building the Standalone Application

Use `pkg` to create a standalone executable for your platform.

1. **Install pkg globally:**

   ```bash
   npm install -g pkg
   ```

2. **Build the application:**

   ```bash
   npm run build
   ```

   This will generate executables for Linux, macOS, and Windows in the project directory.

## Usage

To run the application, execute the built binary with a specified date:

```bash
./tokentxexplorer-linux-x64 "2023-08-01T00:00:00Z"
```

Replace the binary name with the one corresponding to your OS.

## Example

```bash
./tokentxexplorer-linux-x64 "2023-08-01T00:00:00Z"
```

This command will print the block number for the date "2023-08-01" and retrieve information about the token creation and early transfer logs.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact [pbrudny@gmail.com].
