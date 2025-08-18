import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Deploying JeonseVault contracts to Kaia testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy PropertyOracle first
  console.log("\n📋 Deploying PropertyOracle...");
  const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
  const propertyOracle = await PropertyOracle.deploy();
  await propertyOracle.waitForDeployment();
  const propertyOracleAddress = await propertyOracle.getAddress();
  console.log("✅ PropertyOracle deployed to:", propertyOracleAddress);

  // Deploy ComplianceModule
  console.log("\n🔒 Deploying ComplianceModule...");
  const ComplianceModule = await ethers.getContractFactory("ComplianceModule");
  const complianceModule = await ComplianceModule.deploy();
  await complianceModule.waitForDeployment();
  const complianceModuleAddress = await complianceModule.getAddress();
  console.log("✅ ComplianceModule deployed to:", complianceModuleAddress);

  // Deploy InvestmentPool
  console.log("\n💰 Deploying InvestmentPool...");
  const InvestmentPool = await ethers.getContractFactory("InvestmentPool");
  const investmentPool = await InvestmentPool.deploy();
  await investmentPool.waitForDeployment();
  const investmentPoolAddress = await investmentPool.getAddress();
  console.log("✅ InvestmentPool deployed to:", investmentPoolAddress);

  // Deploy JeonseVault (main contract)
  console.log("\n🏠 Deploying JeonseVault...");
  const JeonseVault = await ethers.getContractFactory("JeonseVault");
  const jeonseVault = await JeonseVault.deploy(
    propertyOracleAddress,
    complianceModuleAddress,
    investmentPoolAddress
  );
  await jeonseVault.waitForDeployment();
  const jeonseVaultAddress = await jeonseVault.getAddress();
  console.log("✅ JeonseVault deployed to:", jeonseVaultAddress);

  // Grant necessary roles
  console.log("\n🔑 Setting up roles and permissions...");
  
  // Grant VAULT_ROLE to JeonseVault in InvestmentPool
  const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"));
  await investmentPool.grantRole(VAULT_ROLE, jeonseVaultAddress);
  console.log("✅ Granted VAULT_ROLE to JeonseVault in InvestmentPool");

  // Grant ORACLE_ROLE and VERIFIER_ROLE to deployer for demo purposes
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
  const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));
  const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"));
  
  await propertyOracle.grantRole(ORACLE_ROLE, deployer.address);
  await propertyOracle.grantRole(VERIFIER_ROLE, deployer.address);
  console.log("✅ Granted ORACLE_ROLE and VERIFIER_ROLE to deployer in PropertyOracle");
  
  await complianceModule.grantRole(VERIFIER_ROLE, deployer.address);
  await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, deployer.address);
  console.log("✅ Granted VERIFIER_ROLE and COMPLIANCE_OFFICER_ROLE to deployer in ComplianceModule");

  // Deploy demo data
  console.log("\n🎭 Setting up demo data...");
  
  // Register demo properties
  await propertyOracle.registerProperty(
    "gangnam-apt-101",
    "서울특별시 강남구 역삼동 101호",
    deployer.address,
    ethers.parseEther("500000000"), // 500M KRW
    0 // Apartment
  );
  
  await propertyOracle.registerProperty(
    "seocho-house-201",
    "서울특별시 서초구 서초동 201호",
    deployer.address,
    ethers.parseEther("800000000"), // 800M KRW
    1 // House
  );
  
  // Verify properties
  await propertyOracle.verifyProperty("gangnam-apt-101");
  await propertyOracle.verifyProperty("seocho-house-201");
  console.log("✅ Demo properties registered and verified");

  // Verify demo user (deployer)
  await complianceModule.verifyUser(
    deployer.address,
    "김철수", // Kim Chul-soo
    ethers.keccak256(ethers.toUtf8Bytes("123456-1234567")), // Hashed ID
    "010-1234-5678",
    "KB국민은행 123-456-789",
    2 // Premium level
  );
  console.log("✅ Demo user verified with Premium compliance level");

  // Summary
  console.log("\n📊 Deployment Summary:");
  console.log("======================");
  console.log("PropertyOracle:", propertyOracleAddress);
  console.log("ComplianceModule:", complianceModuleAddress);
  console.log("InvestmentPool:", investmentPoolAddress);
  console.log("JeonseVault:", jeonseVaultAddress);
  console.log("\n🌐 Network: Kaia Testnet (Kairos)");
  console.log("⛽ Gas used: ~2.5M gas total");
  
  // Save addresses to file
  const addresses = {
    network: "kairos",
    chainId: 1001,
    contracts: {
      PropertyOracle: propertyOracleAddress,
      ComplianceModule: complianceModuleAddress,
      InvestmentPool: investmentPoolAddress,
      JeonseVault: jeonseVaultAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  const path = require('path');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'kairos.json'),
    JSON.stringify(addresses, null, 2)
  );
  
  console.log("\n💾 Contract addresses saved to deployments/kairos.json");
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env.local file with contract addresses");
  console.log("2. Start the frontend with 'npm run dev'");
  console.log("3. Test the demo functionality");
  console.log("4. Submit to Dorahacks platform");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
