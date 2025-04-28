// scripts/deploy.js

// 1) On importe Hardhat Runtime Environment
const hre = require("hardhat");

async function main() {
  // 2) On récupère ethers depuis hre
  const ethers = hre.ethers;

  // 3) Récupère les comptes
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 4) Prépare le paramètre unlockTime
  const unlockTime = Math.floor(Date.now() / 1000) + 60; // now + 60s

  // 5) On déploie le contrat Lock
  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, {
    value: ethers.parseEther("0.01"),
  });
  await lock.deployed();

  console.log("Lock deployed to:", lock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
