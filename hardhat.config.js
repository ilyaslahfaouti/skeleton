require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
// plus aucun require("./scripts/…") ici

const SEPOLIA_URL   = process.env.SEPOLIA_URL;
const PRIVATE_KEY   = process.env.PRIVATE_KEY;

if (!SEPOLIA_URL) throw new Error("SEPOLIA_URL is missing in .env");
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY is missing in .env");

module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [ PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}` ]
    }
  },
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts"
  },
  mocha: { timeout: 40000 }
};
