const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Probando conexión a Kaia testnet...');
  
  try {
    // Obtener signer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Signer: ${deployer.address}`);
    
    // Verificar balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Verificar red
    const network = await deployer.provider.getNetwork();
    console.log(`🌐 Chain ID: ${network.chainId}`);
    
    // Verificar bloque actual
    const blockNumber = await deployer.provider.getBlockNumber();
    console.log(`📦 Block Number: ${blockNumber}`);
    
    console.log('✅ Conexión exitosa!');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
